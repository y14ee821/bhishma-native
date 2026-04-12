import React, { useEffect,useState } from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { useDeviceControlState } from '../reduxStates'
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import { lightTheme, darkTheme, deviceControlStyles } from '../styles';

import { useGetCurrentUser } from '../reduxStates/authStates';
const styles = deviceControlStyles;

export const DeviceControl = ({ darkMode }) => {
  const theme = darkMode ? darkTheme : lightTheme;
  const navigation = useNavigation();
  const { IE_Info } = useDeviceControlState();
  const currentUser = useGetCurrentUser();
  console.log("currentUser",currentUser?.my_devices);
  return (
    <LinearGradient colors={theme.gradient} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.heading}>
          Select Your Device
        </Text>
        <View style={styles.buttonWrapper}>
          {Object.keys(currentUser?.my_devices).map(ie => (
            <View key={ie}>
              <TouchableOpacity
                style={styles.deviceButton}
                onPress={() => navigation.navigate('DedicatedIEControl', { name: currentUser.my_devices[ie].device_name, device_id: currentUser.my_devices[ie].device_id })}
              >
                <Text style={styles.deviceButtonText}>{currentUser.my_devices[ie].device_name}</Text>
              </TouchableOpacity>
            </View>
          ))}
      </View>
    </View>
    </LinearGradient>
  );
};
