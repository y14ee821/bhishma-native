import {
  View,
  Text,
  Pressable,
  StatusBar,
  Animated,
  ScrollView,
  RefreshControl,
  Alert,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef, useEffect, useMemo } from "react";
import { colors, lightTheme, darkTheme, homeScreenStyles } from "../styles";
import { useIEInfo, useBrokerConnection, useBrokerConnecting } from "../reduxStates";
import { useDispatch } from "react-redux";
import { fetchIEInfo } from "../store/deviceControlSlice";
import { deviceAPI } from "../services/apiService";

const styles = homeScreenStyles;

const webPointer = Platform.OS === "web" ? { cursor: "pointer" } : {};

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
};

export const HomeScreen = ({ navigation, darkMode, setDarkMode }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [creatingDevices, setCreatingDevices] = useState(false);
  const [hoverActionPrimary, setHoverActionPrimary] = useState(false);
  const [hoverActionSecondary, setHoverActionSecondary] = useState(false);
  const [hoveredDeviceName, setHoveredDeviceName] = useState(null);
  const dispatch = useDispatch();

  const headerAnimatedValue = useRef(new Animated.Value(0)).current;
  const sectionOverview = useRef(new Animated.Value(0)).current;
  const sectionActions = useRef(new Animated.Value(0)).current;
  const sectionTail = useRef(new Animated.Value(0)).current;
  const actionCardLeft = useRef(new Animated.Value(0)).current;
  const actionCardRight = useRef(new Animated.Value(0)).current;
  const deviceRowAnims = useRef({}).current;

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
    sectionOverview.setValue(0);
    sectionActions.setValue(0);
    sectionTail.setValue(0);
    actionCardLeft.setValue(0);
    actionCardRight.setValue(0);

    const springIn = (v) =>
      Animated.spring(v, {
        toValue: 1,
        tension: 52,
        friction: 8,
        useNativeDriver: true,
      });

    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerAnimatedValue, {
          toValue: 1,
          duration: 680,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(60),
      springIn(sectionOverview),
      springIn(sectionActions),
      Animated.parallel([
        springIn(actionCardLeft),
        Animated.sequence([Animated.delay(90), springIn(actionCardRight)]),
      ]),
      springIn(sectionTail),
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
        delay: 40 + index * 85,
        tension: 48,
        friction: 8,
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getConnectionStatus = () => {
    if (connectingToBroker) return "Connecting...";
    return connectedToBroker ? "Connected" : "Disconnected";
  };

  const getDeviceIcon = (deviceName) => {
    const firstLetter = deviceName.charAt(0).toUpperCase();
    return firstLetter;
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
              <View style={styles.headerSection}>
                <View style={styles.headerGreetingColumn}>
                  <View style={styles.greetingStack}>
                    <View style={styles.greetingTitleRow}>
                      <View style={[styles.greetingIconSlot, styles.greetingSciFiIconBubble]}>
                        <Ionicons
                          name="planet-outline"
                          size={22}
                          color="rgba(186, 230, 253, 0.98)"
                        />
                      </View>
                      <Text style={[theme.greeting, styles.homeGreetingText]}>
                        {getGreeting()}!
                      </Text>
                    </View>
                    <View style={styles.greetingAccentLine} />
                    <View style={styles.subtitleRow}>
                      <View style={[styles.greetingIconSlot, styles.greetingSciFiIconBubble]}>
                        <Ionicons
                          name="pulse-outline"
                          size={22}
                          color="rgba(186, 230, 253, 0.98)"
                        />
                      </View>
                      <Text style={[theme.subtitle, styles.homeSubtitleText]}>
                        Control your IoT devices
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.headerColumnDivider} />

                <View style={styles.headerBrokerColumn}>
                  <View style={styles.connectionBadge}>
                    <View
                      style={[
                        styles.connectionIconBubble,
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
                        color={
                          connectingToBroker
                            ? "#d97706"
                            : connectedToBroker
                            ? "#059669"
                            : "#dc2626"
                        }
                      />
                    </View>
                    <View style={styles.connectionBadgeTextBlock}>
                      <Text
                        style={[
                          styles.connectionText,
                          {
                            color: connectingToBroker
                              ? "#d97706"
                              : connectedToBroker
                              ? "#059669"
                              : "#dc2626",
                          },
                        ]}
                      >
                        {getConnectionStatus()}
                      </Text>
                      <Text style={styles.connectionSubtext}>MQTT Broker</Text>
                    </View>
                  </View>
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
                <Ionicons
                  name="speedometer-outline"
                  size={24}
                  color="rgba(186, 230, 253, 0.98)"
                  style={styles.devicesSectionHeaderIcon}
                />
                <Text style={[theme.sectionTitle, styles.devicesSectionTitle]}>Overview</Text>
              </View>
              <LinearGradient
                colors={HOME_GRAD.overviewCard}
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
                  colors={HOME_GRAD.overviewStatsStrip}
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
                      <Text style={styles.overviewStatNumber}>{stats.totalDevices}</Text>
                    </View>
                    <View style={styles.overviewDivider} />
                    <View style={styles.overviewStatItem}>
                      <View style={styles.overviewStatLabelRow}>
                        <View style={[styles.overviewStatIconOrb, styles.overviewStatIconOrbAlt]}>
                          <Ionicons name="git-network-outline" size={22} color="#5b21b6" />
                        </View>
                        <Text style={styles.overviewStatLabel}>channels</Text>
                      </View>
                      <Text style={styles.overviewStatNumber}>{stats.totalChannels}</Text>
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
                <Ionicons
                  name="flash-outline"
                  size={24}
                  color="rgba(167, 243, 208, 0.98)"
                  style={styles.devicesSectionHeaderIcon}
                />
                <Text style={[theme.sectionTitle, styles.devicesSectionTitle]}>Quick actions</Text>
              </View>
              <View style={styles.actionButtonsContainer}>
                <Animated.View style={[styles.actionButtonCardWrap, actionCardEnterStyle(actionCardLeft)]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Add device"
                  android_ripple={{ color: "rgba(20, 184, 166, 0.22)", foreground: true }}
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
                    colors={HOME_GRAD.actionPrimary}
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
                  android_ripple={{ color: "rgba(37, 99, 235, 0.22)", foreground: true }}
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
                    colors={HOME_GRAD.actionSecondary}
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
                  <Ionicons
                    name="layers-outline"
                    size={24}
                    color="rgba(221, 214, 254, 0.98)"
                    style={styles.devicesSectionHeaderIcon}
                  />
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
                          android_ripple={{ color: "rgba(59, 130, 246, 0.18)", foreground: true }}
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
                            colors={HOME_GRAD.deviceCard}
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
                                >
                                  {deviceName.toUpperCase()}
                                </Text>
                              </View>
                              <View style={styles.deviceNameChannelSep} />
                              <View style={styles.deviceCardRightZone}>
                                <View style={styles.deviceCardChannelsRow}>
                                  <View style={styles.deviceChannelEmojiWrap}>
                                    <Ionicons name="radio-outline" size={24} color="#4338ca" />
                                  </View>
                                  <Text style={styles.deviceChannelLabel}>Channels</Text>
                                  <Text style={styles.deviceChannelCount}>{channelCount}</Text>
                                </View>
                              </View>
                              <Ionicons
                                name="chevron-forward"
                                size={30}
                                color="#334155"
                                style={styles.deviceCardChevron}
                              />
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
                  <Ionicons
                    name="layers-outline"
                    size={24}
                    color="rgba(221, 214, 254, 0.98)"
                    style={styles.devicesSectionHeaderIcon}
                  />
                  <Text style={[theme.sectionTitle, styles.devicesSectionTitle]}>Your Devices</Text>
                </View>
                <LinearGradient
                  colors={HOME_GRAD.emptyWell}
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
