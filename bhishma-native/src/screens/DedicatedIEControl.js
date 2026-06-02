import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, ActivityIndicator, Animated, Easing } from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import ToggleSwitch from '../components/ToggleSwitch';
import { useDispatch, useSelector } from 'react-redux';
import { initMQTT } from '../services/mqttService';
import { useDeviceControlState } from '../reduxStates';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme, darkTheme, useThemedStyles, makeDedicatedIEControlStyles } from '../styles';
import { publishFullOperation, unsubscribeFromIE } from '../services/mqttService';
import { setAllChannelOperationPerforming, setAllChannelOperationSuccess, updateCurrentIEInfo} from '../store/deviceControlSlice';
import { useStore } from 'react-redux';
import { useSnackbar } from '../utils/common';
import { useMqttClient } from '../mqttcomponents/MqttConnection';
import { getDedicatedIEInfo } from '../services/IE_Service';
import { ChannelRenameModal } from '../components/utils';

/** 
 * DedicatedIEControl component for controlling a dedicated internet equipment (IE) via MQTT.
 * 1. Connects to an MQTT broker using WebSocket 
 * 2. Gets the IE name from navigation parameters (URL).
 * 3. Subscribes to the IE's status topic to receive updates on channel states which will be called in initMQTT
 * 4. Renders ToggleSwitch components for each channel to allow toggling the state.
 * 5. ie_name and client are passed as props to ToggleSwitch for publishing toggle commands.
 * 6. Cleans up the MQTT connection when the component is unmounted.
 * */
