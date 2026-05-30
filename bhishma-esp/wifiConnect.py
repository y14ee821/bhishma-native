import network
from machine import Pin
import time
import gc


def connect(config):
    gc.collect()
    startTime = time.time()
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    ssid = config["ssid"]
    password = config["password"]
    indicator = Pin(config["connectionIndicatorPin"], Pin.OUT)
    indicator.off()
    if not wlan.isconnected():
        print("connecting to network...")
        wlan.connect(ssid, password)
        while not wlan.isconnected():
            if time.time() - startTime > config["connectivityTimeout"]:
                break
            time.sleep(0.15)
            print("wait..")
    if wlan.isconnected():
        print("network config:", wlan.ifconfig())
        indicator.on()
        return True
    indicator.off()
    return False
