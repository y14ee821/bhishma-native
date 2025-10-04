import React, { useState } from 'react';
import { Routes } from "./src/routes/Routes";
import { Provider } from "react-redux";
import { store } from "./src/store/store";
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { modifyIE_Machines } from './src/store/deviceControlSlice';
import { useSelector } from "react-redux";
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from "@react-navigation/native";
// Simple Flash Icon using SVG (requires react-native-svg)
import Svg, { Path } from 'react-native-svg';
import { useWindowDimensions } from 'react-native';

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




function AppContent() {
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
  return <Routes />;
}

export default function App() {

  return (
    <Provider store={store}>
      <View style={[styles.container]}>

        <AppContent />
      </View>
    </Provider>
  );
} 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    
    marginTop: 40,
  },
  light: {
    backgroundColor: '#f6f8fa',
  },
  dark: {
    backgroundColor: '#181a20',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 18,
    elevation: 2,
  },
  navBarDark: {
    backgroundColor: '#23262f',
  },
  appNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007AFF',
    letterSpacing: 1,
    marginLeft: 6,
  },
  appNameDark: {
    color: '#fff',
  },
  navLinks: {
    flexDirection: 'row',
    gap: 18,
  },
  navLink: {
    fontSize: 17,
    color: '#444',
    fontWeight: '500',
    marginHorizontal: 8,
  },
  navLinkActive: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  navLinkDark: {
    color: '#fff',
  },
  header: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#222',
    letterSpacing: 1,
    textAlign: 'center',
  },
  headerDark: {
    color: '#fff',
  },
  summary: {
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    gap: 12,
  },
  summaryText: {
    fontSize: 18,
    color: '#444',
  },
  summaryTextDark: {
    color: '#ccc',
  },
  count: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#007AFF',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  headerContainer: {

    margin: 20,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  }
  // ...rest of your styles unchanged
});