import React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { MqttPub, MqttSub } from "../../mqttcomponents/";
import { checkValue } from "../../utils/Utilities";
//import {useDeviceControlState} from "../../reduxstates/deviceControlStates";
import { modifyIE_Machines } from "../../store/deviceControlSlice"
import { ChannelCard } from "./ChannelCard";

//Received Message: ip4:1-ip1:1-ip2:1-ip3:1 on topic: rao/status
export const IOcard = ({ item, client, IE_Info, dispatch }) => {
    //const { IE_Info } = useDeviceControlState();

    React.useEffect(() => {
        MqttSub(client, `${Object.keys(item)}/status`);
    }, [client, item]);

    const utility = (item, controlsLength, value) => {
        MqttPub(client, `${item.IE_Name}`, checkValue(item.IE_Name, controlsLength));
        IE_Info[item.IE_Name]["channels"][item.name]["channelUpdatedTime"] = new Date();
        IE_Info[item.IE_Name]["channels"][item.name]["radioValue"] = value ? 1 : 0;
        IE_Info[item.IE_Name]["channels"][item.name]["disabled"] = true;
        dispatch(modifyIE_Machines(IE_Info ));
    };


    if (item)
        return Object.keys(item).map((group, index) => (
            <React.Fragment key={index}>
                {!IE_Info[group]["running"] && (
                    <Text style={styles.errorText}>
                        unable to communicate to {group}
                    </Text>
                )}
                {IE_Info[group]["running"] && (
                    <View style={styles.groupContainer}>
                        <Text style={styles.machineText}>Machine Name: {group}</Text>
                        <View style={styles.flexWrap}>
                            {Object.keys(item[group]).map((value) => (
                                <ChannelCard
                                    key={item[group][value].id}
                                    item={item[group][value]}
                                    controlsLength={Object.keys(item[group]).length}
                                    IE_Info={IE_Info}
                                    client={client}
                                    dispatch={dispatch}
                                />
                            ))}

                        </View>
                    </View>
                )}
            </React.Fragment>
        ));
    return null;
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
