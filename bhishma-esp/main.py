from machine import Pin

dettach_attach_REPL = 1
dettach_attach_REPL and uos.dupterm(None, 1)#to deattach uart0 to repl
from wifiConnect import connect
from mqtt_handle import mqttOperations
from utils import *
import uos
utils = utilities()
if(connect()):# To connect to wifi
    print("Wifi Connection is good!")
    wifi = True
else:
    print("Issue with wifi, please check.")

jsonInputs = utils.jsonHandler()

    
class mqtt_handle:
    def __init__(self):
        pass

obj = mqttOperations(
        client = jsonInputs["client"],
        broker = jsonInputs["broker"],
        port = jsonInputs["port"],
        topic = jsonInputs["topic"],
        REPL_FLAG = dettach_attach_REPL)
obj.executor()
