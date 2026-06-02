import { StyleSheet } from 'react-native';

export const makeAddDeviceStyles = (t) => StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: t.textOnGradient,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: t.textOnGradient,
    opacity: 0.9,
  },
  formContainer: {
    backgroundColor: t.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: t.cardBorder,
    shadowColor: t.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: t.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: t.inputBg,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: t.textPrimary,
    borderWidth: 1,
    borderColor: t.inputBorder,
  },
  inputFocused: {
    borderColor: t.inputBorderFocused,
    backgroundColor: t.inputBg,
  },
  button: {
    backgroundColor: t.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: t.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: t.onPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: t.primary,
  },
  cancelButtonText: {
    color: t.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: t.textMuted,
    marginTop: 6,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 12,
    color: t.danger,
    marginTop: 6,
  },
});
