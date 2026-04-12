import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
  },
  googleButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
  },
  warningContainer: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    width: '100%',
  },
  warning: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 4,
  },
});

export const lightTheme = {
  container: { backgroundColor: '#ffffff' },
  content: { backgroundColor: '#ffffff' },
  title: { color: '#000000' },
  subtitle: { color: '#666666' },
  warning: { color: '#ff9800' },
};

export const darkTheme = {
  container: { backgroundColor: '#121212' },
  content: { backgroundColor: '#121212' },
  title: { color: '#ffffff' },
  subtitle: { color: '#b0b0b0' },
  warning: { color: '#ffb74d' },
};
