import React, { useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import ToggleSwitch from '../components/ToggleSwitch';
import { useDispatch } from 'react-redux';
import { initMQTT } from '../services/mqttService';
import { useDeviceControlState } from '../reduxStates';
import mqtt from 'mqtt';
import { LinearGradient } from 'expo-linear-gradient';
import { lightTheme, darkTheme, dedicatedIEControlStyles } from '../styles';
import { publishFullOperation } from '../services/mqttService';
import { setAllChannelOperationPerforming, setAllChannelOperationSuccess} from '../store/deviceControlSlice';
import { useStore } from 'react-redux';
import { useSnackbar } from '../utils/common';
import { useMqttClient } from '../mqttcomponents/MqttConnection';
const styles = dedicatedIEControlStyles;

/** 
 * DedicatedIEControl component for controlling a dedicated internet equipment (IE) via MQTT.
 * 1. Connects to an MQTT broker using WebSocket 
 * 2. Gets the IE name from navigation parameters (URL).
 * 3. Subscribes to the IE's status topic to receive updates on channel states which will be called in initMQTT
 * 4. Renders ToggleSwitch components for each channel to allow toggling the state.
 * 5. ie_name and client are passed as props to ToggleSwitch for publishing toggle commands.
 * 6. Cleans up the MQTT connection when the component is unmounted.
 * */
export const DedicatedIEControl = ({ darkMode }) => {
  const store = useStore();// for handling the redux values in setTimeout funtion
  const { showSuccess, showError } = useSnackbar();
  const client = useMqttClient();
  const theme = darkMode ? darkTheme : lightTheme;
  const { allChannelOperationPerforming, allChannelOperationSuccess } = useDeviceControlState();

  const dispatch = useDispatch();
  const route = useRoute();
  const { name } = route.params || {};// Get the IE name from navigation parameters
  const { connectedToBroker, channelStates, IE_Mapper, IE_Info } = useDeviceControlState();
  useEffect(() => {
    if (!client) {
      console.warn('MQTT client not available');
      return;
    }

    if(name in IE_Info)
    {
      const channelCount = Object.keys(IE_Info[name]["channels"]).length;
      initMQTT(dispatch, name, channelCount, client);// Initialize MQTT connection and subscriptions
    }
    else
    {
      console.log(`No IE_Info for the name:${name}, mqtt not initialized.`);
    }
    
    // Note: Don't disconnect the global client here - it's shared across the app
    // The cleanup is handled by the MqttConnection provider
    return () => {
      console.log("Screen unfocused - MQTT subscriptions will be cleaned up");
    };
  }, [client, name, IE_Info, dispatch])
  
   if(name in IE_Info)
    {
      return (
    <LinearGradient colors={theme.gradient} style={styles.gradient}>
    <ScrollView style={styles.container}>
      <View >
        <View style={styles.groupContainer}>
          <Text style={styles.machineText}>
            Machine Name: {name}
          </Text>
          <View style={styles.controlsWrapper}>
            {/* Always show the controls */}
            <View style={[
              styles.flexWrap,
              !connectedToBroker && styles.blurredControls
            ]}>
              {Object.entries(IE_Info[name]["channels"]).map(([channelId, channelData]) => (
                <ToggleSwitch 
                  key={channelId} 
                  index={parseInt(channelId)} 
                  ie_name={name} 
                  client={client}
                  disabled={!connectedToBroker || allChannelOperationPerforming || !client}
                />
              ))}
            </View>
            
            {/* Overlay when not connected */}
            {!connectedToBroker && (
              <View style={styles.overlay}>
                <View style={styles.overlayContent}>
                  <Text style={styles.overlayText}>
                    🔌 Hold on...
                  </Text>
                  <Text style={styles.overlaySubtext}>
                    Connecting to broker
                  </Text>
                </View>
              </View>
            )}

            {allChannelOperationPerforming && (
              <View style={styles.overlay}>
                <View style={styles.overlayContent}>
                  <Text style={styles.overlayText}>
                    Operation in progress...
                  </Text>
                </View>
              </View>
            )}

          </View>
        </View>
        <View style={styles.buttonWrapper}>
          <TouchableOpacity 
            style={styles.fullOperationButton} 
            onPress={() => {
              if (client) {
                publishFullOperation(client, name, 1, IE_Info, dispatch, setAllChannelOperationPerforming, store, setAllChannelOperationSuccess, showSuccess, showError);
              } else {
                showError('MQTT client not connected');
              }
            }}
            disabled={!client}
          >
            <Text>All On</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.fullOperationButton} 
            onPress={() => {
              if (client) {
                publishFullOperation(client, name, 0, IE_Info, dispatch, setAllChannelOperationPerforming, store, setAllChannelOperationSuccess, showSuccess, showError);
              } else {
                showError('MQTT client not connected');
              }
            }}
            disabled={!client}
          >
            <Text>All Off</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    </LinearGradient>
  );
} else {
  return (
    <LinearGradient colors={theme.gradient} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.errorText}>
          No data available for the specified IE.
        </Text>
      </View>
    </LinearGradient>
  );
  }
}
