import {
  View,
  Text,
  Pressable,
  StatusBar,
  Animated,
  Easing,
  ScrollView,
  RefreshControl,
  Alert,
  Platform,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef, useEffect, useMemo } from "react";
import { getTheme, useThemedStyles, makeHomeScreenStyles, homeScreenStaticStyles, lightTheme, darkTheme } from "../styles";
import { useIEInfo, useBrokerConnection, useBrokerConnecting } from "../reduxStates";
import { useDispatch } from "react-redux";
import { fetchIEInfo } from "../store/deviceControlSlice";
import { deviceAPI } from "../services/apiService";

const webPointer = Platform.OS === "web" ? { cursor: "pointer" } : {};

/** Narrow viewports (phones / mobile browser): show only the connection signal icon
 *  beside the greeting instead of the full status badge, so the greeting is never
 *  crushed and the technical broker copy is hidden on small screens. */
const CONNECTION_COMPACT_BREAKPOINT = 600;

/** Web/iOS narrow width: collapse "Your Devices" grid from 2 columns to 1 so
 *  device names and channel counts no longer get clipped on small screens. */
const DEVICE_STACK_BREAKPOINT = 720;

/** Even narrower width: drop the "Channels" word and just show the icon + count
 *  so the card content does not overflow on very small screens. */
const DEVICE_COMPACT_BREAKPOINT = 380;

/** Subtle layered gradients — dark panels + light cards */
const HOME_GRAD = {
  hero: ["rgba(44, 78, 118, 0.62)", "rgba(14, 26, 44, 0.52)", "rgba(28, 54, 92, 0.66)"],
  panelSky: ["rgba(36, 68, 102, 0.58)", "rgba(12, 22, 38, 0.5)", "rgba(22, 44, 74, 0.62)"],
  panelMint: ["rgba(26, 58, 54, 0.55)", "rgba(12, 22, 38, 0.5)", "rgba(20, 52, 50, 0.58)"],
  panelViolet: ["rgba(46, 32, 78, 0.55)", "rgba(12, 22, 38, 0.5)", "rgba(38, 26, 68, 0.6)"],
  /** System overview inner card — sky → slate → soft indigo (diagonal) */
  overviewCard: ["#ffffff", "#f0f9ff", "#dbeafe", "#e2e8f0"],
  /** Stats row — subtle teal → neutral → violet (matches device / channel metrics) */
  overviewStatsStrip: ["#ecfdf5", "#f8fafc", "#faf5ff"],
  actionPrimary: ["#ffffff", "#f0fdf9", "#d1fae5"],
  actionSecondary: ["#ffffff", "#f0f7ff", "#e0e7ff"],
  deviceCard: ["#ffffff", "#f8fafc", "#edf2f7"],
  emptyWell: ["#ffffff", "#f4f7fb", "#e8edf4"],
  /** Vivid gradient chips used behind section-header icons */
  badgeSky: ["#38bdf8", "#0284c7"],
  badgeMint: ["#34d399", "#059669"],
  badgeViolet: ["#a78bfa", "#7c3aed"],
};

/** Gradient chip behind a section-header icon — modern, glanceable section markers */
const SectionBadge = ({ colors: badgeColors, name, size = 22 }) => (
  <LinearGradient
    colors={badgeColors}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={homeScreenStaticStyles.sectionIconBadge}
  >
    <Ionicons name={name} size={size} color="#ffffff" />
  </LinearGradient>
);

/** Smoothly counts a number up to its target — dashboard-style stat reveal */
const AnimatedStatNumber = ({ value, style, duration = 1100 }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const id = anim.addListener(({ value: v }) => setDisplay(Math.round(v)));
    Animated.timing(anim, {
      toValue: value || 0,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(id);
  }, [value]);

  return (
    <Animated.Text style={style} allowFontScaling={false}>
      {display}
    </Animated.Text>
  );
};

