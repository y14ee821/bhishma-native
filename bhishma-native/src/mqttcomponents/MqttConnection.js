import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { View } from 'react-native';
import { useDispatch } from 'react-redux';
import mqtt from 'mqtt';
import { checkBrokerConnection, setConnectingToBroker } from '../store/deviceControlSlice';

// Create Context to share MQTT client across the app
// Use a sentinel value to distinguish between "no provider" and "provider with null client"
const MqttClientContext = createContext(undefined);

/**
 * Custom hook to access the MQTT client from anywhere in the app
 * Usage: const client = useMqttClient();
 */
export const useMqttClient = () => {
  const context = useContext(MqttClientContext);
  // Check if context is undefined (not provided) vs null (provided but client not ready)
  if (context === undefined) {
    return null;
  }
  // context can be null (client not ready yet) or the actual client object
  return context;
};

/**
 * MqttConnection - Hook to manage global MQTT broker connection
 * Handles connection, reconnection, and updates Redux state
 * 
 * @param {Object} options - MQTT connection options
 * @returns {Object} - { client, isConnected }
 */
export const useMqttConnection = (options = {}) => {
  const dispatch = useDispatch();
  const [client, setClient] = useState(null); // State to trigger re-render when client is ready

  // Extract brokerUrl to use in dependency array
  const brokerUrl = useMemo(() => options.brokerUrl || "wss://test.mosquitto.org:8081/mqtt", [options.brokerUrl]);

  useEffect(() => {
    const url = brokerUrl;

    // Build options inside effect to avoid dependency issues.
    // We intentionally don't set `protocol` here — mqtt.js will pick ws/wss
    // from the URL scheme, so a single env var controls everything.
    const defaultOptions = {
      keepalive: 60,
      clean: true,
      reconnectPeriod: 5000, // Try to reconnect every 5 seconds
      connectTimeout: 30 * 1000, // 30 seconds
      clientId: 'bhishma_app_' + Math.random().toString(16).substring(2, 8),
      ...options,
    };

    // Set connecting state
    dispatch(setConnectingToBroker(true));
    dispatch(checkBrokerConnection(false));

    // Create MQTT client
    const mqttClient = mqtt.connect(url, defaultOptions);
    setClient(mqttClient); // Update state to trigger re-render

    // Connection successful
    mqttClient.on('connect', () => {
      dispatch(checkBrokerConnection(true));
      dispatch(setConnectingToBroker(false));
    });

    // Connection error
    mqttClient.on('error', (error) => {
      dispatch(checkBrokerConnection(false));
      dispatch(setConnectingToBroker(false));
    });

    // Connection lost
    mqttClient.on('close', () => {
      dispatch(checkBrokerConnection(false));
      dispatch(setConnectingToBroker(false));
    });

    // Reconnecting
    mqttClient.on('reconnect', () => {
      dispatch(setConnectingToBroker(true));
      dispatch(checkBrokerConnection(false));
    });

    // Offline
    mqttClient.on('offline', () => {
      dispatch(checkBrokerConnection(false));
      dispatch(setConnectingToBroker(false));
    });

    // Cleanup on unmount
    return () => {
      if (mqttClient) {
        mqttClient.end(false, () => {
        });
      }
      setClient(null);
    };
  }, [dispatch, brokerUrl]);

  return {
    client: client, // Return state value, not ref
  };
};

/**
 * MqttConnection - Component wrapper for MQTT connection
 * Provides MQTT client to all child components via Context
 * 
 * Usage:
 * <MqttConnection options={mqttConfig}>
 *   <YourApp />
 * </MqttConnection>
 * 
 * Then in any child component:
 * const client = useMqttClient();
 */
export const MqttConnection = ({ children, options }) => {
  const { client } = useMqttConnection(options);
  
  return (
    <MqttClientContext.Provider value={client}>
      <View style={{ flex: 1, backgroundColor: '#ffffff' }}>{children}</View>
    </MqttClientContext.Provider>
  );
};

