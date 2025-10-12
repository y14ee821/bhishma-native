import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen, DeviceControl, DeviceControlScreen, DedicatedIEControl, IoTHomeScreen } from "../screens";
import { ErrorComponent } from "../components";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { clearError } from "../store/utilsSlice"
import { useNavigation } from "@react-navigation/native";
import { useWindowDimensions } from 'react-native';
import { BaseStyle, lightNavTheme, darkNavTheme } from '../styles';
import { Platform } from "react-native";
import {FlashIcon, HomeIcon, ControlIcon} from '../icons';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet
} from "react-native";
console.log("Platform.OS", Platform.OS)

const NavBar = ({ current, onNavigate, darkMode, setDarkMode }) => {
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
      <TouchableOpacity
        style={styles.themeToggle}
        onPress={() => setDarkMode(!darkMode)}
      >
        <Text style={{ fontSize: 20 }}>
          {darkMode ? '☀️' : '🌙'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
export const Routes = ({darkMode, setDarkMode}) => {
  const Stack = createNativeStackNavigator();
  const dispatch = useDispatch();
  const errorState = useSelector((state) => state.utils.error)
  //const [darkMode, setDarkMode] = useState(false);

  const handleRetry = () => {
    console.log("Retrying...");
    dispatch(clearError(false))

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
            />
            <Stack.Navigator>
              <Stack.Screen name="HomeScreen" options={{ headerShown: false }}>
                {props => <HomeScreen {...props} darkMode={darkMode} setDarkMode={setDarkMode} />}
              </Stack.Screen>

              <Stack.Screen name="DeviceControl" options={{ headerShown: false }}>
                {props => <DeviceControl {...props} darkMode={darkMode} setDarkMode={setDarkMode} />}
              </Stack.Screen>

              <Stack.Screen name="DeviceControlScreen" options={{ headerShown: false }}>
                {props => <DeviceControlScreen {...props} darkMode={darkMode} setDarkMode={setDarkMode} />}
              </Stack.Screen>

              <Stack.Screen name="DedicatedIEControl" options={{ headerShown: false }}>
                {props => <DedicatedIEControl {...props} darkMode={darkMode} setDarkMode={setDarkMode} />}
              </Stack.Screen>
            </Stack.Navigator>
          </View>
        </NavigationContainer>
      )}
    </>
  );
};
const styles = StyleSheet.create({
  light: {
    backgroundColor: '#265a8fff',
  },
  dark: {
    backgroundColor: '#181a20',
  },

  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    
    
    
  },
  appNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginLeft: 6,
  },
  navLinks: {
    flexDirection: 'row',
    gap: 18,
  },
  navLink: {
    fontSize: 17,
    fontWeight: '500',
    marginHorizontal: 8,
  },
  navLinkActive: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  header: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#222',
    letterSpacing: 1,
    textAlign: 'center',
  },


});