import React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { MqttPub } from "../../mqttcomponents/";
import { checkValue } from "../../utils/Utilities";
import {modifyIE_Machines} from "../../store/deviceControlSlice"
export const ChannelCard = ({ item, controlsLength, IE_Info, client, dispatch }) => {
  const [switchValue, setSwitchValue] = React.useState(
    !!IE_Info[item.IE_Name]?.channels[item.name]?.radioValue
  );

  const disabled = IE_Info[item.IE_Name]?.channels[item.name]?.disabled || false;

  const utility = (value) => {
    MqttPub(client, `${item.IE_Name}`, checkValue(item.IE_Name, controlsLength));
    IE_Info[item.IE_Name]["channels"][item.name]["channelUpdatedTime"] = new Date();
    IE_Info[item.IE_Name]["channels"][item.name]["radioValue"] = value ? 1 : 0;
    IE_Info[item.IE_Name]["channels"][item.name]["disabled"] = true;
    dispatch(modifyIE_Machines({ ...IE_Info }));
  };
console.log("Switch ID:", `${item.IE_Name}-${item.name}`)
  return (
    <View key={item.id} style={styles.card} id={`${item.IE_Name}-${item.name}-bc`}>
      <Text style={styles.channelText}>Channel: {item.name || "-"}</Text>
      <Text id={`${item.IE_Name}-${item.name}-current`} style={styles.stateText}>Current State: {item.currentState || "-"}</Text>
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>OFF</Text>
        <Switch
          value={switchValue}
          id={`${item.IE_Name}-${item.name}`}
          accessibilityLabel={`${item.IE_Name}-${item.name}`}
          
          onValueChange={(value) => {
            setSwitchValue(value);
            utility(value);
          }}
          disabled={disabled}
        />
        <View id={`${item.IE_Name}-${item.name}-cursor`}></View>
        <Text style={styles.switchLabel}>ON</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    card: {
        width: 240,
        padding: 16,
        margin: 8,
        backgroundColor: "#fff",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    channelText: {
        fontSize: 20,
        color: "#111827",
        fontWeight: "bold",
        marginBottom: 8,
    },
    stateText: {
        fontSize: 16,
        textAlign: "center",
        color: "#111827",
        fontWeight: "bold",
        marginBottom: 8,
    },
    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
        margin: 16,
    },
    switchLabel: {
        fontSize: 14,
        color: "#111827",
        marginHorizontal: 8,
    },
    errorText: {
        fontSize: 20,
        color: "#dc2626",
        fontWeight: "bold",
        margin: 8,
    },
    groupContainer: {
        margin: 8,
    },
    machineText: {
        fontSize: 20,
        color: "#111827",
        fontWeight: "bold",
        marginBottom: 8,
    },
    flexWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
    },
});
