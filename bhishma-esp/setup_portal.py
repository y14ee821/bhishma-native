"""
WiFi provisioning portal for the Bhishma ESP device.

Flow:
  1. On boot, main.py asks `should_enter_setup(...)` whether the setup button
     is being held. If yes, it calls `run_setup_portal(...)`.
  2. The ESP brings up its own WiFi access point (e.g. `Bhishma-Setup`).
  3. The user joins that AP from a phone and opens http://192.168.4.1
  4. A small HTML form collects the real home WiFi SSID + password.
  5. Those credentials are merged into config.json under the existing
     "ssid" / "password" keys that wifiConnect.py already reads.
  6. The device reboots and reconnects in STA mode using the new creds.

This module is intentionally dependency-free (stdlib + MicroPython only) so it
can run before any network is available.
"""

import json
import time
import machine
import network

try:
    import usocket as socket
except ImportError:
    import socket

try:
    import uos as os
except ImportError:
    import os


CONFIG_PATH = "config.json"


# ---------------------------------------------------------------------------
# Button trigger
# ---------------------------------------------------------------------------

def should_enter_setup(pin_num, hold_ms=3000, active_low=True,
                       watch_window_ms=10000):
    from setup_button import should_enter_setup as _check
    return _check(pin_num, hold_ms, active_low, watch_window_ms)


# ---------------------------------------------------------------------------
# AP + HTTP form
# ---------------------------------------------------------------------------

def _start_ap(ap_ssid, ap_password):
    """Bring up the temporary setup access point and return its WLAN object."""
    sta = network.WLAN(network.STA_IF)
    sta.active(False)

    ap = network.WLAN(network.AP_IF)
    ap.active(True)
    if ap_password and len(ap_password) >= 8:
        ap.config(essid=ap_ssid, password=ap_password,
                  authmode=network.AUTH_WPA_WPA2_PSK)
    else:
        # Open AP fallback (no password, or password too short for WPA2).
        ap.config(essid=ap_ssid, authmode=network.AUTH_OPEN)

    while not ap.active():
        time.sleep_ms(100)

    print("Setup AP up. SSID='{}', IP={}".format(ap_ssid, ap.ifconfig()[0]))
    return ap


def _urldecode(s):
    s = s.replace("+", " ")
    out = ""
    i = 0
    n = len(s)
    while i < n:
        if s[i] == "%" and i + 2 < n:
            try:
                out += chr(int(s[i + 1:i + 3], 16))
                i += 3
                continue
            except ValueError:
                pass
        out += s[i]
        i += 1
    return out


def _parse_form(body):
    fields = {}
    for pair in body.split("&"):
        if "=" in pair:
            k, v = pair.split("=", 1)
            fields[_urldecode(k)] = _urldecode(v)
    return fields


def _sendall(conn, data):
    """Send full HTTP response; ESP8266 truncates large one-shot conn.send()."""
    view = memoryview(data)
    offset = 0
    send = getattr(conn, "write", conn.send)
    while offset < len(view):
        sent = send(view[offset:offset + 512])
        if not sent:
            break
        offset += sent


_FORM_HTML = (
    b"HTTP/1.0 200 OK\r\n"
    b"Content-Type: text/html\r\n"
    b"Connection: close\r\n\r\n"
    b"<!DOCTYPE html><html><head>"
    b"<meta name='viewport' content='width=device-width,initial-scale=1'>"
    b"<title>WiFi Setup</title></head>"
    b"<body style='font-family:sans-serif;padding:16px;max-width:360px;margin:auto'>"
    b"<h2>Bhishma WiFi Setup</h2>"
    b"<form method='POST' action='/save'>"
    b"<p>WiFi name (SSID)<br>"
    b"<input name='ssid' required maxlength='32' "
    b"style='width:100%;padding:10px;box-sizing:border-box;font-size:16px'></p>"
    b"<p>WiFi password<br>"
    b"<input name='password' type='password' maxlength='63' "
    b"style='width:100%;padding:10px;box-sizing:border-box;font-size:16px'></p>"
    b"<p><button type='submit' "
    b"style='width:100%;padding:12px;font-size:16px'>Save and Restart</button></p>"
    b"</form></body></html>"
)

