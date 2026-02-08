import { StyleSheet } from 'react-native';

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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userInfo: {
    marginRight: 8,
    maxWidth: 150,
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

