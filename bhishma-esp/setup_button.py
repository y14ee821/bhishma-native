import time
from machine import Pin


def should_enter_setup(pin_num, hold_ms=3000, active_low=True, watch_window_ms=10000):
    pull = Pin.PULL_UP if active_low else Pin.PULL_DOWN
    pressed = 0 if active_low else 1
    btn = Pin(pin_num, Pin.IN, pull)
    print("Watching setup button on GPIO", pin_num, "for", watch_window_ms, "ms")
    watch_start = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), watch_start) < watch_window_ms:
        if btn.value() == pressed:
            hold_start = time.ticks_ms()
            while btn.value() == pressed:
                if time.ticks_diff(time.ticks_ms(), hold_start) >= hold_ms:
                    print("Entering WiFi setup mode.")
                    return True
                if time.ticks_diff(time.ticks_ms(), watch_start) >= watch_window_ms + hold_ms:
                    break
                time.sleep_ms(50)
        time.sleep_ms(50)
    print("Setup window expired. Booting normally.")
    return False
