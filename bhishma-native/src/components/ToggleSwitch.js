import React from 'react';
//import { Switch } from 'react-native-paper';
import { View, Text, Switch, StyleSheet } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { toggleChannel } from '../store/deviceSlice';
import { publishToggle } from '../services/mqttService';
const ToggleSwitch = ({ index,ie_name,client }) => {
  const dispatch = useDispatch();
  const value = useSelector(state => state.device.channels[index]);
  const [disabled, setDisabled] = React.useState(false);
  const [localValue, setLocalValue] = React.useState(value);
  React.useEffect(() => {
    if (!disabled) {
      setLocalValue(value); // Sync only when not disabled
    }
  }, [value, disabled]);
  const onToggle = () => {
    const newValue = value === 1 ? 0 : 1;
    setDisabled(true);
    setLocalValue(newValue); // Freeze UI to new value
    
    publishToggle(index, newValue,ie_name,client);
    setTimeout(() => {
      console.log(Boolean(newValue),Boolean(value))
      setDisabled(false)
      //dispatch(toggleChannel({ index, value: newValue }));
    }, 4000)
  };
  return (
    <View style={styles.card} >
      <Text style={styles.channelText}>Channel: {String(index) || "-"}</Text>
      <Text style={styles.stateText}>Current State: {disabled ? "Working" : String(localValue)==="1" ? "ON" : "OFF"}</Text>
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>OFF</Text>
        <Switch
          disabled={disabled}
          accessibilityLabel={`${index}-lohit`}
          value={localValue === 1}
          onValueChange={onToggle}
        />
        <Text style={styles.switchLabel}>ON</Text>
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

export default ToggleSwitch;