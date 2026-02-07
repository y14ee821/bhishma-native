import React, { useEffect } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import ToggleSwitch from '../components/ToggleSwitch';
import { useDispatch } from 'react-redux';
import { initMQTT } from '../services/mqttService';
import { useDeviceControlState } from '../reduxstates/deviceControlStates';
import mqtt from 'mqtt';
import { LinearGradient } from 'expo-linear-gradient';
import { lightTheme, darkTheme } from '../styles';

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
  const theme = darkMode ? darkTheme : lightTheme;
  const options = {
    protocol: 'wss',
    keepalive: 600,
    clean: true,
    reconnectPeriod: 1000, // ms
    connectTimeout: 30 * 1000, // ms
    clientId: 'emqx_react_lohit_' + Math.random().toString(16).substring(2, 8)
  }
  const url = "wss://test.mosquitto.org:8081/mqtt"

  const client = mqtt.connect(url, options)// Create a new MQTT client instance
  const dispatch = useDispatch();
  const route = useRoute();
  const { name } = route.params || {};// Get the IE name from navigation parameters
  const { connectedToBroker, channelStates, IE_Mapper, IE_Info } = useDeviceControlState();
  useEffect(() => {
    if(name in IE_Info)
    {
      const channelCount = Object.keys(IE_Info[name]["channels"]).length;
      initMQTT(dispatch, name,channelCount, client);// Initialize MQTT connection and subscriptions
    }
    else
      {
        console.log(`No IE_Info for the name:${name}, mqtt not initialized.`);
      }
    return () => {
      console.log("Screen unfocused");
      client.end(); // Disconnect the client when the screen is unfocused
    };
  }
    , [])
  
  //console.log("settings",connectedToBroker, channelStates, IE_Mapper, IE_Info)

  //Object.keys(IE_Info).map()
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
                  disabled={!connectedToBroker}
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
          </View>
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
  )
};
}
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
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
    color: "#ffffff",
    fontWeight: "800",
    margin: 8,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  groupContainer: {
    margin: 8,
  },
  machineText: {
    fontSize: 22,
    color: "#ffffff",
    fontWeight: "800",
    marginBottom: 16,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  flexWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  controlsWrapper: {
    position: "relative",
  },
  blurredControls: {
    opacity: 0.3,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  overlayContent: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  overlayText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  overlaySubtext: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  buttonWrapper: {
    marginVertical: 8,
    marginHorizontal: 4,
    flexDirection: 'row',
    flexWrap: "wrap",
    justifyContent: 'center',
  },
  deviceButton: {
    backgroundColor: '#2d5f8d',
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

