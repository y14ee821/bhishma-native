
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen,DeviceControl,DeviceControlScreen} from "../screens";
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
      /* configuration for matching screens with paths */
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
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </>
  );
};
