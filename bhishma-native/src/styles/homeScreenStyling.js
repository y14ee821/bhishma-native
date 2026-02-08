import { StyleSheet } from 'react-native';

export const colors = {
  light: {
    primary: '#6200EE',
    secondary: '#03DAC6',
    background: '#d33b3bff',
    surface: '#F5F5F5',
    card: '#FFFFFF',
    text: '#df3232ff',
    textSecondary: '#666666',
    accent: '#FF6B35',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    shadow: 'rgba(0,0,0,0.1)',
    overlay: 'rgba(0,0,0,0.5)',
  },
  dark: {
    primary: '#BB86FC',
    secondary: '#03DAC6',
    background: '#121212',
    surface: '#1E1E1E',
    card: '#2C2C2C',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    accent: '#FF6B35',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#CF6679',
    shadow: 'rgba(255,255,255,0.1)',
    overlay: 'rgba(255,255,255,0.1)',
  },
};

export const homeScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingTop: 20,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  connectionBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 16,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  connectionText: {
    fontSize: 15,
    fontWeight: '800',
  },
  connectionSubtext: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    fontWeight: '600',
  },
  summary: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  deviceListContainer: {
    marginTop: 8,
  },
  deviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 0,
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  deviceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  deviceNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIcon: {
    fontSize: 36,
    marginRight: 12,
  },
  chevron: {
    fontSize: 32,
    color: '#5a9fc4',
    fontWeight: '600',
  },
  deviceCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#a3d5e8',
  },
  deviceStat: {
    alignItems: 'center',
  },
  activeStatValue: {
    color: '#2d5f8d',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    minWidth: 200,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
