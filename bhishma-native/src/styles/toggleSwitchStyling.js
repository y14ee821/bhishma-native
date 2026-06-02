import { StyleSheet } from 'react-native';

export const makeToggleSwitchStyles = (t) => StyleSheet.create({
  groupContainer: {
    margin: 8,
  },
  machineText: {
    fontSize: 20,
    color: t.textPrimary,
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
    backgroundColor: t.card,
    borderColor: t.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    shadowColor: t.shadow,
    shadowOpacity: t.isDark ? 0.5 : 0.1,
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
    backgroundColor: t.chipBg,
    borderWidth: 1,
    borderColor: t.chipBorder,
    // Keep the pill above the flow-rendered Text/Switch children so taps land
    // on the button, not on the channel label that overlaps it. zIndex covers
    // iOS, elevation covers Android.
    zIndex: 10,
    elevation: 4,
  },
  editButtonText: {
    color: t.chipText,
    fontSize: 12,
    fontWeight: "600",
  },
  channelText: {
    fontSize: 20,
    color: t.chipText,
    fontWeight: "bold",
    marginBottom: 8,
  },
  stateText: {
    fontSize: 16,
    textAlign: "center",
    color: t.textPrimary,
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
    color: t.textPrimary,
    fontWeight: "bold",
    marginHorizontal: 14,
  },
  errorText: {
    fontSize: 20,
    color: t.danger,
    fontWeight: "bold",
    margin: 8,
  },
});
