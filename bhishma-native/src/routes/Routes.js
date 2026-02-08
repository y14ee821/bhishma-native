import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen, DeviceControl, DedicatedIEControl, IoTHomeScreen, LoginScreen } from "../screens";
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
} from "react-native";
console.log("Platform.OS", Platform.OS)

const NavBar = ({ current, onNavigate, darkMode, setDarkMode, autoDarkMode, setAutoDarkMode, user, onLogout }) => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const showIcons = width < 900;
  const theme = darkMode ? darkNavTheme : lightNavTheme;

  return (
    <View style={[ theme.navBar]}>
      <View style={styles.appNameContainer}>
        {/* <FlashIcon color={theme.appName.color} size={26}  /> */}
        <Text style={[theme.appName]}>Remcon</Text>
      </View>
      <View style={styles.navLinks}>
        <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')}>
          {showIcons ? (
            <HomeIcon color={theme.navLink.color} size={24} />
          ) : (
            <Text style={[
              styles.navLink,
              current === 'Home' && styles.navLinkActive,
              theme.navLink
            ]}>Home</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('DeviceControl')}>
          {showIcons ? (
            <ControlIcon color={current === 'Control' ? '#007AFF' : theme.navLink.color} size={24} />
          ) : (
            <Text style={[
              styles.navLink,
              current === 'Control' && styles.navLinkActive,
              theme.navLink
            ]}>Control</Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.rightContainer}>
        {user && (
          <View style={styles.userInfo}>
            <Text style={[styles.userName, theme.navLink]} numberOfLines={1}>
              {user.name || user.email}
            </Text>
          </View>
        )}
        <View style={styles.themeToggleContainer}>
          <Text style={[styles.toggleLabel, theme.navLink]}>
            {autoDarkMode ? 'Auto' : 'Manual'}
          </Text>
          <Switch
            value={autoDarkMode}
            onValueChange={(value) => {
              setAutoDarkMode(value);
              if (!value) {
                // When switching to manual, toggle dark mode
                setDarkMode(!darkMode);
              }
            }}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={autoDarkMode ? '#007AFF' : '#f4f3f4'}
            style={styles.switch}
          />
          {!autoDarkMode && (
            <TouchableOpacity
              style={styles.manualToggle}
              onPress={() => setDarkMode(!darkMode)}
            >
              <Text style={{ fontSize: 20 }}>
                {darkMode ? '☀️' : '🌙'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {user && (
          <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
            <Text style={[styles.logoutText, theme.navLink]}>Logout</Text>
          </TouchableOpacity>
        )}
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
      },
    },
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <View style={[BaseStyle.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
        <Text style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
          Checking authentication...
        </Text>
      </View>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen darkMode={darkMode} />;
  }

  return (
    <>
      {errorState ? (
        <ErrorComponent errorMessage={<Text>Please Try Again</Text>} onRetry={handleRetry} />
      ) : (
        <NavigationContainer linking={linking}
          fallback={<View><Text>Loading...</Text></View>}>
          <View style={[BaseStyle.container]}>
            <NavBar
              current=""
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              autoDarkMode={autoDarkMode}
              setAutoDarkMode={setAutoDarkMode}
              user={user}
              onLogout={handleLogout}
            />
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
            </Stack.Navigator>
          </View>
        </NavigationContainer>
      )}
    </>
  );
};
const styles = routesStyles;