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

const LoginScreen = lazy(() => import("../screens/LoginScreen"));

console.log("Platform.OS", Platform.OS);

const NAV_STACK_BREAKPOINT = 560;

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

  const useStackedNav = Platform.OS !== "web" && width < NAV_STACK_BREAKPOINT;

  const navLinks = (
    <View style={styles.navLinks}>
      <TouchableOpacity onPress={() => navigation.navigate("HomeScreen")}>
        {showIcons ? (
          <HomeIcon color={theme.navLink.color} size={24} />
        ) : (
          <Text
            style={[styles.navLink, current === "Home" && styles.navLinkActive, theme.navLink]}
          >
            Home
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("DeviceControl")}>
        {showIcons ? (
          <ControlIcon
            color={current === "Control" ? "#007AFF" : theme.navLink.color}
            size={24}
          />
        ) : (
          <Text
            style={[styles.navLink, current === "Control" && styles.navLinkActive, theme.navLink]}
          >
            Control
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const themeControls = (
    <View style={styles.themeToggleContainer}>
      {!useStackedNav && (
        <Text style={[styles.toggleLabel, theme.navLink]}>
          {autoDarkMode ? "Auto" : "Manual"}
        </Text>
      )}
      <Switch
        value={autoDarkMode}
        onValueChange={(value) => {
          setAutoDarkMode(value);
          if (!value) {
            setDarkMode(!darkMode);
          }
        }}
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={autoDarkMode ? "#007AFF" : "#f4f3f4"}
        style={styles.switch}
      />
      {!autoDarkMode && (
        <TouchableOpacity style={styles.manualToggle} onPress={() => setDarkMode(!darkMode)}>
          <Text style={{ fontSize: 20 }}>{darkMode ? "☀️" : "🌙"}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const logoutControl = user && (
    <TouchableOpacity
      onPress={onLogout}
      style={[styles.logoutButton, useStackedNav && styles.logoutButtonCompact]}
      accessibilityRole="button"
      accessibilityLabel="Log out"
    >
      {useStackedNav ? (
        <View style={styles.logoutCompactInner}>
          <Ionicons name="log-out-outline" size={20} color="#ff6b6b" />
          <Text style={[styles.logoutText, styles.logoutTextCompact]}>Logout</Text>
        </View>
      ) : (
        <Text style={[styles.logoutText, theme.navLink]}>Logout</Text>
      )}
    </TouchableOpacity>
  );

  if (useStackedNav) {
    return (
      <View style={[theme.navBar, navSafe, styles.navBarStacked]}>
        <View style={styles.navBarTopRow}>
          <View style={styles.appNameContainer}>
            <Text style={[theme.appName, styles.appNameNative]}>Remcon</Text>
          </View>
          {navLinks}
        </View>
        <View style={styles.navBarBottomRow}>
          {user ? (
            <View style={styles.userInfoStacked}>
              <Text
                style={[styles.userName, theme.navLink]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {user.name || user.email}
              </Text>
            </View>
          ) : (
            <View style={{ flex: 1 }} />
          )}
          <View style={styles.navBarBottomRight}>
            {themeControls}
            {logoutControl}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[theme.navBar, navSafe]}>
      <View style={styles.appNameContainer}>
        <Text style={[theme.appName]}>Remcon</Text>
      </View>
      {navLinks}
      <View style={styles.rightContainer}>
        {user && (
          <View style={styles.userInfo}>
            <Text style={[styles.userName, theme.navLink]} numberOfLines={1} ellipsizeMode="tail">
              {user.name || user.email}
            </Text>
          </View>
        )}
        {themeControls}
        {logoutControl}
      </View>
    </View>
  );
};
export const Routes = ({darkMode, setDarkMode, autoDarkMode, setAutoDarkMode}) => {
  const Stack = createNativeStackNavigator();
  const dispatch = useDispatch();
  const errorState = useSelector((state) => state.utils.error);
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);

  const handleRetry = () => {
    console.log("Retrying...");
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