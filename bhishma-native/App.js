import React, { useState } from 'react';
import { Routes } from "./src/routes/Routes";
import { Provider } from "react-redux";
import { store } from "./src/store/store";
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { modifyIE_Machines } from './src/store/deviceControlSlice';
import { useSelector } from "react-redux";
import { MqttConnection } from './src/mqttcomponents';
const data = {
  rao: {
    channels: {
      1: { id: 1, name: "1", currentState: 0, IE_Name: "rao", uiValue: 0, channelUpdatedTime: "" },
      2: { id: 2, name: "2", currentState: 0, IE_Name: "rao", uiValue: 0, channelUpdatedTime: "" },
      3: { id: 3, name: "3", currentState: 0, IE_Name: "rao", uiValue: 0, channelUpdatedTime: "" },
      4: { id: 4, name: "4", currentState: 0, IE_Name: "rao", uiValue: 0, channelUpdatedTime: "" },
    },
    lastUpdated: "",
    channelCount: 4,
    faulty: "",
    running: true
  },
  venky: {
    channels: {
      1: { id: 1, name: "1", currentState: 0, IE_Name: "venky", uiValue: 0, channelUpdatedTime: "" },
      2: { id: 2, name: "2", currentState: 0, IE_Name: "venky", uiValue: 0, channelUpdatedTime: "" },
    },
    lastUpdated: "",
    channelCount: 2,
    faulty: "",
    running: true
  }
};




function AppContent({ darkMode, setDarkMode }) {
  const dispatch = useDispatch();
  const LoadedIEs = useSelector(state => state.deviceControl.IE_Info);

  useEffect(() => {
    // Initialize device data
    dispatch(modifyIE_Machines(data));
    
    // Log MQTT configuration
    console.log('📡 MQTT Configuration:', {
      host: process.env.REACT_APP_MQTT_HOST || "wss://test.mosquitto.org:8081/mqtt (default)",
      keepalive: Number(process.env.REACT_APP_MQTT_KEEPALIVE) || 60,
      reconnectPeriod: Number(process.env.REACT_APP_MQTT_RECONNECT_PERIOD) || 5000,
    });
  }, [dispatch]);

  if (LoadedIEs && Object.keys(LoadedIEs).length === 0) {
    //console.log("No IE_Info in store, not rendering app");
    return null;
  }

  const mqttConfig = {
    brokerUrl: process.env.REACT_APP_MQTT_HOST || "wss://test.mosquitto.org:8081/mqtt",
    keepalive: Number(process.env.REACT_APP_MQTT_KEEPALIVE) || 60,
    reconnectPeriod: Number(process.env.REACT_APP_MQTT_RECONNECT_PERIOD) || 5000,
  };

  return (
    <MqttConnection options={mqttConfig}>
      <Routes darkMode={darkMode} setDarkMode={setDarkMode} />
    </MqttConnection>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <Provider store={store}>
      <AppContent darkMode={darkMode} setDarkMode={setDarkMode} />
    </Provider>
  );
}