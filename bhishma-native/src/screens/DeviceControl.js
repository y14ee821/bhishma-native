import React, { useEffect,useState } from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { useDeviceControlState } from '../reduxStates'
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme, darkTheme, getTheme, useThemedStyles, makeDeviceControlStyles } from '../styles';

import { useGetCurrentUser } from '../reduxStates/authStates';

export const DeviceControl = ({ darkMode }) => {
  const theme = darkMode ? darkTheme : lightTheme;
  const t = getTheme(darkMode);
  const styles = useThemedStyles(makeDeviceControlStyles, darkMode);
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
                style={styles.deviceCard}
                onPress={() => navigation.navigate('DedicatedIEControl', { name: device.device_name, device_id: device.device_id })}
              >
                <LinearGradient
                  colors={t.cardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.deviceCardGradient}
                >
                  <View style={styles.deviceAvatar}>
                    <Text style={styles.deviceAvatarText} allowFontScaling={false}>
                      {initial}
                    </Text>
                  </View>
                  <Text
                    style={styles.deviceCardName}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {deviceName.toUpperCase()}
                  </Text>
                  <View style={styles.deviceCardChip}>
                    <Ionicons
                      name="options-outline"
                      size={14}
                      color={t.chipText}
                    />
                    <Text style={styles.deviceCardChipText}>
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
