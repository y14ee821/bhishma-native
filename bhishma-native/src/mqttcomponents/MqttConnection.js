import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import mqtt from 'mqtt';
import { checkBrokerConnection, setConnectingToBroker } from '../store/deviceControlSlice';

// Create Context to share MQTT client across the app
const MqttClientContext = createContext(null);

/**
 * Custom hook to access the MQTT client from anywhere in the app
 * Usage: const client = useMqttClient();
 */
export const useMqttClient = () => {
  const context = useContext(MqttClientContext);
  if (!context) {
    console.warn('useMqttClient must be used within MqttConnection provider');
  }
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
  const clientRef = useRef(null);

  const defaultOptions = {
    protocol: 'wss',
    keepalive: 60,
    clean: true,
    reconnectPeriod: 5000, // Try to reconnect every 5 seconds
    connectTimeout: 30 * 1000, // 30 seconds
    clientId: 'bhishma_app_' + Math.random().toString(16).substring(2, 8),
    ...options,
  };

  useEffect(() => {
    const url = options.brokerUrl || "wss://test.mosquitto.org:8081/mqtt";
    console.log('🔌 Connecting to MQTT Broker:', url);

    // Set connecting state
    dispatch(setConnectingToBroker(true));
    dispatch(checkBrokerConnection(false));

    // Create MQTT client
    const client = mqtt.connect(url, defaultOptions);
    clientRef.current = client;

    // Connection successful
    client.on('connect', () => {
      console.log('✅ Successfully connected to MQTT broker');
      dispatch(checkBrokerConnection(true));
      dispatch(setConnectingToBroker(false));
    });

    // Connection error
    client.on('error', (error) => {
      console.error('❌ MQTT connection error:', error.message);
      dispatch(checkBrokerConnection(false));
      dispatch(setConnectingToBroker(false));
    });

    // Connection lost
    client.on('close', () => {
      console.log('🔴 MQTT connection closed');
      dispatch(checkBrokerConnection(false));
      dispatch(setConnectingToBroker(false));
    });

    // Reconnecting
    client.on('reconnect', () => {
      console.log('🔄 Attempting to reconnect to MQTT broker...');
      dispatch(setConnectingToBroker(true));
      dispatch(checkBrokerConnection(false));
    });

    // Offline
    client.on('offline', () => {
      console.log('📡 MQTT client is offline');
      dispatch(checkBrokerConnection(false));
      dispatch(setConnectingToBroker(false));
    });

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up MQTT connection...');
      if (client) {
        client.end(false, () => {
          console.log('MQTT client disconnected');
        });
      }
    };
  }, [dispatch]);

  return {
    client: clientRef.current,
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
      {children}
    </MqttClientContext.Provider>
  );
};