_DONE_HTML = (
    b"HTTP/1.0 200 OK\r\n"
    b"Content-Type: text/html\r\n"
    b"Connection: close\r\n\r\n"
    b"<!DOCTYPE html><html><body style='font-family:sans-serif;padding:24px'>"
    b"<h2>Saved</h2><p>Restarting. You can close this page.</p></body></html>"
)

_BAD_HTML = (
    b"HTTP/1.0 400 Bad Request\r\n"
    b"Content-Type: text/html\r\n"
    b"Connection: close\r\n\r\n"
    b"<h2>Missing SSID</h2><p><a href='/'>Try again</a></p>"
)


def _save_wifi_creds(ssid, password):
    """Merge ssid + password into config.json without losing other keys.

    Writes to a temp file first and renames so a power-cut mid-write can't
    leave a half-written config that bricks the boot.
    """
    with open(CONFIG_PATH, "r") as f:
        cfg = json.load(f)
    cfg["ssid"] = ssid
    cfg["password"] = password
    tmp = CONFIG_PATH + ".tmp"
    with open(tmp, "w") as f:
        json.dump(cfg, f)
    os.rename(tmp, CONFIG_PATH)
    print("Saved WiFi credentials for SSID:", ssid)


def _read_request(conn, max_bytes=4096):
    """Read an HTTP request (headers + body) up to `max_bytes`."""
    conn.settimeout(5)
    data = b""
    try:
        while b"\r\n\r\n" not in data and len(data) < max_bytes:
            chunk = conn.recv(512)
            if not chunk:
                break
            data += chunk
        header_end = data.find(b"\r\n\r\n")
        if header_end != -1:
            headers = data[:header_end].decode("utf-8", "ignore")
            content_len = 0
            for line in headers.split("\r\n"):
                if line.lower().startswith("content-length:"):
                    try:
                        content_len = int(line.split(":", 1)[1].strip())
                    except ValueError:
                        content_len = 0
                    break
            body = data[header_end + 4:]
            while len(body) < content_len and len(data) < max_bytes:
                chunk = conn.recv(512)
                if not chunk:
                    break
                body += chunk
                data += chunk
    except Exception as e:
        print("read err:", e)
    return data


def run_setup_portal(ap_ssid="Bhishma-Setup", ap_password="bhishma123",
                     indicator_led=None, port=80):
    """Block in AP mode until the user submits WiFi creds, then reboot.

    Args:
        ap_ssid: SSID broadcast by the ESP for the setup phase.
        ap_password: WPA2 password (must be >=8 chars), or "" for open AP.
        indicator_led: optional shared StatusLed instance for a "setup mode"
            indicator (driven solid ON while the portal is up).
        port: HTTP port (default 80).

    This function only returns by way of `machine.reset()` after a successful
    save, so callers should treat it as terminal.
    """
    led = indicator_led
    if led is not None:
        led.on()

    ap = _start_ap(ap_ssid, ap_password)
    print("Join WiFi '{}' and open http://{}".format(ap_ssid, ap.ifconfig()[0]))

    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind(("0.0.0.0", port))
    srv.listen(2)

    saved = False
    while not saved:
        try:
            conn, addr = srv.accept()
        except Exception as e:
            print("accept err:", e)
            continue

        try:
            req = _read_request(conn)
            if not req:
                conn.close()
                continue

            line_end = req.find(b"\r\n")
            request_line = req[:line_end].decode("utf-8", "ignore") if line_end != -1 else ""
            parts = request_line.split(" ")
            method = parts[0] if parts else ""
            path = parts[1] if len(parts) > 1 else "/"

            head_end = req.find(b"\r\n\r\n")
            body = req[head_end + 4:] if head_end != -1 else b""

            if method == "POST" and path.startswith("/save"):
                fields = _parse_form(body.decode("utf-8", "ignore"))
                ssid = (fields.get("ssid") or "").strip()
                password = fields.get("password") or ""
                if not ssid:
                    _sendall(conn, _BAD_HTML)
                else:
                    _save_wifi_creds(ssid, password)
                    _sendall(conn, _DONE_HTML)
                    saved = True
            else:
                _sendall(conn, _FORM_HTML)
        except Exception as e:
            print("handler err:", e)
        finally:
            try:
                conn.close()
            except Exception:
                pass

    try:
        srv.close()
    except Exception:
        pass

    if led is not None:
        led.off()

    print("Restarting to apply new WiFi credentials...")
    time.sleep(2)
    machine.reset()