/** Softly floating + rotating background icon (decorative, non-interactive) */
const FloatingIcon = ({ name, size, color, position, duration = 6000, range = 18, rotate = 8, delay = 0 }) => {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, {
          toValue: 1,
          duration,
          delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(v, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        homeScreenStaticStyles.floatingIcon,
        position,
        {
          opacity: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.16, 0.34, 0.16] }),
          transform: [
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -range] }) },
            { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${rotate}deg`] }) },
          ],
        },
      ]}
    >
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
};

/** Background field of drifting IoT icons — purely decorative */
const FloatingIconField = () => (
  <View pointerEvents="none" style={homeScreenStaticStyles.floatingLayer}>
    <FloatingIcon name="wifi" size={34} color="#7dd3fc" position={{ top: "7%", left: "8%" }} duration={5200} range={20} rotate={6} />
    <FloatingIcon name="bulb-outline" size={30} color="#fcd34d" position={{ top: "20%", right: "10%" }} duration={6400} range={16} rotate={-8} delay={400} />
    <FloatingIcon name="hardware-chip-outline" size={38} color="#a5b4fc" position={{ top: "44%", left: "5%" }} duration={7000} range={24} rotate={10} delay={200} />
    <FloatingIcon name="cloud-outline" size={32} color="#bae6fd" position={{ top: "58%", right: "7%" }} duration={5800} range={18} rotate={-6} delay={600} />
    <FloatingIcon name="pulse" size={28} color="#6ee7b7" position={{ top: "74%", left: "12%" }} duration={6000} range={16} rotate={8} delay={300} />
    <FloatingIcon name="flash-outline" size={26} color="#fca5a5" position={{ top: "86%", right: "14%" }} duration={5400} range={14} rotate={-10} delay={500} />
  </View>
);

/** Time-of-day greeting: Morning (<12), Afternoon (12–17), Evening (>=18) */
const computeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
};

export const HomeScreen = ({ navigation, darkMode, setDarkMode }) => {
  const { width: windowWidth } = useWindowDimensions();
  // On phones / narrow mobile-browser widths we collapse the broker status to just
  // the colored signal icon (no technical "MQTT Broker" copy) so the greeting keeps
  // full width. This is width-based (not platform-based) so it also fixes mobile web.
  const connectionCompact = windowWidth < CONNECTION_COMPACT_BREAKPOINT;
  // Android already renders each device row full-width; on web/iOS we collapse
  // the 2-column grid to a single column once the viewport is narrow.
  const devicesStacked =
    windowWidth < DEVICE_STACK_BREAKPOINT;
  const devicesCompact =
     windowWidth < DEVICE_COMPACT_BREAKPOINT;
  const [refreshing, setRefreshing] = useState(false);
  const [creatingDevices, setCreatingDevices] = useState(false);
  const [hoverActionPrimary, setHoverActionPrimary] = useState(false);
  const [hoverActionSecondary, setHoverActionSecondary] = useState(false);
  const [hoveredDeviceName, setHoveredDeviceName] = useState(null);
  const dispatch = useDispatch();

  // Computed once per render (updates on screen re-render / page refresh).
  const greeting = computeGreeting();

  const headerAnimatedValue = useRef(new Animated.Value(0)).current;
  const sectionOverview = useRef(new Animated.Value(0)).current;
  const sectionActions = useRef(new Animated.Value(0)).current;
  const sectionTail = useRef(new Animated.Value(0)).current;
  const actionCardLeft = useRef(new Animated.Value(0)).current;
  const actionCardRight = useRef(new Animated.Value(0)).current;
  const deviceRowAnims = useRef({}).current;
  const orbFloat = useRef(new Animated.Value(0)).current;
  const connPulse = useRef(new Animated.Value(0)).current;

  // Get real IoT device data from Redux
  const IE_Info = useIEInfo();
  const connectedToBroker = useBrokerConnection();
  const connectingToBroker = useBrokerConnecting();

  const deviceListSignature = useMemo(() => {
    if (!IE_Info || Object.keys(IE_Info).length === 0) return "";
    return Object.keys(IE_Info)
      .sort()
      .join("\u0000");
  }, [IE_Info]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(orbFloat, {
          toValue: 1,
          duration: 6000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(orbFloat, {
          toValue: 0,
          duration: 6000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(connPulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(connPulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  useEffect(() => {
    sectionOverview.setValue(0);
    sectionActions.setValue(0);
    sectionTail.setValue(0);
    actionCardLeft.setValue(0);
    actionCardRight.setValue(0);

    // Run everything in parallel with small staggered delays (instead of a strict
    // sequence) so all sections start animating in almost immediately and cascade in
    // under ~0.7s — fixes the slow, drawn-out reveal of the lower content.
    const springIn = (v, delay = 0) =>
      Animated.spring(v, {
        toValue: 1,
        delay,
        tension: 60,
        friction: 9,
        useNativeDriver: true,
      });

    Animated.parallel([
      Animated.timing(headerAnimatedValue, {
        toValue: 1,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      springIn(sectionOverview, 70),
      springIn(sectionActions, 130),
      springIn(actionCardLeft, 170),
      springIn(actionCardRight, 220),
      springIn(sectionTail, 260),
    ]).start();
  }, []);

  useEffect(() => {
    if (!IE_Info || Object.keys(IE_Info).length === 0) return;
    Object.keys(IE_Info).forEach((name) => {
      if (deviceRowAnims[name] == null) {
        deviceRowAnims[name] = new Animated.Value(0);
      }
    });
    const rowSprings = Object.keys(IE_Info).map((name, index) =>
      Animated.spring(deviceRowAnims[name], {
        toValue: 1,
        // Cap the stagger so long device lists still finish quickly
        delay: Math.min(index * 45, 360),
        tension: 58,
        friction: 9,
        useNativeDriver: true,
      })
    );
    Animated.parallel(rowSprings).start();
  }, [deviceListSignature, IE_Info]);

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
  const t = getTheme(darkMode);
  const styles = useThemedStyles(makeHomeScreenStyles, darkMode);

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
    outputRange: [-56, 0],
  });

  const sectionEnterStyle = (anim) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [22, 0],
        }),
      },
    ],
  });

  const actionCardEnterStyle = (anim) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.96, 1],
        }),
      },
    ],
  });

  const getDeviceRowAnim = (name) => {
    if (deviceRowAnims[name] == null) {
      deviceRowAnims[name] = new Animated.Value(0);
    }
    return deviceRowAnims[name];
  };

  const getConnectionStatus = () => {
    if (connectingToBroker) return "Connecting to server...";
    return connectedToBroker ? "Connected to server" : "Disconnected from server";
  };

  const statusColor = connectingToBroker
    ? "#d97706"
    : connectedToBroker
    ? "#059669"
    : "#dc2626";

  const getDeviceIcon = (deviceName) => {
    const firstLetter = deviceName.charAt(0).toUpperCase();
    return firstLetter;
  };

  return (
    <LinearGradient colors={theme.gradient} style={styles.gradient}>
      <View style={styles.container}>
        <StatusBar
          barStyle={darkMode ? "light-content" : "dark-content"}
          backgroundColor={t.gradient[0]}
        />

        <FloatingIconField />

        <ScrollView 
          style={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.header}>
            {/* Hero — slide + fade */}
            <Animated.View
              style={{
                transform: [{ translateY: headerTranslateY }],
                opacity: headerAnimatedValue,
              }}
            >
            {/* One header card: greeting + broker status */}
            <LinearGradient
              colors={HOME_GRAD.hero}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerUnifiedCard}
            >
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.heroOrb,
                  styles.heroOrbA,
                  {
                    transform: [
                      {
                        translateY: orbFloat.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 16],
                        }),
                      },
                      {
                        scale: orbFloat.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.12],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.heroOrb,
                  styles.heroOrbB,
                  {
                    transform: [
                      {
                        translateY: orbFloat.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -14],
                        }),
                      },
                      {
                        scale: orbFloat.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1.1, 1],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <View style={styles.headerSection}>
                <View style={styles.headerGreetingColumn}>
                  <View style={styles.greetingStack}>
                    <View style={styles.greetingTitleRow}>
                      <LinearGradient
                        colors={["#38bdf8", "#2563eb"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.greetingIconSlot, styles.greetingIconBubbleFancy]}
                      >
                        <Ionicons name="planet" size={20} color="#ffffff" />
                      </LinearGradient>
                      <View style={styles.greetingRowTextCol}>
                        <Text
                          style={[theme.greeting, styles.homeGreetingText]}
                          numberOfLines={2}
                          adjustsFontSizeToFit={connectionCompact}
                          minimumFontScale={0.8}
                          {...(Platform.OS === "android" ? { includeFontPadding: false } : {})}
                        >
                          {greeting}!
                        </Text>
                      </View>
                    </View>
                    <View style={styles.greetingAccentLine} />
                    <View style={styles.subtitleRow}>
                      <LinearGradient
                        colors={["#a78bfa", "#7c3aed"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.greetingIconSlot, styles.greetingIconBubbleFancy]}
                      >
                        <Ionicons name="pulse" size={20} color="#ffffff" />
                      </LinearGradient>
                      <View style={styles.greetingRowTextCol}>
                        <Text
                          style={[theme.subtitle, styles.homeSubtitleText]}
                          numberOfLines={2}
                          {...(Platform.OS === "android" ? { includeFontPadding: false } : {})}
                        >
                          Control your IoT devices
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {!connectionCompact && <View style={styles.headerColumnDivider} />}

                <View
                  style={[
                    styles.headerBrokerColumn,
                    connectionCompact && styles.headerBrokerColumnCompact,
                  ]}
                >
                  {connectionCompact ? (
                    <View
                      style={[
                        styles.connectionIconBubble,
                        styles.connectionIconBubbleCompact,
                        connectingToBroker && styles.connectionIconBubblePending,
                        !connectingToBroker &&
                          connectedToBroker &&
                          styles.connectionIconBubbleOk,
                        !connectingToBroker &&
                          !connectedToBroker &&
                          styles.connectionIconBubbleErr,
                      ]}
                      accessibilityRole="image"
                      accessibilityLabel={getConnectionStatus()}
                    >
                      <Ionicons
                        name={
                          connectingToBroker
                            ? "sync"
                            : connectedToBroker
                            ? "wifi"
                            : "cloud-offline-outline"
                        }
                        size={24}
                        color={
                          connectingToBroker
                            ? "#d97706"
                            : connectedToBroker
                            ? "#059669"
                            : "#dc2626"
                        }
                      />
                    </View>
                  ) : (
                    <View style={styles.connectionBadge}>
                      <View style={styles.connectionIconWrap}>
                        <Animated.View
                          pointerEvents="none"
                          style={[
                            styles.connectionHalo,
                            {
                              backgroundColor: statusColor,
                              opacity: connPulse.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.08, 0.34],
                              }),
                              transform: [
                                {
                                  scale: connPulse.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.85, 1.35],
                                  }),
                                },
                              ],
                            },
                          ]}
                        />
                        <View
                          style={[
                            styles.connectionIconBubble,
                            styles.connectionIconBubbleInBadge,
                            connectingToBroker && styles.connectionIconBubblePending,
                            !connectingToBroker &&
                              connectedToBroker &&
                              styles.connectionIconBubbleOk,
                            !connectingToBroker &&
                              !connectedToBroker &&
                              styles.connectionIconBubbleErr,
                          ]}
                        >
                          <Ionicons
                            name={
                              connectingToBroker
                                ? "sync"
                                : connectedToBroker
                                ? "wifi"
                                : "cloud-offline-outline"
                            }
                            size={26}
                            color={statusColor}
                          />
                        </View>
                      </View>
                      <View style={styles.connectionBadgeTextBlock}>
                        <Text numberOfLines={2} style={[styles.connectionText, { color: statusColor }]}>
                          {getConnectionStatus()}
                        </Text>
                        <View style={styles.connectionLiveRow}>
                          <Animated.View
                            style={[
                              styles.connectionLiveDot,
                              {
                                backgroundColor: statusColor,
                                opacity: connPulse.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0.45, 1],
                                }),
                              },
                            ]}
                          />
                          <Text style={[styles.connectionLiveText, { color: statusColor }]}>
                            {connectingToBroker ? "Linking…" : connectedToBroker ? "Live" : "Offline"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </LinearGradient>
            </Animated.View>

            {/* System Overview — counts from account / DB, not live telemetry */}
            <Animated.View style={sectionEnterStyle(sectionOverview)}>
            <LinearGradient
              colors={HOME_GRAD.panelSky}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.contentSection}
            >
              <View style={[styles.devicesSectionHeader, styles.devicesSectionHeaderInPanel]}>
                <SectionBadge colors={HOME_GRAD.badgeSky} name="speedometer" />
                <Text style={[theme.sectionTitle, styles.devicesSectionTitle]}>Overview</Text>
              </View>
              <LinearGradient
                colors={t.home.overviewCardGradient}
                locations={[0, 0.28, 0.62, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.overviewCard}
              >
                <View style={styles.overviewHeader}>
                  <View style={styles.overviewTitleRow}>
                    <View style={styles.overviewTitleIconOrb}>
                      <Ionicons name="speedometer-outline" size={24} color="#1d4ed8" />
                    </View>
                    <Text style={styles.overviewTitle}>System Overview</Text>
                  </View>
                  <Text style={styles.overviewHint}>
                    These numbers come from what you have set up in the app. They do not show
                    whether your devices are on or off at this moment.{"\n"}
                    “Channels” means how many things you can control when your device is
                    running and connected.
                  </Text>
                </View>
                <LinearGradient
                  colors={t.home.statsStripGradient}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.overviewStatsBand}
                >
                  <View style={styles.overviewStats}>
                    <View style={styles.overviewStatItem}>
                      <View style={styles.overviewStatLabelRow}>
                        <View style={styles.overviewStatIconOrb}>
                          <Ionicons name="hardware-chip-outline" size={22} color="#0369a1" />
                        </View>
                        <Text style={styles.overviewStatLabel}>Devices you own</Text>
                      </View>
                      <AnimatedStatNumber value={stats.totalDevices} style={styles.overviewStatNumber} />
                    </View>
                    <View style={styles.overviewDivider} />
                    <View style={styles.overviewStatItem}>
                      <View style={styles.overviewStatLabelRow}>
                        <View style={[styles.overviewStatIconOrb, styles.overviewStatIconOrbAlt]}>
                          <Ionicons name="git-network-outline" size={22} color="#5b21b6" />
                        </View>
                        <Text style={styles.overviewStatLabel}>channels</Text>
                      </View>
                      <AnimatedStatNumber value={stats.totalChannels} style={styles.overviewStatNumber} />
                    </View>
                  </View>
                </LinearGradient>
              </LinearGradient>
            </LinearGradient>
            </Animated.View>

            {/* Quick actions — short titles + plain-language hints */}
            <Animated.View style={sectionEnterStyle(sectionActions)}>
            <LinearGradient
              colors={HOME_GRAD.panelMint}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.contentSection, styles.contentSectionActions]}
            >
              <View style={[styles.devicesSectionHeader, styles.devicesSectionHeaderInPanel]}>
                <SectionBadge colors={HOME_GRAD.badgeMint} name="flash" />
                <Text style={[theme.sectionTitle, styles.devicesSectionTitle]}>Quick actions</Text>
              </View>
              <View style={styles.actionButtonsContainer}>
                <Animated.View style={[styles.actionButtonCardWrap, actionCardEnterStyle(actionCardLeft)]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Add device"
                  android_ripple={{ color: "rgba(20, 184, 166, 0.22)", foreground: false }}
                  onHoverIn={() => setHoverActionPrimary(true)}
                  onHoverOut={() => setHoverActionPrimary(false)}
                  onPress={() => navigation.navigate("AddDevice")}
                  style={({ pressed }) => [
                    styles.actionButtonCard,
                    styles.primaryButton,
                    webPointer,
                    hoverActionPrimary && styles.actionPrimaryHover,
                    pressed && styles.actionPrimaryPressed,
                  ]}
                >
                  <LinearGradient
                    pointerEvents="none"
                    colors={t.home.actionPrimaryGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.actionCardGradient}
                  />
                  <View style={styles.actionCardBody} pointerEvents="box-none">
                    <View style={[styles.actionIconWrap, styles.actionIconWrapPrimary]}>
                      <Ionicons name="scan-circle-outline" size={40} color="#047857" />
                    </View>
                    <Text style={[styles.actionButtonTitle, styles.actionCardTitle]}>
                      Add Device
                    </Text>
                    <Text style={[styles.actionButtonHint, styles.actionCardHint]}>
                      Add another device to your list so you can use it here.
                    </Text>
                  </View>
                </Pressable>
                </Animated.View>

                <Animated.View style={[styles.actionButtonCardWrap, actionCardEnterStyle(actionCardRight)]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Device control"
                  android_ripple={{ color: "rgba(37, 99, 235, 0.22)", foreground: false }}
                  onHoverIn={() => setHoverActionSecondary(true)}
                  onHoverOut={() => setHoverActionSecondary(false)}
                  onPress={() => navigation.navigate("DeviceControl")}
                  style={({ pressed }) => [
                    styles.actionButtonCard,
                    styles.secondaryButton,
                    webPointer,
                    hoverActionSecondary && styles.actionSecondaryHover,
                    pressed && styles.actionSecondaryPressed,
                  ]}
                >
                  <LinearGradient
                    pointerEvents="none"
                    colors={t.home.actionSecondaryGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.actionCardGradient}
                  />
                  <View style={styles.actionCardBody} pointerEvents="box-none">
                    <View style={[styles.actionIconWrap, styles.actionIconWrapSecondary]}>
                      <Ionicons name="options-outline" size={40} color="#1e40af" />
                    </View>
                    <Text style={[styles.actionButtonTitle, styles.actionCardTitle]}>
                      Device Control
                    </Text>
                    <Text style={[styles.actionButtonHint, styles.actionCardHint]}>
                      See your devices and switch things on or off in one place.
                    </Text>
                  </View>
                </Pressable>
                </Animated.View>
              </View>
            </LinearGradient>
            </Animated.View>

            {/* Device list — same visual language as header (icons + aligned rows) */}
            {IE_Info && Object.keys(IE_Info).length > 0 && (
              <Animated.View style={sectionEnterStyle(sectionTail)}>
              <LinearGradient
                colors={HOME_GRAD.panelViolet}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.contentSection, styles.contentSectionDevices]}
              >
                <View style={[styles.devicesSectionHeader, styles.devicesSectionHeaderInPanel]}>
                  <SectionBadge colors={HOME_GRAD.badgeViolet} name="layers" />
                  <Text style={[theme.sectionTitle, styles.devicesSectionTitle]}>Your Devices</Text>
                </View>
                <View style={styles.deviceListContainer}>
                  {Object.entries(IE_Info).map(([deviceName, deviceInfo]) => {
                    const channelCount = deviceInfo.channels
                      ? Object.keys(deviceInfo.channels).length
                      : 0;
                    const rowAnim = getDeviceRowAnim(deviceName);
                    return (
                      <Animated.View
                        key={deviceName}
                        style={[
                          styles.deviceCardWrap,
                          devicesStacked && styles.deviceCardWrapStacked,
                          {
                            opacity: rowAnim,
                            transform: [
                              {
                                translateY: rowAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [16, 0],
                                }),
                              },
                            ],
                          },
                        ]}
                      >
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Open device ${deviceName}`}
                          android_ripple={{ color: "rgba(59, 130, 246, 0.18)", foreground: false }}
                          onHoverIn={() => setHoveredDeviceName(deviceName)}
                          onHoverOut={() =>
                            setHoveredDeviceName((current) =>
                              current === deviceName ? null : current
                            )
                          }
                          onPress={() =>
                            navigation.navigate("DedicatedIEControl", {
                              name: deviceName,
                              device_id: deviceInfo?.device_id || "",
                            })
                          }
                          style={({ pressed }) => {
                            const hovered = hoveredDeviceName === deviceName;
                            return [
                              theme.deviceCard,
                              styles.deviceCard,
                              webPointer,
                              !pressed && hovered && styles.deviceCardHoverLift,
                              hovered && styles.deviceCardHover,
                              pressed && styles.deviceCardPressed,
                            ];
                          }}
                        >
                          <LinearGradient
                            pointerEvents="none"
                            colors={t.home.deviceCardGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.deviceCardGradient}
                          />
                          <View style={styles.deviceCardBody} pointerEvents="box-none">
                            <View style={styles.deviceCardMainRow}>
                              <View style={styles.deviceCardLeftZone}>
                                <Text
                                  style={styles.deviceIcon}
                                  allowFontScaling={false}
                                  {...(Platform.OS === "android" ? { includeFontPadding: false } : {})}
                                >
                                  {getDeviceIcon(deviceName)}
                                </Text>
                                <Text
                                  style={[theme.deviceName, styles.deviceCardNameText, styles.deviceCardNameInline]}
                                  numberOfLines={1}
                                  ellipsizeMode="tail"
                                  {...(Platform.OS === "android" ? { includeFontPadding: false } : {})}
                                >
                                  {deviceName.toUpperCase()}
                                </Text>
                              </View>
                              <View style={styles.deviceNameChannelSep} />
                              <LinearGradient
                                colors={t.home.channelPillGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.deviceChannelsPill}
                              >
                                <Ionicons
                                  name="radio-outline"
                                  size={Platform.OS === "android" ? 16 : 20}
                                  color="#4338ca"
                                  style={styles.deviceChannelPillIcon}
                                />
                                {!devicesCompact && (
                                  <Text style={styles.deviceChannelLabel}>Channels</Text>
                                )}
                                <Text style={styles.deviceChannelCount}>{channelCount}</Text>
                              </LinearGradient>
                            </View>

                            {deviceInfo.lastUpdated && (
                              <Text style={[theme.lastUpdated, styles.deviceCardUpdated]}>
                                Updated: {new Date(deviceInfo.lastUpdated).toLocaleTimeString()}
                              </Text>
                            )}
                          </View>
                        </Pressable>
                      </Animated.View>
                    );
                  })}
                </View>
              </LinearGradient>
              </Animated.View>
            )}

            {/* Empty State */}
            {(!IE_Info || Object.keys(IE_Info).length === 0) && (
              <Animated.View style={sectionEnterStyle(sectionTail)}>
              <LinearGradient
                colors={HOME_GRAD.panelViolet}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.contentSection, styles.contentSectionDevices]}
              >
                <View style={[styles.devicesSectionHeader, styles.devicesSectionHeaderInPanel]}>
                  <SectionBadge colors={HOME_GRAD.badgeViolet} name="layers" />
                  <Text style={[theme.sectionTitle, styles.devicesSectionTitle]}>Your Devices</Text>
                </View>
                <LinearGradient
                  colors={t.home.emptyWellGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.emptyState}
                >
                  <View style={styles.emptyStateIconRing}>
                    <Ionicons name="telescope-outline" size={44} color="#38bdf8" />
                  </View>
                  <Text style={styles.emptyStateTitle}>No Devices Found</Text>
                  <Text style={styles.emptyStateSubtitle}>
                    Add your first device to get started
                  </Text>
                </LinearGradient>
              </LinearGradient>
              </Animated.View>
            )}

          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
};
