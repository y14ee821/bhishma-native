import React, { useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import ToggleSwitch from '../components/ToggleSwitch';
import { useDispatch } from 'react-redux';
import { initMQTT } from '../services/mqttService';
import { modifyIE_Machines, updateIE_Mapper } from '../store/deviceControlSlice';
import { useDeviceControlState } from '../reduxStates'
import { Button } from 'react-native-web';
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import { lightTheme, darkTheme, deviceControlStyles } from '../styles';

const styles = deviceControlStyles;

export const DeviceControl = ({ darkMode }) => {
  const theme = darkMode ? darkTheme : lightTheme;
  const navigation = useNavigation();
  const { IE_Info } = useDeviceControlState();
  return (
    <LinearGradient colors={theme.gradient} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.heading}>
          Select Your Device
        </Text>
        <View style={styles.buttonWrapper}>
          {Object.keys(IE_Info).map(ie => (
            <View key={ie}>
              <TouchableOpacity
                style={styles.deviceButton}
                onPress={() => navigation.navigate('DedicatedIEControl', { name: ie })}
              >
                <Text style={styles.deviceButtonText}>{ie}</Text>
              </TouchableOpacity>
            </View>
          ))}
      </View>
    </View>
    </LinearGradient>
  );
};
