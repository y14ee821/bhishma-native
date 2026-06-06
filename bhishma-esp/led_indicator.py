from machine import Pin


class StatusLed:
    """Connection-status LED wrapper with polarity handling.

    The ESP8266 onboard LED (GPIO2) is wired to VCC and lights when the pin is
    driven LOW (active-low), so the raw pin value is the inverse of what you'd
    expect. This wrapper centralizes that detail: callers just use `on()` to
    mean "lit" and `off()` to mean "dark", regardless of wiring.

    Set active_low=False for a normal external LED wired to GPIO -> resistor ->
    GND.
    """

    def __init__(self, pin_num, active_low=True):
        self._pin = Pin(pin_num, Pin.OUT)
        self._active_low = active_low
        self.off()

    def on(self):
        self._pin.value(0 if self._active_low else 1)

    def off(self):
        self._pin.value(1 if self._active_low else 0)
