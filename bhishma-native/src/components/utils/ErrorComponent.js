import { View, Text, TouchableOpacity } from "react-native";
import { errorComponentStyles } from "../../styles";

const styles = errorComponentStyles;

export const ErrorComponent = ({ errorMessage, onRetry }) => {
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
