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
    console.warn('useMqttClient must be used within MqttConnection provider');
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
    console.log('🔌 Connecting to MQTT Broker:', url);

    // Build options inside effect to avoid dependency issues
    const defaultOptions = {
      protocol: 'wss',
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
      console.log('✅ Successfully connected to MQTT broker');
      dispatch(checkBrokerConnection(true));
      dispatch(setConnectingToBroker(false));
    });

    // Connection error
    mqttClient.on('error', (error) => {
      console.error('❌ MQTT connection error:', error.message);
      dispatch(checkBrokerConnection(false));
      dispatch(setConnectingToBroker(false));
    });

    // Connection lost
    mqttClient.on('close', () => {
      console.log('🔴 MQTT connection closed');
      dispatch(checkBrokerConnection(false));
      dispatch(setConnectingToBroker(false));
    });

    // Reconnecting
    mqttClient.on('reconnect', () => {
      console.log('🔄 Attempting to reconnect to MQTT broker...');
      dispatch(setConnectingToBroker(true));
      dispatch(checkBrokerConnection(false));
    });

    // Offline
    mqttClient.on('offline', () => {
      console.log('📡 MQTT client is offline');
      dispatch(checkBrokerConnection(false));
      dispatch(setConnectingToBroker(false));
    });

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up MQTT connection...');
      if (mqttClient) {
        mqttClient.end(false, () => {
          console.log('MQTT client disconnected');
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

