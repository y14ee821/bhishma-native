import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  ScrollView,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useRef, useEffect } from "react";
import { colors, lightTheme, darkTheme } from "../styles";
import { useSelector } from "react-redux";

export const HomeScreen = ({ navigation, darkMode, setDarkMode }) => {
  const [refreshing, setRefreshing] = useState(false);
  
  // Get real IoT device data from Redux
  const IE_Info = useSelector((state) => state.deviceControl.IE_Info);
  const connectedToBroker = useSelector((state) => state.deviceControl.connectedToBroker);
  const connectingToBroker = useSelector((state) => state.deviceControl.connectingToBroker);

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

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh - in real app, this would reconnect to MQTT or fetch latest data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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
                  Waiting for device connection...
                </Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingTop: 20,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  connectionBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 16,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  connectionText: {
    fontSize: 15,
    fontWeight: '800',
  },
  connectionSubtext: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    fontWeight: '600',
  },
  summary: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  deviceListContainer: {
    marginTop: 8,
  },
  deviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 0,
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  deviceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  deviceNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIcon: {
    fontSize: 36,
    marginRight: 12,
  },
  chevron: {
    fontSize: 32,
    color: '#5a9fc4',
    fontWeight: '600',
  },
  deviceCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#a3d5e8',
  },
  deviceStat: {
    alignItems: 'center',
  },
  activeStatValue: {
    color: '#2d5f8d',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
});
