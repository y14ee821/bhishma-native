import React, { useEffect } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import ToggleSwitch from '../components/ToggleSwitch';
import { useDispatch } from 'react-redux';
import { initMQTT } from '../services/mqttService';
import { modifyIE_Machines, updateIE_Mapper } from '../store/deviceControlSlice';
import { useDeviceControlState } from '../reduxstates/deviceControlStates'
import { Button } from 'react-native-web';
import { useNavigation } from "@react-navigation/native";
export const DeviceControl = () => {
  const data =
  {
    "rao": {
      "channels": {
        1: {
          id: 1,
          name: "1",
          currentState: "OFF",
          IE_Name: "rao",
          radioValue: "",
          channelUpdatedTime: ""
        },
        2: {
          id: 2,
          name: "2",
          currentState: "OFF",
          IE_Name: "rao",
          radioValue: "",
          channelUpdatedTime: ""
        },
        3: {
          id: 3,
          name: "3",
          currentState: "OFF",
          IE_Name: "rao",
          radioValue: "",
          channelUpdatedTime: ""
        },
        4: {
          id: 4,
          name: "4",
          currentState: "OFF",
          IE_Name: "rao",
          radioValue: "",
          channelUpdatedTime: ""
        },
      },
      "lastUpdated": "",

      "faulty": "",
      "running": true
    },
    "venky": {
      "channels": {
        1: {
          id: 1,
          name: "1",
          currentState: "OFF",
          IE_Name: "venky",
          radioValue: "",
          channelUpdatedTime: ""
        },
        2: {
          id: 2,
          name: "2",
          currentState: "OFF",
          IE_Name: "venky",
          radioValue: "",
          channelUpdatedTime: ""
        },
      },
      "lastUpdated": "",
      "faulty": "",
      "running": true
    },
  }


  const dispatch = useDispatch();
  const navigation = useNavigation();

  const route = useRoute();
  const { name } = route.params || {};

  useEffect(() => {
    dispatch(modifyIE_Machines(data))
    initMQTT(dispatch);

    console.log("DeviceControl mounted with name:", name);
  }, []);
  const { connectedToBroker, channelStates, IE_Mapper, IE_Info } = useDeviceControlState();
  console.log(connectedToBroker, channelStates, IE_Mapper, IE_Info)
  return (

    <View >
      <View style={styles.buttonWrapper}>
      {Object.keys(IE_Info).map(ie => (
        <View key={ie} >
          <TouchableOpacity
            style={styles.deviceButton}
            onPress={() => navigation.navigate('DeviceControl', { name: ie })}
          >
            <Text style={styles.deviceButtonText}>{ie}</Text>
          </TouchableOpacity>
        </View>
      ))}
      </View>
      <View style={styles.groupContainer}>
        <Text style={styles.machineText}>Machine Name:</Text>
        <View style={styles.flexWrap}>
          {[0, 1, 2, 3].map(i => (
            <ToggleSwitch accessibilityLabel={`${i}-lohit`} key={i} index={i} />
          ))}

        </View>
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
  buttonWrapper: {
    marginVertical: 8,
    marginHorizontal: 4,
    flexDirection: 'row',
    flexWrap: "wrap",
    justifyContent: 'center',
  },
  deviceButton: {
    backgroundColor: '#2563eb', // Indigo-600
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    width: 150,
    height: 150,
    margin: 10,
  },
  deviceButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 50,

  },

});

