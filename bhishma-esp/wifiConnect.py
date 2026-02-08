import network
from machine import Pin
from utils import utilities
import time
import gc
gc.collect()
jsonInputs = utilities().jsonHandler()
print("json inputs")
print(jsonInputs)
def connect():
    startTime = time.time()
    wifiConnect = network.WLAN(network.STA_IF)
    wifiConnect.active(1)
    ssid = jsonInputs['ssid']
    password= jsonInputs['password']
    connectionIndicatorPin = Pin(jsonInputs['connectionIndicatorPin'],Pin.OUT)
    connectionIndicatorPin.off()
    if not wifiConnect.isconnected():
        print('connecting to network...')
        #self.file.write("Connecting to network"+str(time.localtime()))
        wifiConnect.connect(ssid, password)
        while not wifiConnect.isconnected():
            if(time.time()-startTime>jsonInputs['connectivityTimeout']):
                break
            time.sleep(0.15)
            print("wait..")
            pass

    if(wifiConnect.isconnected()):
        print('network config:', wifiConnect.ifconfig())
        connectionIndicatorPin.on()
        print("Wifi connected",wifiConnect.ifconfig())        
        return True
    else:
        connectionIndicatorPin.off()
        return False
    
