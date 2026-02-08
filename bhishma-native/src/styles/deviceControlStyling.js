import { StyleSheet } from 'react-native';

export const deviceControlStyles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    width: 240,
    padding: 16,
    margin: 8,
    backgroundColor: "#fff",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  channelText: {
    fontSize: 20,
    color: "#111827",
    fontWeight: "bold",
    marginBottom: 8,
  },
  stateText: {
    fontSize: 16,
    textAlign: "center",
    color: "#111827",
    fontWeight: "bold",
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
  },
  switchLabel: {
    fontSize: 14,
    color: "#111827",
    marginHorizontal: 8,
  },
  errorText: {
    fontSize: 20,
    color: "#dc2626",
    fontWeight: "bold",
    margin: 8,
  },
  groupContainer: {
    margin: 8,
  },
  machineText: {
    fontSize: 20,
    color: "#111827",
    fontWeight: "bold",
    marginBottom: 8,
  },
  flexWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  buttonWrapper: {
    marginVertical: 8,
    marginHorizontal: 4,
    flexDirection: 'row',
    flexWrap: "wrap",
    justifyContent: 'center',
  },
  deviceButton: {
    backgroundColor: '#2d5f8d',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    width: 150,
    height: 150,
    margin: 10,
  },
  deviceButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 50,
  },
  heading: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  }
});

