import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
  FlatList,
  RefreshControl,
} from 'react-native';


const { width, height } = Dimensions.get('window');

export const IoTHomeScreen = () => {
  const isDark = true


  
    const colors = {
    light: {
      primary: '#6200EE',
      secondary: '#03DAC6',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      card: '#FFFFFF',
      text: '#000000',
      textSecondary: '#666666',
      accent: '#FF6B35',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      shadow: 'rgba(0,0,0,0.1)',
      overlay: 'rgba(0,0,0,0.5)',
    },
    dark: {
      primary: '#BB86FC',
      secondary: '#03DAC6',
      background: '#121212',
      surface: '#1E1E1E',
      card: '#2C2C2C',
      text: '#FFFFFF',
      textSecondary: '#AAAAAA',
      accent: '#FF6B35',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#CF6679',
      shadow: 'rgba(255,255,255,0.1)',
      overlay: 'rgba(255,255,255,0.1)',
    },
  };

  const [refreshing, setRefreshing] = useState(false);
  const [devices, setDevices] = useState([
    { id: 1, name: 'Living Room Light', icon: '💡', isOn: true, room: 'Living Room' },
    { id: 2, name: 'Kitchen Fan', icon: '🌀', isOn: false, room: 'Kitchen' },
    { id: 3, name: 'Bedroom AC', icon: '❄️', isOn: true, room: 'Bedroom' },
    { id: 4, name: 'Garden Sprinkler', icon: '💧', isOn: false, room: 'Garden' },
    { id: 5, name: 'Security Camera', icon: '📹', isOn: true, room: 'Entrance' },
    { id: 6, name: 'Smart TV', icon: '📺', isOn: false, room: 'Living Room' },
  ]);

  const headerAnimatedValue = useRef(new Animated.Value(0)).current;
  const fadeAnimatedValue = useRef(new Animated.Value(0)).current;

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

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const toggleDevice = (deviceId) => {
    setDevices(devices.map(device =>
      device.id === deviceId
        ? { ...device, isOn: !device.isOn }
        : device
    ));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const activeDevices = devices.filter(device => device.isOn).length;

  const headerTranslateY = headerAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0],
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      backgroundColor: colors.background,
    },
    greeting: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 20,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    statCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      flex: 1,
      marginHorizontal: 4,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginHorizontal: 20,
      marginBottom: 16,
    },
    devicesList: {
      paddingHorizontal: 12,
    },
    floatingButton: {
      position: 'absolute',
      bottom: 30,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    themeToggle: {
      position: 'absolute',
      top: 60,
      right: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
  });


  return (

        <View style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      
      {/* Theme Toggle Button */}
      <TouchableOpacity
        style={styles.themeToggle}
        //onPress={() => toggleTheme(isDark ? 'light' : 'dark')}
      >
        <Text style={{ fontSize: 20 }}>
          {isDark ? '☀️' : '🌙'}
        </Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
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
          <Text style={styles.greeting}>{getGreeting()}!</Text>
          <Text style={styles.subtitle}>Control your smart home</Text>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{devices.length}</Text>
              <Text style={styles.statLabel}>Total Devices</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{activeDevices}</Text>
              <Text style={styles.statLabel}>Active Now</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {Math.round((activeDevices / devices.length) * 100)}%
              </Text>
              <Text style={styles.statLabel}>Usage</Text>
            </View>
          </View>
        </Animated.View>

        {/* Devices Section */}
   
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.floatingButton}>
        <Text style={{ color: '#FFFFFF', fontSize: 24 }}>+</Text>
      </TouchableOpacity>
    </View>

);
};


