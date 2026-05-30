import gc
import time
import machine
from machine import Pin

gc.collect()


class mqttOperations:
    def __init__(self, **kwargs):
        self.inputs = kwargs
        self.jsonParams = kwargs.get("jsonParams")
        if self.jsonParams is None:
            from utils import utilities
            self.jsonParams = utilities().jsonHandler()

        self.outputs = {}
        total_outputs = int(self.jsonParams.get("totalOutputs", 0))
        for i in range(1, total_outputs + 1):
            op_key = "op%s" % i
            if op_key in self.jsonParams and self.jsonParams[op_key] != "":
                pin_num = int(self.jsonParams[op_key])
                self.outputs[op_key] = machine.Pin(pin_num, machine.Pin.OUT)
                self.outputs[op_key].off()

        self.output_states_cache = {}
        for op_key in self.outputs:
            self.output_states_cache[op_key] = 0

        print("Outputs initialized:", len(self.outputs))

    def sub_cb(self, topic, msg):
        gc.collect()
        print(topic, msg)
        if "received" not in str(msg):
            self.espOutputControl(msg)

    def connect_and_subscribe(self):
        from mqtt_custom import MQTTClient

        clientName = self.inputs["client"] + str(time.ticks_ms())
        user = self.inputs.get("mqtt_username")
        password = self.inputs.get("mqtt_password")
        try:
            gc.collect()
            print("heap mqtt connect:", gc.mem_free())
            print("MQTT broker:", self.inputs["broker"])
            print("MQTT user:", user)
            if not user or not password:
                print("MQTT error: mqtt_username/mqtt_password missing in config.json")
                return None
            use_ssl = bool(self.inputs.get("ssl", False))
            ssl_params = {"server_hostname": self.inputs["broker"]} if use_ssl else {}
            client = MQTTClient(
                clientName,
                self.inputs["broker"],
                port=self.inputs["port"],
                user=user,
                password=password,
                ssl=use_ssl,
                ssl_params=ssl_params,
            )
            client.set_callback(self.sub_cb)
            client.connect()
            client.subscribe(self.inputs["topic"])
            print("MQTT OK:", self.inputs["topic"])
            return client
        except Exception as error:
            err = str(error)
            print("MQTT error:", err)
            if "password" in err or "authorized" in err:
                print("Fix credentials in HiveMQ console + config.json, then redeploy config")
            return None

    def executor(self):
        from utils import utilities
        utils = utilities(self.jsonParams)

        while True:
            client = self.connect_and_subscribe()
            if client is None:
                print("MQTT retry in 30s (no reboot)...")
                time.sleep(30)
                continue
            while True:
                gc.collect()
                try:
                    client.check_msg()
                    time.sleep_ms(1000)
                    statusString = self._formatOutputStatesAsIP()
                    client.publish(self.inputs["topic"] + "/status", statusString)
                    gc.collect()
                except Exception as error:
                    print("Loop error:", error)
                    utils.restart_and_reconnect()

    def _formatOutputStatesAsIP(self):
        statusString = ""
        for op_key in self.output_states_cache:
            ip_key = op_key.replace("op", "ip")
            statusString = statusString + ip_key + ":" + str(self.output_states_cache[op_key]) + "-"
        return statusString[0:len(statusString) - 1] if statusString else ""

    def espOutputControl(self, incomingData):
        gc.collect()
        try:
            data = incomingData.decode() if isinstance(incomingData, bytes) else str(incomingData)
            print("Control:", data)
            for cmd in data.split("-"):
                try:
                    parts = cmd.split(":")
                    if len(parts) != 2:
                        continue
                    output_name = parts[0].strip()
                    value = int(parts[1].strip())
                    if output_name in self.outputs:
                        if value == 1:
                            self.outputs[output_name].on()
                            self.output_states_cache[output_name] = 1
                        else:
                            self.outputs[output_name].off()
                            self.output_states_cache[output_name] = 0
                except Exception as error:
                    print("Cmd error:", cmd, error)
        except Exception as error:
            print("Control error:", error)
