
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen,DeviceControl,DeviceControlScreen,DedicatedIEControl} from "../screens";
import { ErrorComponent } from "../components";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import {clearError} from "../store/utilsSlice"
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
export const Routes = () => {
  const Stack = createNativeStackNavigator();
  const dispatch = useDispatch();
  //const [hasError, setHasError] = useState(false);
  const errorState = useSelector((state)=>state.utils.error)
  console.log("errorState",errorState)

  const handleRetry = () => {
    // Retry logic here
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
    <>\
      {errorState ? (
        <ErrorComponent errorMessage={<Text>Please Try Again</Text>} onRetry={handleRetry} />
      ) : (
        <NavigationContainer linking={linking}
        fallback={<View><Text>Loading...</Text></View>}>
          <Stack.Navigator>
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen name="DeviceControl" component={DeviceControl} />
            <Stack.Screen name="DeviceControlScreen" component={DeviceControlScreen} />
            <Stack.Screen name="DedicatedIEControl" component={DedicatedIEControl} />
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </>
  );
};
