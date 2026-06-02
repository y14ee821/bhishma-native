import React, { useEffect,useState } from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { useDeviceControlState } from '../reduxStates'
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme, darkTheme, deviceControlStyles } from '../styles';

import { useGetCurrentUser } from '../reduxStates/authStates';
const styles = deviceControlStyles;

const CARD_GRAD_LIGHT = ["#ffffff", "#f8fafc", "#edf2f7"];
const CARD_GRAD_DARK = ["#1c1c20", "#161619", "#0f0f12"];

export const DeviceControl = ({ darkMode }) => {
  const theme = darkMode ? darkTheme : lightTheme;
  const navigation = useNavigation();
  const { IE_Info } = useDeviceControlState();
  const currentUser = useGetCurrentUser();
  return (
    <LinearGradient colors={theme.gradient} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.heading}>
          Select Your Device
        </Text>
        <View style={styles.buttonWrapper}>
          {Object.keys(currentUser?.my_devices || {}).map(ie => {
            const device = currentUser.my_devices[ie];
            const deviceName = device.device_name || "";
            const initial = (deviceName.charAt(0) || "?").toUpperCase();
            return (
              <TouchableOpacity
                key={ie}
                activeOpacity={0.85}
                style={[
                  styles.deviceCard,
                  darkMode ? styles.deviceCardDark : styles.deviceCardLight,
                ]}
                onPress={() => navigation.navigate('DedicatedIEControl', { name: device.device_name, device_id: device.device_id })}
              >
                <LinearGradient
                  colors={darkMode ? CARD_GRAD_DARK : CARD_GRAD_LIGHT}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.deviceCardGradient}
                >
                  <View
                    style={[
                      styles.deviceAvatar,
                      darkMode ? styles.deviceAvatarDark : styles.deviceAvatarLight,
                    ]}
                  >
                    <Text
                      style={[
                        styles.deviceAvatarText,
                        darkMode ? styles.deviceAvatarTextDark : styles.deviceAvatarTextLight,
                      ]}
                      allowFontScaling={false}
                    >
                      {initial}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.deviceCardName,
                      darkMode ? styles.deviceCardNameDark : styles.deviceCardNameLight,
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {deviceName.toUpperCase()}
                  </Text>
                  <View
                    style={[
                      styles.deviceCardChip,
                      darkMode ? styles.deviceCardChipDark : styles.deviceCardChipLight,
                    ]}
                  >
                    <Ionicons
                      name="options-outline"
                      size={14}
                      color={darkMode ? "#7dd3fc" : "#2563eb"}
                    />
                    <Text
                      style={[
                        styles.deviceCardChipText,
                        darkMode ? styles.deviceCardChipTextDark : styles.deviceCardChipTextLight,
                      ]}
                    >
                      Control
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
      </View>
    </View>
    </LinearGradient>
  );
};
