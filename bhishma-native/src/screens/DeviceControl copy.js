import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView } from 'react-native';

// Example channels
const CHANNELS = [
    { id: 1, name: 'Light' },
    { id: 2, name: 'Fan' },
    { id: 3, name: 'Heater' },
    { id: 4, name: 'AC' },
];

export const DeviceControl = () => {
    const [channelStates, setChannelStates] = useState(
        CHANNELS.reduce((acc, channel) => {
            acc[channel.id] = false;
            return acc;
        }, {})
    );

    const toggleChannel = (id) => {
        setChannelStates((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
        // TODO: Send command to IoT device here
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Device Control</Text>
            {CHANNELS.map((channel) => (
                <View key={channel.id} style={styles.channelRow}>
                    <Text style={styles.channelName}>{channel.name}</Text>
                    <Switch
                        value={channelStates[channel.id]}
                        onValueChange={() => toggleChannel(channel.id)}
                    />
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 24,
        backgroundColor: '#f5f5f5',
        flexGrow: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    channelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        elevation: 2,
    },
    channelName: {
        fontSize: 18,
    },
});






// import React, { useState, useEffect } from "react";
// import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView } from "react-native";
// import mqtt from "mqtt"; // Ensure you use a React Native compatible MQTT library
// import { IOcard } from "../components/card/IOcard";
// import { MqttSub, MqttPub, MqttMessage } from "../mqttcomponents/";
// import { useIEState } from "../context";
// import { IE_Data } from "../services";
// import { useNavigation, useRoute } from "@react-navigation/native";

// export const DeviceControl = ({ ieName }) => {
//   IE_Data(); // IE data context
//   const route = useRoute();
//   const navigation = useNavigation();
//   const productId = route.params?.id ?? "";
//   const { connectedToBroker, channelStates, checkBrokerConnection, modifyIE_Machines, IE_Mapper, IE_Info } = useIEState();
//   const currentIE = route.params?.id;

//   const IE_Names = Object.keys(IE_Info); // gets the machine names
//   const options = {
//     protocol: "wss",
//     keepalive: 600,
//     clean: true,
//     reconnectPeriod: 1000, // ms
//     connectTimeout: 30 * 1000, // ms
//     clientId: "emqx_react_lohit_" + Math.random().toString(16).substring(2, 8),
//   };
//   const url = process.env.REACT_APP_MQTT_HOST;
//   const [client, setClient] = useState(mqtt.connect(url, options));

//   useEffect(() => {
//     client.on("connect", function () {
//       console.log("client Connected", client.connected);
//       checkBrokerConnection(true); // sets connectedToBroker to true
//       setClient(client);
//     });
//     client.on("error", (err) => {
//       checkBrokerConnection(false); // sets connectedToBroker to false
//       console.error("Connection error: ", err);
//       client.end();
//     });
//     client.on("reconnect", () => {
//       checkBrokerConnection(false); // sets connectedToBroker to false
//       console.log("Reconnecting");
//     });
//   }, [client]);

//   const ieEnabler = (IE_Info, ie) => {
//     const timeOut = 5000; // in ms
//     const curTime = new Date();
//     let updatedTime = curTime - new Date(IE_Info[ie.split("/")[0]]["lastUpdated"]);

//     if (updatedTime >= timeOut) {
//       IE_Info[ie.split("/")[0]]["running"] = false;
//       modifyIE_Machines(IE_Info);
//       return false;
//     } else if (IE_Info[ie.split("/")[0]]["lastUpdated"] === "") {
//       IE_Info[ie.split("/")[0]]["running"] = false;
//       modifyIE_Machines(IE_Info);
//     } else {
//       return true;
//     }
//   };

//   useEffect(() => {
//     if (IE_Names.length > 0 && connectedToBroker) {
//       MqttMessage(client); // checks for incoming messages from IEs
//     }
//     if (Object.keys(IE_Info).length !== 0) {
//       const interval = setInterval(() => ieEnabler(IE_Info, currentIE), 10000);
//       return () => clearInterval(interval);
//     }
//   }, [IE_Names, connectedToBroker, IE_Info, currentIE]);

//   function bulkControl(ie_name, state = "", channelCount = null) {
//     let finalString = "";
//     if (state !== "") {
//       channelCount.forEach((c) => (finalString = finalString + "op" + c + ":" + state + "-"));
//     }
//     console.log(finalString.slice(0, finalString.length - 1));
//     MqttPub(client, `${ie_name}`, finalString.slice(0, finalString.length - 1));
//   }

//   const showToast = (message) => {
//     Alert.alert("Status", message);
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <View style={styles.statusContainer}>
//         {connectedToBroker === false ? (
//           <View>
//             <Text style={styles.statusFailed}>Connecting to Server...Hang on!</Text>
//             <Text style={styles.infoText}>
//               It will take mostly 1 minute, if not connected
//             </Text>
//             <TouchableOpacity
//               onPress={() => showToast("Please restart the app to refresh.")}
//               style={styles.refreshButton}
//             >
//               <Text style={styles.buttonText}>Refresh</Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <Text style={styles.statusConnected}>Connected To Server!</Text>
//         )}
//       </View>

//       {connectedToBroker === true && currentIE !== "" && IE_Names.length > 0 && (
//         <View style={styles.cardContainer}>
//           <IOcard
//             key={currentIE}
//             item={{ [currentIE]: IE_Info[currentIE]["channels"] }}
//             client={client}
//           />
//           <View style={styles.buttonGroup}>
//             <TouchableOpacity
//               onPress={() =>
//                 bulkControl(currentIE, "1", Object.keys(IE_Info[currentIE]["channels"]))
//               }
//               style={styles.allOnButton}
//             >
//               <Text style={styles.buttonText}>ALL ON</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               onPress={() =>
//                 bulkControl(currentIE, "0", Object.keys(IE_Info[currentIE]["channels"]))
//               }
//               style={styles.allOffButton}
//             >
//               <Text style={styles.buttonText}>ALL OFF</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//   },
//   statusContainer: {
//     marginBottom: 16,
//   },
//   statusFailed: {
//     color: "white",
//     backgroundColor: "#f87171",
//     padding: 10,
//     borderRadius: 8,
//     textAlign: "center",
//     marginBottom: 8,
//   },
//   statusConnected: {
//     color: "white",
//     backgroundColor: "#34d399",
//     padding: 10,
//     borderRadius: 8,
//     textAlign: "center",
//     marginBottom: 8,
//   },
//   infoText: {
//     fontSize: 16,
//     textAlign: "center",
//     fontWeight: "bold",
//     color: "#111827",
//     marginBottom: 8,
//   },
//   refreshButton: {
//     backgroundColor: "#a78bfa",
//     padding: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   buttonText: {
//     color: "white",
//     fontWeight: "bold",
//   },
//   cardContainer: {
//     borderWidth: 2,
//     borderColor: "#e5e7eb",
//     borderRadius: 8,
//     padding: 8,
//   },
//   buttonGroup: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     padding: 16,
//   },
//   allOnButton: {
//     backgroundColor: "#34d399",
//     padding: 10,
//     borderRadius: 8,
//     marginRight: 8,
//   },
//   allOffButton: {
//     backgroundColor: "#f87171",
//     padding: 10,
//     borderRadius: 8,
//   },
// });