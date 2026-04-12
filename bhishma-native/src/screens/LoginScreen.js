import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginWithGoogle } from '../store/authSlice';
import * as Google from 'expo-auth-session/providers/google';

export const LoginScreen = ({ darkMode }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [localError, setLocalError] = useState(null);

  React.useEffect(() => {
    try {
      const { maybeCompleteAuthSession } = require('expo-web-browser');
      maybeCompleteAuthSession();
    } catch {
      /* optional */
    }
  }, []);

  const expoClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  const webClientIdEnv = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

  const webClientId = webClientIdEnv || expoClientId;
  const iosClientIdFinal = iosClientId || expoClientId;

  const responseType = Platform.OS === 'web' ? 'id_token' : 'code';

  const googleConfig = {
    scopes: ['openid', 'profile', 'email'],
    responseType: responseType,
  };

  if (expoClientId) googleConfig.expoClientId = expoClientId;
  if (Platform.OS === 'android') {
    googleConfig.androidClientId = androidClientId || expoClientId;
  } else if (androidClientId) {
    googleConfig.androidClientId = androidClientId;
  }

  if (Platform.OS === 'ios') {
    if (webClientId) {
      googleConfig.webClientId = webClientId;
    }
    if (iosClientIdFinal) {
      googleConfig.iosClientId = iosClientIdFinal;
    }
  } else if (iosClientIdFinal) {
    googleConfig.iosClientId = iosClientIdFinal;
  }

  if (Platform.OS === 'web') {
    googleConfig.webClientId = webClientIdEnv || expoClientId || '';
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      googleConfig.redirectUri = `${origin}`;
    }
  } else if (webClientId && Platform.OS !== 'ios') {
    googleConfig.webClientId = webClientId;
  }

  const [request, response, promptAsync] = Google.useAuthRequest(googleConfig);

  React.useEffect(() => {
    if (response?.type === 'success') {
      console.log('✅ Google OAuth response:', response);

      let idToken = null;

      if (response.params?.id_token) {
        idToken = response.params.id_token;
      } else if (response.authentication?.idToken) {
        idToken = response.authentication.idToken;
      } else if (response.params?.code && Platform.OS !== 'web') {
        if (response.authentication?.idToken) {
          idToken = response.authentication.idToken;
        } else {
          console.warn(
            '⚠️ Received authorization code but idToken not found. expo-auth-session should handle exchange automatically.'
          );
        }
      } else if (response.params && typeof response.params === 'string') {
        try {
          const parsed = JSON.parse(response.params);
          idToken = parsed.id_token || parsed.idToken;
        } catch (e) {
          console.log('Could not parse params as JSON');
        }
      }

      if (idToken) {
        console.log('✅ Found ID token, proceeding with login');
        handleGoogleLogin(idToken);
      } else {
        console.error('❌ No ID token found in response:', response);
        setLocalError('Failed to get ID token from Google. Response: ' + JSON.stringify(response));
      }
    } else if (response?.type === 'error') {
      console.error('❌ Google OAuth error:', response);
      setLocalError('Google Sign-In was cancelled or failed: ' + (response.error?.message || 'Unknown error'));
    }
  }, [response]);

  const handleGoogleLogin = async (idToken) => {
    try {
      setLocalError(null);
      const result = await dispatch(loginWithGoogle(idToken));
      if (loginWithGoogle.rejected.match(result)) {
        setLocalError(result.payload || 'Login failed');
      }
    } catch (err) {
      setLocalError(err.message || 'An error occurred');
    }
  };

  const handleSignIn = async () => {
    try {
      setLocalError(null);
      await promptAsync();
    } catch (err) {
      setLocalError(err.message || 'Failed to start Google Sign-In');
    }
  };

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <View style={[styles.container, theme.container]}>
      <View style={[styles.content, theme.content]}>
        <Text style={[styles.title, theme.title]}>Welcome to Bhishma</Text>
        <Text style={[styles.subtitle, theme.subtitle]}>Sign in with your Google account to continue</Text>

        {(error || localError) && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error || localError}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.googleButton, isLoading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={isLoading || !request}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          )}
        </TouchableOpacity>

        {(!request ||
          (Platform.OS === 'web' && !webClientIdEnv && !expoClientId) ||
          (Platform.OS === 'ios' && !iosClientId && !expoClientId) ||
          (Platform.OS === 'android' && !androidClientId && !expoClientId)) && (
          <View style={styles.warningContainer}>
            <Text style={[styles.warning, theme.warning]}>Google Sign-In is not configured.</Text>
            <Text style={[styles.warning, theme.warning]}>Please set EXPO_PUBLIC_GOOGLE_CLIENT_ID in your .env file.</Text>
            {Platform.OS === 'web' && (
              <Text style={[styles.warning, theme.warning]}>
                For web platform, also set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (or use the same value as
                EXPO_PUBLIC_GOOGLE_CLIENT_ID).
              </Text>
            )}
            {Platform.OS === 'ios' && (
              <Text style={[styles.warning, theme.warning]}>
                For iOS platform, also set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID (or use the same value as
                EXPO_PUBLIC_GOOGLE_CLIENT_ID).
              </Text>
            )}
            {Platform.OS === 'android' && (
              <Text style={[styles.warning, theme.warning]}>
                For Android, set EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID (Android OAuth client) with package
                com.bhishma.bhishmanative and your SHA-1.
              </Text>
            )}
            <Text style={[styles.warning, { marginTop: 8, fontSize: 11 }]}>
              After setting environment variables, restart your Expo server.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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

const lightTheme = {
  container: {
    backgroundColor: '#ffffff',
  },
  content: {
    backgroundColor: '#ffffff',
  },
  title: {
    color: '#000000',
  },
  subtitle: {
    color: '#666666',
  },
  warning: {
    color: '#ff9800',
  },
};

const darkTheme = {
  container: {
    backgroundColor: '#121212',
  },
  content: {
    backgroundColor: '#121212',
  },
  title: {
    color: '#ffffff',
  },
  subtitle: {
    color: '#b0b0b0',
  },
  warning: {
    color: '#ffb74d',
  },
};