export const DedicatedIEControl = ({ darkMode }) => {
  const store = useStore();// for handling the redux values in setTimeout funtion
  const { showSuccess, showError } = useSnackbar();
  const client = useMqttClient();
  const theme = darkMode ? darkTheme : lightTheme;
  const styles = useThemedStyles(makeDedicatedIEControlStyles, darkMode);
  const { allChannelOperationPerforming, allChannelOperationSuccess } = useDeviceControlState();

  const dispatch = useDispatch();
  const route = useRoute();
  const user_id = useSelector(state => state.auth.user_id);
  const { name, device_id } = route.params || {};// Get the IE name from navigation parameters
  const { connectedToBroker, channelStates, IE_Mapper, IE_Info } = useDeviceControlState();
  const [dedicatedIEInfo, setDedicatedIEInfo] = useState("loading");

  // Fetch device info on mount
  useEffect(() => {
    const fetchDeviceInfo = async () => {
      const result = await getDedicatedIEInfo(device_id);
      
      if (result.success) {
        setDedicatedIEInfo(result.data?.data);
        dispatch(updateCurrentIEInfo({data: result.data?.data}));
      } else {
        showError(result.error);
        setDedicatedIEInfo(null);
      }
    };
    
    fetchDeviceInfo();
  }, [device_id, dispatch, showError, name]);

  // Setup MQTT subscription when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (!client || !dedicatedIEInfo || !dedicatedIEInfo[name]) {
        return;
      }

      const channelCount = Object.keys(dedicatedIEInfo[name]["channels"]).length;
      initMQTT(dispatch, name, channelCount, client);
      
      // Cleanup: Unsubscribe when screen loses focus
      return () => {
        if (client && name) {
          unsubscribeFromIE(client, name);
        }
      };
    }, [client, name, dedicatedIEInfo, dispatch])
  )

  // Gentle pulsing glow behind the loading spinner
  const loadingPulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(loadingPulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(loadingPulse, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

   if(dedicatedIEInfo !== "loading" && dedicatedIEInfo !== null)
    {
      return (
    <LinearGradient colors={theme.gradient} style={styles.gradient}>
    <ScrollView style={styles.container}>
      <View >
        <View style={styles.groupContainer}>
          <Text style={styles.machineText}>
            Machine Name: {name}
          </Text>
          <View style={styles.controlsWrapper}>
            {/* Always show the controls */}
            <View style={[
              styles.flexWrap,
              !connectedToBroker && styles.blurredControls
            ]}>
              {Object.entries(dedicatedIEInfo[name]["channels"]).map(([channelId, channelData]) => (
                <ToggleSwitch 
                  dispatch={dispatch}
                  user_id={user_id}
                  device_id={device_id}
                  key={channelId} 
                  index={parseInt(channelId)} 
                  ie_name={name} 
                  client={client}
                  disabled={!connectedToBroker || allChannelOperationPerforming || !client}
                  channelDataInfo={channelData}
                  darkMode={darkMode}
                />
              ))}
            </View>
            
            {/* Overlay when not connected */}
            {!connectedToBroker && (
              <View style={styles.overlay}>
                <View style={styles.overlayContent}>
                  <Text style={styles.overlayText}>
                    🔌 Hold on...
                  </Text>
                  <Text style={styles.overlaySubtext}>
                    Connecting to broker
                  </Text>
                </View>
              </View>
            )}

            {allChannelOperationPerforming && (
              <View style={styles.overlay}>
                <View style={styles.overlayContent}>
                  <Text style={styles.overlayText}>
                    Operation in progress...
                  </Text>
                </View>
              </View>
            )}

          </View>
        </View>
        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.opButton,
              darkMode ? styles.opButtonDark : styles.opButtonLight,
              !client && styles.opButtonDisabled,
            ]}
            onPress={() => {
              if (client) {
                publishFullOperation(client, name, 1, dedicatedIEInfo, dispatch, setAllChannelOperationPerforming, store, setAllChannelOperationSuccess, showSuccess, showError);
              } else {
                showError('MQTT client not connected');
              }
            }}
            disabled={!client}
          >
            <LinearGradient
              colors={["#34d399", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.opButtonGradient}
            >
              <Ionicons name="flash" size={20} color="#ffffff" style={styles.opButtonIcon} />
              <Text style={styles.opButtonText}>All On</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.opButton,
              darkMode ? styles.opButtonDark : styles.opButtonLight,
              !client && styles.opButtonDisabled,
            ]}
            onPress={() => {
              if (client) {
                publishFullOperation(client, name, 0, dedicatedIEInfo, dispatch, setAllChannelOperationPerforming, store, setAllChannelOperationSuccess, showSuccess, showError);
              } else {
                showError('MQTT client not connected');
              }
            }}
            disabled={!client}
          >
            <LinearGradient
              colors={["#fb7185", "#e11d48"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.opButtonGradient}
            >
              <Ionicons name="flash-off" size={20} color="#ffffff" style={styles.opButtonIcon} />
              <Text style={styles.opButtonText}>All Off</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
    <ChannelRenameModal />
    </LinearGradient>
  );
}
  else if(dedicatedIEInfo === "loading")
  {
    return (
      <LinearGradient colors={theme.gradient} style={styles.gradient}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <View style={styles.loadingIconWrap}>
              <Animated.View
                style={[
                  styles.loadingHalo,
                  {
                    opacity: loadingPulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 0.85],
                    }),
                    transform: [
                      {
                        scale: loadingPulse.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.82, 1.18],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <ActivityIndicator size="large" color="#38bdf8" />
            </View>
            <Text style={styles.loadingTitle}>Loading device</Text>
            <Text style={styles.loadingSubtitle}>
              {name ? `Fetching “${name}” details…` : "Fetching device details…"}
            </Text>
            <View style={styles.loadingDotsRow}>
              {[0, 1, 2].map((i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.loadingDot,
                    {
                      opacity: loadingPulse.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange:
                          i === 0
                            ? [1, 0.3, 1]
                            : i === 1
                            ? [0.3, 1, 0.3]
                            : [0.6, 0.6, 1],
                      }),
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </LinearGradient>
    );
  }
else {
  return (
    <LinearGradient colors={theme.gradient} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.errorText}>
          No data available for the specified Device : {name} and Device ID : {device_id}
        </Text>
      </View>
    </LinearGradient>
  );
  }
}
