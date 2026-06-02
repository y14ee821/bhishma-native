import React, { Suspense, lazy } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen, DeviceControl, DedicatedIEControl, IoTHomeScreen, AddDevice } from "../screens";
import { ErrorComponent } from "../components";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { clearError } from "../store/utilsSlice"
import { logout } from "../store/authSlice"
import { useNavigation } from "@react-navigation/native";
import { useWindowDimensions } from 'react-native';
import { BaseStyle, lightNavTheme, darkNavTheme, routesStyles } from '../styles';
import { Platform } from "react-native";
import {FlashIcon, HomeIcon, ControlIcon, AutoIcon} from '../icons';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const LoginScreen = lazy(() => import("../screens/LoginScreen"));

const NAV_STACK_BREAKPOINT = 560;
const NAV_GRAD_LIGHT = ["#0f2747", "#1e3a5f", "#28507e"];
const NAV_GRAD_DARK = ["#050507", "#0f0f12", "#050507"];
const LOGO_GRAD = ["#38bdf8", "#2563eb"];
const LOGOUT_GRAD = ["#fb7185", "#e11d48"];

const NavBar = ({ current, onNavigate, darkMode, setDarkMode, autoDarkMode, setAutoDarkMode, user, onLogout }) => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const showIcons = width < 900;
  const theme = darkMode ? darkNavTheme : lightNavTheme;
  const statusTop =
    Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0;
  const topInset = Math.max(insets.top, statusTop);
  const navSafe =
    Platform.OS === "web"
      ? {}
      : {
          paddingTop: topInset + 10,
          paddingBottom: 12,
          paddingLeft: 16 + insets.left,
          paddingRight: 16 + insets.right,
        };

  // Width-based (not platform-based) so a narrow mobile browser also gets the two-row
  // layout — otherwise the single row overflows and the Logout button is pushed off-screen.
  const useStackedNav = width < NAV_STACK_BREAKPOINT;

  const webPointer = Platform.OS === "web" ? { cursor: "pointer" } : {};
  const navTextColor = darkMode ? "#cbd5e1" : "rgba(255, 255, 255, 0.92)";
  const userInitial = (user?.name || user?.email || "?").charAt(0).toUpperCase();

  const brand = (
    <View style={styles.brandRow}>
      <LinearGradient
        colors={LOGO_GRAD}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.brandBadge}
      >
        <Ionicons name="hardware-chip" size={20} color="#ffffff" />
      </LinearGradient>
      <Text style={styles.brandText}>Remcon</Text>
    </View>
  );

  const renderNavPill = (routeName, label, icon) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate(routeName)}
      style={[styles.navPill, darkMode ? styles.navPillDark : styles.navPillLight, webPointer]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={18} color={navTextColor} />
      {!showIcons && (
        <Text style={[styles.navPillText, { color: navTextColor }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );

  const navLinks = (
    <View style={styles.navLinks}>
      {renderNavPill("HomeScreen", "Home", "home-outline")}
      {renderNavPill("DeviceControl", "Control", "options-outline")}
    </View>
  );

  const themeMode = autoDarkMode ? "auto" : darkMode ? "dark" : "light";
  const themeMeta = {
    auto: { icon: "contrast-outline", label: "Auto", color: "#a78bfa" },
    dark: { icon: "moon", label: "Dark", color: "#7dd3fc" },
    light: { icon: "sunny", label: "Light", color: "#fbbf24" },
  }[themeMode];

  // Single control cycles: Auto -> Dark -> Light -> Auto
  const cycleThemeMode = () => {
    if (autoDarkMode) {
      setAutoDarkMode(false);
      setDarkMode(true);
    } else if (darkMode) {
      setDarkMode(false);
    } else {
      setAutoDarkMode(true);
    }
  };

  const themeControls = (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={cycleThemeMode}
      style={[styles.navPill, darkMode ? styles.navPillDark : styles.navPillLight, webPointer]}
      accessibilityRole="button"
      accessibilityLabel={`Theme mode: ${themeMeta.label}. Tap to switch`}
    >
      <Ionicons name={themeMeta.icon} size={18} color={themeMeta.color} />
      {!useStackedNav && (
        <Text style={[styles.navPillText, { color: navTextColor }]}>{themeMeta.label}</Text>
      )}
    </TouchableOpacity>
  );

  const userBlock = user && (
    <View style={styles.userChip}>
      <LinearGradient
        colors={LOGO_GRAD}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.userAvatar}
      >
        <Text style={styles.userAvatarText}>{userInitial}</Text>
      </LinearGradient>
      <Text
        style={[styles.userName, { color: navTextColor, textTransform: "capitalize" }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {user.name?.split(" ")?.[0] || user.email}
      </Text>
    </View>
  );

  const logoutControl = user && (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onLogout}
      style={[styles.logoutPill, webPointer]}
      accessibilityRole="button"
      accessibilityLabel="Log out"
    >
      <LinearGradient
        colors={LOGOUT_GRAD}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.logoutPillGradient}
      >
        <Ionicons name="log-out-outline" size={18} color="#ffffff" />
        <Text style={styles.logoutPillText}>Logout</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (useStackedNav) {
    return (
      <LinearGradient
        colors={darkMode ? NAV_GRAD_DARK : NAV_GRAD_LIGHT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.navBarBase, styles.navBarBorder, navSafe, styles.navBarStacked]}
      >
        <View style={styles.navBarTopRow}>
          {brand}
          {navLinks}
        </View>
        <View style={styles.navBarBottomRow}>
          {user ? (
            <View style={styles.userInfoStacked}>{userBlock}</View>
          ) : (
            <View style={{ flex: 1 }} />
          )}
          <View style={styles.navBarBottomRight}>
            {themeControls}
            {logoutControl}
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={darkMode ? NAV_GRAD_DARK : NAV_GRAD_LIGHT}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.navBarBase, styles.navBarBorder, navSafe]}
    >
      {brand}
      {navLinks}
      <View style={styles.rightContainer}>
        {userBlock}
        {themeControls}
        {logoutControl}
      </View>
    </LinearGradient>
  );
};
export const Routes = ({darkMode, setDarkMode, autoDarkMode, setAutoDarkMode}) => {
  const Stack = createNativeStackNavigator();
  const dispatch = useDispatch();
  const errorState = useSelector((state) => state.utils.error);
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);

  const handleRetry = () => {
    dispatch(clearError(false));
  };

  const handleLogout = async () => {
    await dispatch(logout());
  };

  const linking = {
    prefixes: [
      /* your linking prefixes */
    ],
    config: {
      screens: {
        HomeScreen: "HomeScreen",
        DedicatedIEControl: {
          path: "DedicatedIEControl",
          parse: {
            name: (name) => `${name}`,//for getting the name parameter from url
          },
        },
        DeviceControlScreen: "DeviceControlScreen",
        DeviceControl: "DeviceControl",
        AddDevice: "AddDevice",
      },
    },
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <View
        style={[
          BaseStyle.container,
          { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
        ]}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
        <Text style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
          Checking authentication...
        </Text>
      </View>
    );
  }

  // Show login screen if not authenticated (lazy so expo-web-browser loads after native is ready)
  if (!isAuthenticated) {
    return (
      <Suspense
        fallback={
          <View
            style={[
              BaseStyle.container,
              { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5" },
            ]}
          >
            <ActivityIndicator size="large" />
          </View>
        }
      >
        <LoginScreen darkMode={darkMode} />
      </Suspense>
    );
  }

  return (
    <>
      {errorState ? (
        <ErrorComponent errorMessage={<Text>Please Try Again</Text>} onRetry={handleRetry} />
      ) : (
        <NavigationContainer
          linking={linking}
          fallback={
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f0f0f0" }}>
              <ActivityIndicator size="large" />
              <Text style={{ marginTop: 10 }}>Loading navigation…</Text>
            </View>
          }
        >
          <View style={[BaseStyle.container, { flex: 1 }]}>
            <NavBar
              current=""
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              autoDarkMode={autoDarkMode}
              setAutoDarkMode={setAutoDarkMode}
              user={user}
              onLogout={handleLogout}
            />
            <View style={{ flex: 1, minHeight: 0 }}>
              <Stack.Navigator>
                <Stack.Screen name="HomeScreen" options={{ headerShown: false }}>
                  {props => <HomeScreen {...props} darkMode={darkMode} setDarkMode={setDarkMode} />}
                </Stack.Screen>

                <Stack.Screen name="DeviceControl" options={{ headerShown: false }}>
                  {props => <DeviceControl {...props} darkMode={darkMode} />}
                </Stack.Screen>

                <Stack.Screen name="DedicatedIEControl" options={{ headerShown: false }}>
                  {props => <DedicatedIEControl {...props} darkMode={darkMode} />}
                </Stack.Screen>

                <Stack.Screen name="AddDevice" options={{ headerShown: false }}>
                  {props => <AddDevice {...props} darkMode={darkMode} />}
                </Stack.Screen>
              </Stack.Navigator>
            </View>
          </View>
        </NavigationContainer>
      )}
    </>
  );
};
const styles = routesStyles;