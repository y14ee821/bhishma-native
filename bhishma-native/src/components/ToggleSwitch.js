import React from 'react';
import { useStore } from 'react-redux';
import { View, Text, Switch, TouchableOpacity } from "react-native";
import { publishToggleCommand, updateChannelConfig } from '../store/deviceControlSlice';
import { useChannelState } from '../reduxStates';
import { getTheme, useThemedStyles, makeToggleSwitchStyles } from '../styles';


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
 * @param {boolean} props.disabled - External disabled state (e.g., when not connected to broker).
 *
 * @returns {React.Node} The rendered ToggleSwitch component.
 */
// ToggleSwitch component definition
// This component renders a toggle switch for a device channel.
// It manages UI state, dispatches Redux actions, and handles MQTT publish events.
const ToggleSwitch = ({ dispatch, user_id, device_id, index, ie_name, client, disabled: disabledFromParent = false, channelDataInfo, darkMode = false }) => {
  const { id } = channelDataInfo;
  const t = getTheme(darkMode);
  const styles = useThemedStyles(makeToggleSwitchStyles, darkMode);
  const store = useStore();// for handling the redux values in setTimeout funtion
  const channelData = useChannelState(ie_name, index);
  const value = channelData?.currentState || 0;
  // Prefer the Redux-backed name so renames (which patch currentIEInfo via
  // applyChannelNameUpdate) reflect immediately without a screen reload.
  // Fall back to the prop for the first paint before currentIEInfo is hydrated.
  const name = channelData?.name ?? channelDataInfo.name;
  const [internalDisabled, setInternalDisabled] = React.useState(false);//For disabling the switch during update
  // Combine internal disabled state with parent disabled prop
  const disabled = disabledFromParent || internalDisabled;

  // Open the singleton ChannelRenameModal pre-filled with this channel's current
  // name. The modal lives in DedicatedIEControl and reads everything from Redux.
  const openRenameModal = () => {
    dispatch(updateChannelConfig({
      openModal: true,
      device_id,
      channel_id: id,
      ie_name,
      new_name: name ?? '',
      error: null,
    }));
  };
  const onToggle = async () => {
    // Toggle the value between 0 and 1
    const newValue = value === 1 ? 0 : 1;
    setInternalDisabled(true); // Disable the switch during update
    
    // Dispatch the thunk to publish toggle command
    try {
      await dispatch(publishToggleCommand({ 
        channel: index, 
        state: newValue, 
        ie_name, 
        client 
      })).unwrap();
      
      // Success - check if state matches after 3 seconds
      setTimeout(() => {
        const state = store.getState();
        const latestValue = state.deviceControl.currentIEInfo[ie_name]["channels"][index]["currentState"];
        const latestUiValue = state.deviceControl.currentIEInfo[ie_name]["channels"][index]["uiValue"];
        if (latestUiValue !== latestValue) {
          alert(`Failed to update channel ${index}. Please try again.`);
        }
        setInternalDisabled(false); // Re-enable the switch
      }, 3000);
    } catch (error) {
      // Handle error from thunk
      setInternalDisabled(false); // Re-enable the switch on error
    }
  };
  // Determine colors based on state (state colors are shared across themes)
  const getSwitchThumbColor = () => {
    if (disabled) return t.switchWorking;
    return value === 1 ? t.switchOn : t.switchOff;
  };
  const getSwitchTrackColor = () => {
    if (disabled) return { false: "#93c5fd", true: "#93c5fd" }; // blue-ish track for working
    return {
      false: "#fecaca", // light red for OFF
      true: "#bbf7d0",  // light green for ON
    };
  };
  const getStateTextColor = () => {
    if (disabled) return t.switchWorking;
    return value === 1 ? t.switchOn : t.switchOff;
  };
  const getCardBackgroundColor = () => {
    if (disabled) return t.switchWorkingBg; // working
    return t.switchCardBg;
  };
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: getCardBackgroundColor() },
      ]}
    >
      <Text style={styles.channelText}>
        Channel: {String(name) || '-'}
      </Text>
      <Text style={[styles.stateText, { color: getStateTextColor() }]}>
        Current State: {disabled ? "Working" : String(value) === "1" ? "ON" : "OFF"}
      </Text>
      <View style={styles.switchContainer}>
        <Text style={[styles.switchLabel, { color: value === 1 ? t.switchOn : t.switchOff }]}>OFF</Text>
        <Switch
          style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
          disabled={disabled}
          accessibilityLabel={`${index}-lohit`}
          value={value === 1}
          onValueChange={onToggle}
          thumbColor={getSwitchThumbColor()}
          trackColor={getSwitchTrackColor()}
        />
        <Text style={[styles.switchLabel, { color: value === 1 ? t.switchOn : t.switchOff }]}>ON</Text>
      </View>
      {/* Rendered last so it draws on top of the flow-positioned children; its
          visual position is still top-right thanks to absolute positioning. */}
      <TouchableOpacity
        onPress={openRenameModal}
        style={styles.editButton}
        accessibilityLabel={`Rename channel ${index}`}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
  )
};

export default ToggleSwitch;