import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Animated,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useRef, useEffect } from "react";
import { colors, lightTheme, darkTheme, homeScreenStyles } from "../styles";
import { useIEInfo, useBrokerConnection, useBrokerConnecting } from "../reduxStates";
import { useDispatch } from "react-redux";
import { fetchIEInfo } from "../store/deviceControlSlice";
import { deviceAPI } from "../services/apiService";

const styles = homeScreenStyles;

export const HomeScreen = ({ navigation, darkMode, setDarkMode }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [creatingDevices, setCreatingDevices] = useState(false);
  const dispatch = useDispatch();
  
  // Get real IoT device data from Redux
  const IE_Info = useIEInfo();
  const connectedToBroker = useBrokerConnection();
  const connectingToBroker = useBrokerConnecting();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnimatedValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimatedValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const headerAnimatedValue = useRef(new Animated.Value(0)).current;
  const fadeAnimatedValue = useRef(new Animated.Value(0)).current;

  // Calculate statistics from real IoT devices
  const getDeviceStats = () => {
    if (!IE_Info || Object.keys(IE_Info).length === 0) {
      return { totalDevices: 0, totalChannels: 0, activeChannels: 0, runningDevices: 0 };
    }

    let totalChannels = 0;
    let activeChannels = 0;
    let runningDevices = 0;

    Object.values(IE_Info).forEach((device) => {
      if (device.running) runningDevices++;
      
      if (device.channels) {
        const channelArray = Object.values(device.channels);
        totalChannels += channelArray.length;
        activeChannels += channelArray.filter(
          (channel) => channel.currentState === 1 || channel.currentState === "ON"
        ).length;
      }
    });

    return {
      totalDevices: Object.keys(IE_Info).length,
      totalChannels,
      activeChannels,
      runningDevices,
    };
  };

  const stats = getDeviceStats();
  const theme = darkMode ? darkTheme : lightTheme;

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh device data from backend
    await dispatch(fetchIEInfo());
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const createSampleDevices = async () => {
    setCreatingDevices(true);
    try {
      const sampleDevices = [
        {
          name: "Rao",
          type: "IE Controller",
          status: "online",
          metadata: { channelCount: 4 }
        },
        {
          name: "Venky",
          type: "IE Controller",
          status: "online",
          metadata: { channelCount: 2 }
        }
      ];

      let createdCount = 0;
      for (const device of sampleDevices) {
        const result = await deviceAPI.createDevice(device);
        if (result.success) {
          createdCount++;
        }
      }

      if (createdCount > 0) {
        Alert.alert("Success", `Created ${createdCount} sample device(s)!`);
        // Refresh device list
        await dispatch(fetchIEInfo());
      } else {
        Alert.alert("Error", "Failed to create devices. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to create devices");
    } finally {
      setCreatingDevices(false);
    }
  };

  const headerTranslateY = headerAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0],
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getConnectionStatus = () => {
    if (connectingToBroker) return "🟡 Connecting...";
    return connectedToBroker ? "🟢 Connected" : "🔴 Disconnected";
  };

  const getDeviceIcon = (deviceName) => {
    // You can customize icons based on device names
    const iconMap = {
      rao: "⚡",
      venky: "🔌",
      default: "🏠",
    };
    return iconMap[deviceName.toLowerCase()] || iconMap.default;
  };

  return (
    <LinearGradient colors={theme.gradient} style={styles.gradient}>
      <View style={styles.container}>
        <StatusBar
          barStyle={darkMode ? "light-content" : "dark-content"}
          backgroundColor={colors.background}
        />

        <ScrollView 
          style={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header Section */}
          <Animated.View
            style={[
              styles.header,
              {
                transform: [{ translateY: headerTranslateY }],
                opacity: headerAnimatedValue,
              },
            ]}
          >
            <Text style={theme.greeting}>{getGreeting()}!</Text>
            <Text style={theme.subtitle}>Control your IoT devices</Text>

            {/* Connection Status Badge */}
            <View style={styles.connectionBadge}>
              <Text style={[
                styles.connectionText,
                { 
                  color: connectingToBroker ? '#f59e0b' : 
                         connectedToBroker ? '#10b981' : '#ef4444' 
                }
              ]}>
                {getConnectionStatus()}
              </Text>
              <Text style={styles.connectionSubtext}>MQTT Broker</Text>
            </View>

            {/* Stats Cards */}
            <View style={theme.statsContainer}>
              <View style={theme.statCard}>
                <Text style={theme.statNumber}>{stats.totalDevices}</Text>
                <Text style={theme.statLabel}>Devices</Text>
              </View>
              <View style={theme.statCard}>
                <Text style={theme.statNumber}>{stats.totalChannels}</Text>
                <Text style={theme.statLabel}>Total Channels</Text>
              </View>
              <View style={theme.statCard}>
                <Text style={theme.statNumber}>{stats.activeChannels}</Text>
                <Text style={theme.statLabel}>Active</Text>
              </View>
              <View style={theme.statCard}>
                <Text style={theme.statNumber}>
                  {stats.totalChannels > 0 
                    ? Math.round((stats.activeChannels / stats.totalChannels) * 100) 
                    : 0}%
                </Text>
                <Text style={theme.statLabel}>Usage</Text>
              </View>
            </View>

            {/* Quick Action Button */}
            <View style={styles.summary}>
              <TouchableOpacity
                style={[theme.addButton]}
                onPress={() => navigation.navigate("DeviceControl")}
              >
                <Text style={[theme.addButtonText]}>
                  🎛️ Device Control
                </Text>
              </TouchableOpacity>
            </View>

            {/* Device List */}
            {IE_Info && Object.keys(IE_Info).length > 0 && (
              <View style={styles.deviceListContainer}>
                <Text style={theme.sectionTitle}>Your Devices</Text>
                {Object.entries(IE_Info).map(([deviceName, deviceInfo]) => {
                  const channelCount = deviceInfo.channels 
                    ? Object.keys(deviceInfo.channels).length 
                    : 0;
                  const activeCount = deviceInfo.channels
                    ? Object.values(deviceInfo.channels).filter(
                        (ch) => ch.currentState === 1 || ch.currentState === "ON"
                      ).length
                    : 0;

                  return (
                    <TouchableOpacity
                      key={deviceName}
                      style={[styles.deviceCard, theme.deviceCard]}
                      onPress={() => navigation.navigate('DedicatedIEControl', { name: deviceName })}
                    >
                      <View style={styles.deviceCardHeader}>
                        <View style={styles.deviceNameContainer}>
                          <Text style={styles.deviceIcon}>{getDeviceIcon(deviceName)}</Text>
                          <View>
                            <Text style={theme.deviceName}>{deviceName.toUpperCase()}</Text>
                            <Text style={theme.deviceStatus}>
                              {deviceInfo.running ? "🟢 Running" : "⚪ Stopped"}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.chevron}>›</Text>
                      </View>
                      
                      <View style={styles.deviceCardBody}>
                        <View style={styles.deviceStat}>
                          <Text style={theme.deviceStatLabel}>Channels</Text>
                          <Text style={theme.deviceStatValue}>{channelCount}</Text>
                        </View>
                        <View style={styles.deviceStat}>
                          <Text style={theme.deviceStatLabel}>Active</Text>
                          <Text style={[theme.deviceStatValue, styles.activeStatValue]}>
                            {activeCount}
                          </Text>
                        </View>
                        <View style={styles.deviceStat}>
                          <Text style={theme.deviceStatLabel}>Usage</Text>
                          <Text style={theme.deviceStatValue}>
                            {channelCount > 0 
                              ? Math.round((activeCount / channelCount) * 100) 
                              : 0}%
                          </Text>
                        </View>
                      </View>

                      {deviceInfo.lastUpdated && (
                        <Text style={theme.lastUpdated}>
                          Updated: {new Date(deviceInfo.lastUpdated).toLocaleTimeString()}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Empty State */}
            {(!IE_Info || Object.keys(IE_Info).length === 0) && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📡</Text>
                <Text style={theme.emptyTitle}>No Devices Found</Text>
                <Text style={theme.emptySubtitle}>
                  You don't have any devices yet. Create sample devices to get started!
                </Text>
                <TouchableOpacity
                  style={[styles.createButton, { opacity: creatingDevices ? 0.6 : 1 }]}
                  onPress={createSampleDevices}
                  disabled={creatingDevices}
                >
                  <Text style={styles.createButtonText}>
                    {creatingDevices ? "Creating..." : "Create Sample Devices"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
};
