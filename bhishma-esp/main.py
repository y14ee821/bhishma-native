import gc
import uos
import esp

esp.osdebug(None)
gc.collect()

dettach_attach_REPL = 0
dettach_attach_REPL and uos.dupterm(None, 1)

from utils import utilities
from led_indicator import StatusLed

utils = utilities()
jsonInputs = utils.jsonParams
gc.collect()

connectionIndicatorPin = jsonInputs.get("connectionIndicatorPin", None)
if connectionIndicatorPin is not None:
    connectionIndicatorPin = StatusLed(connectionIndicatorPin)




_setup_pin = jsonInputs.get("setup_button_pin")
if _setup_pin is not None:
    from setup_button import should_enter_setup
    if should_enter_setup(
        _setup_pin,
        hold_ms=jsonInputs.get("setup_button_hold_ms", 3000),
        active_low=jsonInputs.get("setup_button_active_low", True),
        watch_window_ms=jsonInputs.get("setup_button_watch_ms", 10000),
    ):
        from setup_portal import run_setup_portal
        run_setup_portal(
            ap_ssid=jsonInputs.get("ap_setup_ssid", "Bhishma-Setup"),
            ap_password=jsonInputs.get("ap_setup_password", "bhishma123"),
            indicator_led=connectionIndicatorPin,
        )
    gc.collect()

# Load MQTT client before WiFi stack to reduce MemoryError on ESP8266.
print("heap before mqtt:", gc.mem_free())
import mqtt_custom
print("heap after mqtt:", gc.mem_free())
gc.collect()

from wifiConnect import connect
from ping_check import ping_check
import time

connect_to_wifi_and_internet = False
while not connect_to_wifi_and_internet:
    if connect(jsonInputs):
        print("Wifi Connection is good!")
        if ping_check():
            print("Internet Connection is good!")
            connect_to_wifi_and_internet = True
            if connectionIndicatorPin is not None:
                connectionIndicatorPin.on()
        else:
            print("Internet Connection is not good!")
            time.sleep(jsonInputs["wifi_connectivity_repeat_timeout"])
            if connectionIndicatorPin is not None:
                connectionIndicatorPin.off()
    else:
        print(f"Wifi not connected, retrying in {jsonInputs['wifi_connectivity_repeat_timeout']} seconds...")
        time.sleep(jsonInputs["wifi_connectivity_repeat_timeout"])
        if connectionIndicatorPin is not None:
            connectionIndicatorPin.off()

gc.collect()
print("heap before run:", gc.mem_free())

from mqtt_handle import mqttOperations

obj = mqttOperations(
    jsonParams=jsonInputs,
    client=jsonInputs["client"],
    broker=jsonInputs["broker"],
    port=jsonInputs["port"],
    topic=jsonInputs["topic"],
    mqtt_username=jsonInputs.get("mqtt_username"),
    mqtt_password=jsonInputs.get("mqtt_password"),
    ssl=jsonInputs.get("ssl", False),
    connectionIndicatorPin=connectionIndicatorPin,
)
obj.executor()
