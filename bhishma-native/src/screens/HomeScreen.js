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

export const HomeScreen = ({ navigation, darkMode, setDarkMode }) => {
  //const [darkMode, setDarkMode] = useState(false);
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
  const [devices, setDevices] = useState([
    {
      id: 1,
      name: "Living Room Light",
      icon: "💡",
      isOn: true,
      room: "Living Room",
    },
    { id: 2, name: "Kitchen Fan", icon: "🌀", isOn: false, room: "Kitchen" },
    { id: 3, name: "Bedroom AC", icon: "❄️", isOn: true, room: "Bedroom" },
    {
      id: 4,
      name: "Garden Sprinkler",
      icon: "💧",
      isOn: false,
      room: "Garden",
    },
    {
      id: 5,
      name: "Security Camera",
      icon: "📹",
      isOn: true,
      room: "Entrance",
    },
    { id: 6, name: "Smart TV", icon: "📺", isOn: false, room: "Living Room" },
  ]);
  const activeDevices = devices.filter((device) => device.isOn).length;

  console.log(darkMode, setDarkMode);
  const theme = darkMode ? darkTheme : lightTheme;

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

  return (
    <LinearGradient colors={theme.gradient} style={styles.gradient}>
      <View style={styles.container}>
        <StatusBar
          barStyle={darkMode ? "light-content" : "dark-content"}
          backgroundColor={colors.background}
        />

        {/* Theme Toggle Button */}

        <ScrollView style={styles.container}>
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
            <Text style={theme.subtitle}>Control your smart home</Text>

            {/* Stats Cards */}
            <View style={theme.statsContainer}>
              <View style={theme.statCard}>
                <Text style={theme.statNumber}>{devices.length}</Text>
                <Text style={theme.statLabel}>Total Devices</Text>
              </View>
              <View style={theme.statCard}>
                <Text style={theme.statNumber}>{activeDevices}</Text>
                <Text style={theme.statLabel}>Active Now</Text>
              </View>
              <View style={theme.statCard}>
                <Text style={theme.statNumber}>
                  {Math.round((activeDevices / devices.length) * 100)}%
                </Text>
                <Text style={theme.statLabel}>Usage</Text>
              </View>
            </View>

            <View style={styles.summary}>
              <TouchableOpacity
                style={[theme.addButton]}
                onPress={() => navigation.navigate("DeviceControl")}
              >
                <Text style={[theme.addButtonText,]}>
                  Control
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
};
const styles = StyleSheet.create({
  container:{
    paddingTop: 20,
  },
  gradient: {
    flex: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    letterSpacing: 1.2,
    textAlign: "center",
  },
  summary: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
    marginTop: 30,
  },
});
