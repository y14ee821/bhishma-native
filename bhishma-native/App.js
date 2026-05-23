import React, { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Routes } from "./src/routes/Routes";
import { Provider } from "react-redux";
import { store } from "./src/store/store";
import { RootErrorBoundary } from './src/components/RootErrorBoundary';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { fetchIEInfo } from './src/store/deviceControlSlice';
import { checkAuthStatus } from './src/store/authSlice';
import { useSelector } from 'react-redux';
import { useIEInfo, useIEInfoLoading, useIEInfoError } from './src/reduxStates';
import { MqttConnection } from './src/mqttcomponents';
import { SnackbarProvider } from './src/utils/common';

function AppContent({ darkMode, setDarkMode, autoDarkMode, setAutoDarkMode }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const LoadedIEs = useIEInfo();
  const loadingIEInfo = useIEInfoLoading();
  const errorIEInfo = useIEInfoError();

  useEffect(() => {
    // Check authentication status on app start
    dispatch(checkAuthStatus());
  }, [dispatch]);

  useEffect(() => {
    // Fetch IE info only if authenticated
    if (isAuthenticated) {
      dispatch(fetchIEInfo());
      
      // Log MQTT configuration (never log the password)
      console.log('📡 MQTT Configuration:', {
        host: process.env.EXPO_PUBLIC_MQTT_HOST || "wss://test.mosquitto.org:8081/mqtt (default)",
        username: process.env.EXPO_PUBLIC_MQTT_USERNAME || "(none)",
        keepalive: Number(process.env.EXPO_PUBLIC_MQTT_KEEPALIVE) || 60,
        reconnectPeriod: Number(process.env.EXPO_PUBLIC_MQTT_RECONNECT_PERIOD) || 5000,
      });
    }
  }, [dispatch, isAuthenticated]);

  // Show error state if fetch failed
  if (errorIEInfo) {
    console.error('Error loading IE info:', errorIEInfo);
    // You can return an error component here if needed
  }

  // Don't render if no IE data is loaded (only if authenticated)
  // Allow rendering even with empty devices - user might not have devices yet
  if (isAuthenticated && (!LoadedIEs || Object.keys(LoadedIEs).length === 0)) {
    // Allow app to render even with no devices - user can add devices
    console.log('No devices found for user');
  }

  const mqttConfig = {
    brokerUrl: process.env.EXPO_PUBLIC_MQTT_HOST || "wss://test.mosquitto.org:8081/mqtt",
    username: process.env.EXPO_PUBLIC_MQTT_USERNAME,
    password: process.env.EXPO_PUBLIC_MQTT_PASSWORD,
    keepalive: Number(process.env.EXPO_PUBLIC_MQTT_KEEPALIVE) || 60,
    reconnectPeriod: Number(process.env.EXPO_PUBLIC_MQTT_RECONNECT_PERIOD) || 5000,
  };

  return (
    <MqttConnection options={mqttConfig}>
      {isAuthenticated && loadingIEInfo ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
          }}
        >
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 12, color: '#666' }}>Loading your devices…</Text>
        </View>
      ) : (
        <Routes darkMode={darkMode} setDarkMode={setDarkMode} autoDarkMode={autoDarkMode} setAutoDarkMode={setAutoDarkMode} />
      )}
    </MqttConnection>
  );
}

export default function App() {
  const [autoDarkMode, setAutoDarkMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      const now = new Date();
      const currentHour = now.getHours(); // Returns 0-23
      // Dark mode: 7 PM (19:00) to 9 AM (09:00)
      // If hour >= 19 OR hour < 9, then dark mode
      if (currentHour >= 19 || currentHour < 9) {
        if(autoDarkMode)
          setDarkMode(true);
      } else {
        if(autoDarkMode)
          setDarkMode(false);
      }
    };
    // Check immediately
    checkDarkMode();
    
    // Check every minute to update if time crosses threshold
    const interval = setInterval(checkDarkMode, 60000);
    
    return () => clearInterval(interval);
  }, [darkMode, autoDarkMode]);
  return (
    <RootErrorBoundary>
      <SafeAreaProvider style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <Provider store={store}>
          <SnackbarProvider>
            <AppContent darkMode={darkMode} setDarkMode={setDarkMode} autoDarkMode={autoDarkMode} setAutoDarkMode={setAutoDarkMode} />
          </SnackbarProvider>
        </Provider>
      </SafeAreaProvider>
    </RootErrorBoundary>
  );
}