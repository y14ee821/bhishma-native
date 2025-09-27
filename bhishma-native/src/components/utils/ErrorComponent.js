
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8d7da",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#721c24",
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: "#721c24",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#f5c6cb",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#721c24",
    fontSize: 16,
    fontWeight: "bold",
  },
});
