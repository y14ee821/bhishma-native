import { StyleSheet } from "react-native";

export const routesStyles = StyleSheet.create({
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
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  manualToggle: {
    padding: 4,
    marginLeft: 4,
  },
  switch: {
    // Switch component styling if needed
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 1,
    minWidth: 0,
  },
  userInfo: {
    marginRight: 8,
    maxWidth: 150,
    minWidth: 0,
    flexShrink: 1,
  },
  /** Native narrow width: two rows so Logout and actions stay on-screen */
  navBarStacked: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  navBarTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  navBarBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255, 255, 255, 0.22)",
  },
  userInfoStacked: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    justifyContent: "center",
  },
  navBarBottomRight: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    gap: 8,
  },
  appNameNative: {
    fontSize: 22,
    maxWidth: "100%",
  },
  logoutButtonCompact: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  logoutCompactInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logoutTextCompact: {
    fontSize: 13,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff4444',
  },
});

