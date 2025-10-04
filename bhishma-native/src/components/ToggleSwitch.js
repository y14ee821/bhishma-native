
import React from 'react';
//import { Switch } from 'react-native-paper';
import { useStore } from 'react-redux';
import { View, Text, Switch, StyleSheet } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { publishToggle } from '../services/mqttService';
import {updatedCurrentUIState} from '../store/deviceControlSlice';


/**
 * ToggleSwitch is a React component for toggling the state of a device channel.
 * It displays the current state (ON/OFF) and allows the user to switch it.
 * The component handles UI feedback, disables the switch during updates, and alerts on failure.
 *
 * @flow
 *
 * @param {Object} props - The component props.
 * @param {number} props.index - The index of the channel to control.
 * @param {string} props.ie_name - The name of the device or interface.
 * @param {Object} props.client - The client object used for publishing toggle events.
 *
 * @returns {React.Node} The rendered ToggleSwitch component.
 */
// ToggleSwitch component definition
// This component renders a toggle switch for a device channel.
// It manages UI state, dispatches Redux actions, and handles MQTT publish events.
const ToggleSwitch = ({ index,ie_name,client }) => {
  const dispatch = useDispatch();
  const store = useStore();// for handling the redux values in setTimeout funtion
  const value = useSelector(state => state.deviceControl.IE_Info[ie_name]["channels"][index]["currentState"]);
  const [disabled, setDisabled] = React.useState(false);//For disabling the switch during update
  const onToggle = () => {
    // Toggle the value between 0 and 1
    const newValue = value === 1 ? 0 : 1;
    setDisabled(true);//disable the switch during update   
    publishToggle(index, newValue,ie_name,client);//publish the toggle event
    // Optimistically update the UI immediately
    // In a real-world scenario, you might want to wait for a confirmation from the IE
    // before updating the UI state.
    // Here, we assume the update is successful and update the UI state directly.
    // If the update fails, we will revert the UI state in the setTimeout function below.
    dispatch(updatedCurrentUIState({ie_name,index,newValue:newValue}));
    setTimeout(() => {
      const state = store.getState();//for handling the redux values in setTimeout funtion
      // Check if the UI state matches the actual state after 3 seconds
      // If they don't match, it indicates a failure in updating the state
      // and we alert the user to try again.
      // This is a simple way to handle failures; in a real-world app,
      const latestValue = state.deviceControl.IE_Info[ie_name]["channels"][index]["currentState"];
      const latestUiValue = state.deviceControl.IE_Info[ie_name]["channels"][index]["uiValue"];
      if (latestUiValue !== latestValue) {
        // If the UI value doesn't match the latest value, alert the user
        alert(`Failed to update channel ${index}. Please try again.`);
      }      
      setDisabled(false)// Re-enable the switch after the timeout
    }, 3000)
  };
  // Determine colors based on state
  const getSwitchThumbColor = () => {
    if (disabled) return "#2563eb"; // blue for working
    return value === 1 ? "#22c55e" : "#dc2626"; // green for ON, red for OFF
  };
  const getSwitchTrackColor = () => {
    if (disabled) return { false: "#93c5fd", true: "#93c5fd" }; // blue-ish track for working
    return {
      false: "#fecaca", // light red for OFF
      true: "#bbf7d0",  // light green for ON
    };
  };
  const getStateTextColor = () => {
    if (disabled) return "#2563eb"; // blue
    return value === 1 ? "#22c55e" : "#dc2626"; // green or red
  };
  const getCardBackgroundColor = () => {
    if (disabled) return "#dbeafe"; // light blue
    return "#fff";
  };

  return (
    <View style={[styles.card, { backgroundColor: getCardBackgroundColor() }]} >
      <Text style={[styles.channelText]}>Channel: {String(index) || "-"}</Text>
      <Text style={[styles.stateText, { color: getStateTextColor() }]}>
        Current State: {disabled ? "Working" : String(value) === "1" ? "ON" : "OFF"}
      </Text>
      <View style={styles.switchContainer}>
        <Text style={[styles.switchLabel, { color: value === 1 ? "#22c55e" : "#dc2626" }]}>OFF</Text>
        <Switch
          style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
          disabled={disabled}
          accessibilityLabel={`${index}-lohit`}
          value={value === 1}
          onValueChange={onToggle}
          thumbColor={getSwitchThumbColor()}
          trackColor={getSwitchTrackColor()}
        />
        <Text style={[styles.switchLabel, { color: value === 1 ? "#22c55e" : "#dc2626" }]}>ON</Text>
      </View>
    </View>
  )
};
const styles = StyleSheet.create({
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
    color: "steelblue",
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
    fontSize: 18,
    color: "#111827",
    fontWeight: "bold",
    marginHorizontal: 14,
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

export default ToggleSwitch;