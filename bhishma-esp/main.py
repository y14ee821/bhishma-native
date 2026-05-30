import gc
import uos
import esp

esp.osdebug(None)
gc.collect()

dettach_attach_REPL = 0
dettach_attach_REPL and uos.dupterm(None, 1)

from utils import utilities

utils = utilities()
jsonInputs = utils.jsonParams
gc.collect()

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
            indicator_pin=jsonInputs.get("connectionIndicatorPin"),
        )
    gc.collect()

# Load MQTT client before WiFi stack to reduce MemoryError on ESP8266.
print("heap before mqtt:", gc.mem_free())
import mqtt_custom
print("heap after mqtt:", gc.mem_free())
gc.collect()

from wifiConnect import connect

if connect(jsonInputs):
    print("Wifi Connection is good!")
else:
    print("Issue with wifi, please check.")

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
)
obj.executor()
