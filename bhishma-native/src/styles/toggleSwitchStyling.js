import { StyleSheet } from 'react-native';

export const toggleSwitchStyles = StyleSheet.create({
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
    position: "relative",
  },
  editButton: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    // Keep the pill above the flow-rendered Text/Switch children so taps land
    // on the button, not on the channel label that overlaps it. zIndex covers
    // iOS, elevation covers Android.
    zIndex: 10,
    elevation: 4,
  },
  editButtonText: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: "600",
  },
  channelText: {
    fontSize: 20,
    color: "steelblue",
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
    fontSize: 18,
    color: "#111827",
    fontWeight: "bold",
    marginHorizontal: 14,
  },
  errorText: {
    fontSize: 20,
    color: "#dc2626",
    fontWeight: "bold",
    margin: 8,
  },
});

