import { View, Text, TouchableOpacity } from "react-native";
import { useThemedStyles, makeErrorComponentStyles } from "../../styles";

export const ErrorComponent = ({ errorMessage, onRetry, darkMode = true }) => {
  const styles = useThemedStyles(makeErrorComponentStyles, darkMode);
  return (
    <View style={styles.container}>
      <Text style={styles.errorText}>Something went wrong!</Text>
      <Text style={styles.errorMessage}>{errorMessage}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
};
