import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginWithGoogle } from '../store/authSlice';
import * as Google from 'expo-auth-session/providers/google';
import { styles, lightTheme, darkTheme } from './loginGoogleShared';
import { getTheme } from '../styles';

export default function LoginGooglePanel({ darkMode }) {
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
      let idToken = null;

      if (response.params?.id_token) {
        idToken = response.params.id_token;
      } else if (response.authentication?.idToken) {
        idToken = response.authentication.idToken;
      } else if (response.params?.code && Platform.OS !== 'web') {
        if (response.authentication?.idToken) {
          idToken = response.authentication.idToken;
        } else {
        }
      } else if (response.params && typeof response.params === 'string') {
        try {
          const parsed = JSON.parse(response.params);
          idToken = parsed.id_token || parsed.idToken;
        } catch {
        }
      }

      if (idToken) {
        handleGoogleLogin(idToken);
      } else {
        setLocalError('Failed to get ID token from Google. Response: ' + JSON.stringify(response));
      }
    } else if (response?.type === 'error') {
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
  const t = getTheme(darkMode);

  return (
    <View style={[styles.container, theme.container]}>
      <View style={[styles.content, theme.content]}>
        <Text style={[styles.title, theme.title]}>Welcome to Bhishma</Text>
        <Text style={[styles.subtitle, theme.subtitle]}>Sign in with your Google account to continue</Text>

        {(error || localError) && (
          <View style={[styles.errorContainer, { backgroundColor: t.dangerSurface, borderWidth: 1, borderColor: t.dangerBorder }]}>
            <Text style={[styles.errorText, { color: t.dangerText }]}>{error || localError}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.googleButton, isLoading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={isLoading || !request}
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.googleButtonText}>Sign in with Google</Text>}
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
}
