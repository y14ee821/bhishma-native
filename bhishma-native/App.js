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
import {useTheme} from './src/reduxStates/utilsStates';
import { getTheme } from './src/styles';
function AppContent() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const LoadedIEs = useIEInfo();
  const loadingIEInfo = useIEInfoLoading();
  const errorIEInfo = useIEInfoError();
  const theme = useTheme();
  const [autoDarkMode, setAutoDarkMode] = useState(theme === "auto");
  const [darkMode, setDarkMode] = useState(theme === "dark");
  const t = getTheme(darkMode);

  useEffect(() => {
    const checkDarkMode = () => {
      const now = new Date();
      const currentHour = now.getHours();
      if (currentHour >= 19 || currentHour < 9) {
        if (autoDarkMode) setDarkMode(true);
      } else {
        if (autoDarkMode) setDarkMode(false);
      }
    };
    checkDarkMode();
    const interval = setInterval(checkDarkMode, 60000);
    return () => clearInterval(interval);
  }, [darkMode, autoDarkMode]);

  useEffect(() => {
    // Check authentication status on app start
    dispatch(checkAuthStatus());
  }, [dispatch]);

  useEffect(() => {
    // Fetch IE info only if authenticated
    if (isAuthenticated) {
      dispatch(fetchIEInfo());
    }
  }, [dispatch, isAuthenticated]);

  // Show error state if fetch failed
  if (errorIEInfo) {
    // You can return an error component here if needed
  }

  // Don't render if no IE data is loaded (only if authenticated)
  // Allow rendering even with empty devices - user might not have devices yet
  if (isAuthenticated && (!LoadedIEs || Object.keys(LoadedIEs).length === 0)) {
    // Allow app to render even with no devices - user can add devices
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
            backgroundColor: t.loaderBg,
          }}
        >
          <ActivityIndicator size="large" color={t.primary} />
          <Text style={{ marginTop: 12, color: t.textMuted }}>Loading your devices…</Text>
        </View>
      ) : (
        <Routes darkMode={darkMode} setDarkMode={setDarkMode} autoDarkMode={autoDarkMode} setAutoDarkMode={setAutoDarkMode} />
      )}
    </MqttConnection>
  );
}

export default function App() {
  return (
    <RootErrorBoundary>
      <SafeAreaProvider style={{ flex: 1, backgroundColor: '#ffffff' }}>
        <Provider store={store}>
          <SnackbarProvider>
            <AppContent />
          </SnackbarProvider>
        </Provider>
      </SafeAreaProvider>
    </RootErrorBoundary>
  );
}