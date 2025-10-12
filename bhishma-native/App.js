import React, { useState } from 'react';
import { Routes } from "./src/routes/Routes";
import { Provider } from "react-redux";
import { store } from "./src/store/store";
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { modifyIE_Machines } from './src/store/deviceControlSlice';
import { useSelector } from "react-redux";
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Platform } from 'react-native';
import { useNavigation } from "@react-navigation/native";
// Simple Flash Icon using SVG (requires react-native-svg)
import Svg, { Path } from 'react-native-svg';
import { useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from './src/styles';
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
    dispatch(modifyIE_Machines(data));
    // initMQTT(dispatch);
  }, []);
  if (LoadedIEs && Object.keys(LoadedIEs).length === 0) {
    //console.log("No IE_Info in store, not rendering app");
    return null;
  }
  //console.log("IE_Info in store:", LoadedIEs);
  return <Routes darkMode={darkMode} setDarkMode={setDarkMode} />;
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const theme = darkMode ? darkTheme : lightTheme;
  //const theme = lightTheme
  return (
    <Provider store={store}>
      
        <AppContent darkMode={darkMode} setDarkMode={setDarkMode} />
      

    </Provider>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },


});



const lightTheme = {
  gradient: ['#46c1d1ff', '#84ccb6ff', '#0d6b77ff'],
  card: {
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    shadowColor: '#007AFF',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    color: '#007AFF',
    textShadowColor: '#e3eafc',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  button: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
  },
};

const darkTheme = {
  gradient: ['#010102ff', '#000208ff', '#181a20'],
  card: {
    backgroundColor: '#23262f',
    borderColor: '#333',
    borderWidth: 1,
    shadowColor: '#fff',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    color: '#fff',
    textShadowColor: '#23262f',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  button: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
  },
};