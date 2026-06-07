#import wifiConnect
import gc
import uos
import esp

esp.osdebug(None)
gc.collect()


def _init_relays_safe():
    # Drive relay output GPIOs to their safe OFF state as early as possible,
    # before main.py runs any setup/WiFi logic. On active-low relay boards an
    # uninitialized pin leaves the relay energized, so doing this in boot.py
    # prevents relays switching on at every power-up until the app is ready
    # (e.g. while WiFi is down after a power cut).
    #
    # Everything here is local so the config dict is freed on return (boot.py
    # shares globals with main.py, so module-level temporaries would otherwise
    # stay alive for the whole runtime and waste heap before the TLS handshake).
    from machine import Pin
    from utils import utilities

    cfg = utilities().jsonParams
    active_low = bool(cfg.get("relay_active_low", True))
    total_outputs = int(cfg.get("totalOutputs", 0))
    for i in range(1, total_outputs + 1):
        op = cfg.get("op%s" % i)
        if op is None or op == "":
            continue
        pin = Pin(int(op), Pin.OUT)
        # active-low: OFF = pin HIGH (.on()); active-high: OFF = pin LOW (.off())
        if active_low:
            pin.on()
        else:
            pin.off()


try:
    _init_relays_safe()
except Exception as e:
    print("boot relay init error:", e)

gc.collect()
