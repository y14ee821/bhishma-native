from mqtt_custom import MQTTClient
import time
import gc
gc.collect()
from utils import *
import machine
from machine import Pin
utils = utilities()
class mqttOperations:
    def __init__(self,**kwargs):
      self.inputs = kwargs
      self.jsonParams = utils.jsonHandler()
      
      output_pin_nums = set()
      
      # Initialize output pins from config.json
      self.outputs = {}
      total_outputs = int(self.jsonParams.get("totalOutputs", 0))
      for i in range(1, total_outputs + 1):
          op_key = "op%s" % i
          if op_key in self.jsonParams and self.jsonParams[op_key] != "":
              pin_num = int(self.jsonParams[op_key])
              output_pin_nums.add(pin_num)
              self.outputs[op_key] = machine.Pin(pin_num, machine.Pin.OUT)
              self.outputs[op_key].off()  # Initialize all outputs to OFF
      
      # Cache for output states - updated when we write, used for publishing
      # This avoids reading pins and potential race conditions
      self.output_states_cache = {}
      for op_key in self.outputs:
          self.output_states_cache[op_key] = 0  # All start as OFF
    
      print("Outputs initialized:", self.outputs)
      print(self.inputs)     
    def sub_cb(self,topic, msg):
      gc.collect()
      print((topic, msg))
      if("received" not in str(msg)):
        self.espOutputControl(msg)       
    def connect_and_subscribe(self):
      clientName = self.inputs["client"]+str(time.ticks_ms())
      try:
        gc.collect()
        use_ssl = bool(self.inputs.get("ssl", False))
        # HiveMQ (and most cloud brokers) sit behind a shared TLS frontend,
        # so SNI (server_hostname) is required during the handshake.
        ssl_params = {"server_hostname": self.inputs["broker"]} if use_ssl else {}
        client = MQTTClient(
          clientName,
          self.inputs["broker"],
          port=self.inputs["port"],
          user=self.inputs.get("mqtt_username"),
          password=self.inputs.get("mqtt_password"),
          ssl=use_ssl,
          ssl_params=ssl_params,
        )
        client.set_callback(self.sub_cb)
        client.connect()
        client.subscribe(self.inputs["topic"])
        print('Connected to %s MQTT broker, subscribed to %s topic with client %s' % (self.inputs["broker"], self.inputs["topic"],clientName))
        return client
      except Exception as error:
        print("Error in contacting the broker - %s"%(error))
    def executor(self):
        try:
          client = self.connect_and_subscribe()
        except Exception as error:
          print("Got Error %s, Restarting the MCU"%(error))
          utils.restart_and_reconnect()
        while True:
          gc.collect()
          try:
            new_message = client.check_msg()
            time.sleep_ms(1000)
            # Publish output states to /status in format: ip4:1-ip1:1-ip2:1-ip3:1
            statusString = self._formatOutputStatesAsIP()
            client.publish(self.inputs["topic"]+"/status",statusString)
            gc.collect()
          except Exception as error:
            print("Got Error %s, Restarting the MCU"%(error))
            utils.restart_and_reconnect()

    def _formatOutputStatesAsIP(self):
      """
      Format output states as ip1, ip2, ip3, ip4
      Maps op1->ip1, op2->ip2, op3->ip3, op4->ip4
      Order doesn't matter
      """
      statusString = ""
      
      for op_key in self.output_states_cache:
          # Map op1->ip1, op2->ip2, etc.
          ip_key = op_key.replace("op", "ip")
          statusString = statusString + ip_key + ":" + str(self.output_states_cache[op_key]) + "-"
      
      return statusString[0:len(statusString)-1] if statusString else ""

    def espOutputControl(self, incomingData):
      """
      Control ESP8266 output pins directly based on MQTT message
      Expected message format: "op1:1-op2:0-op3:1-op4:0"
      """
      gc.collect()
      try:
        # Decode the incoming message
        data = incomingData.decode() if isinstance(incomingData, bytes) else str(incomingData)
        print("Received output control data:", data)
        
        # Split by "-" to get individual commands (e.g., "op1:1", "op2:0")
        commands = data.split("-")
        
        for cmd in commands:
          try:
            # Split each command by ":" to get output name and value
            parts = cmd.split(":")
            if len(parts) == 2:
              output_name = parts[0].strip()  # e.g., "op1"
              value = int(parts[1].strip())  # e.g., 1 or 0
              
              # Check if this output exists in our outputs dictionary
              if output_name in self.outputs:
                # Update pin state and cache atomically
                if value == 1:
                  self.outputs[output_name].on()
                  self.output_states_cache[output_name] = 1
                  print("Turned ON:", output_name)
                else:
                  self.outputs[output_name].off()
                  self.output_states_cache[output_name] = 0
                  print("Turned OFF:", output_name)
              else:
                print("Warning: Output", output_name, "not found in configuration")
          except Exception as error:
            print("Error processing command", cmd, ":", error)
            continue
      except Exception as error:
        print("Error in espOutputControl:", error)
