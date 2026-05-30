import json
import time
import machine


class utilities:
    def __init__(self, config=None):
        self.jsonParams = config if config is not None else self.jsonHandler()

    def jsonHandler(self):
        try:
            with open("config.json") as jsonFilePath:
                return json.load(jsonFilePath)
        except Exception:
            exit()
    def restart_and_reconnect(self):
      print('Failed to connect to MQTT broker. Reconnecting...')
      print("sleeping For %d seconds..."%(self.jsonParams["reconnectTimeout"]))
      time.sleep(self.jsonParams["reconnectTimeout"])
      machine.reset()    
    def opInitialization(self):
        print("entereddd")
        outputPins={}
        totalOps=int(self.jsonParams["totalOutputs"])
        print("totalOps",totalOps)
        for i in range(2):
            print("op%s"%(str(i+1)))
            outputPins["op%s"%(str(i+1))] = machine.Pin(i+1,machine.Pin.OUT)
        print(outputPins)
        return outputPins
    def stringFormatterForJSClient(self,dict_item):
        opString = ""
        for k in dict_item:
            opString = opString+str(k)+":"+str(dict_item[k].value())+"-"
        return opString[0:len(opString)-1]


#log = utilities.logger()