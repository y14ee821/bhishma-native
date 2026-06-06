import socket


def ping_check(host="google.com", port=80, timeout=5):
    """
    Check if the device has working internet connectivity.

    Resolves `host` via DNS and opens a TCP connection to it. This exercises
    both DNS and reachability (a good proxy for being able to reach the MQTT
    broker) without the heap cost of TLS or an HTTP library.

    Returns:
        bool: True if the connection succeeds, False otherwise.
    """
    sock = None
    try:
        addr = socket.getaddrinfo(host, port)[0][-1]
        sock = socket.socket()
        sock.settimeout(timeout)
        sock.connect(addr)
        return True
    except Exception as e:
        print("Error in ping check:", e)
        return False
    finally:
        if sock is not None:
            sock.close()
