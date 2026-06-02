import { StyleSheet } from 'react-native';

export const makeErrorComponentStyles = (t) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: t.dangerSurface,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: t.dangerText,
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: t.dangerText,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: t.dangerButtonBg,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: t.dangerButtonText,
    fontSize: 16,
    fontWeight: "bold",
  },
});
