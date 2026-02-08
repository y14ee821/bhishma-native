import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginWithGoogle } from '../store/authSlice';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

// Complete auth session for Google
WebBrowser.maybeCompleteAuthSession();

export const LoginScreen = ({ darkMode }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [localError, setLocalError] = useState(null);

  // Google OAuth configuration
  // You need to set these in your app.json or environment variables
  const expoClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  const webClientIdEnv = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

  // For web, webClientId is REQUIRED - must be a non-empty string
  // Use webClientIdEnv if provided, otherwise fall back to expoClientId
  const webClientId = webClientIdEnv || expoClientId;

  // Build config object
  const googleConfig = {
    // Request scopes to get id_token
    scopes: ['openid', 'profile', 'email'],
    // Request id_token in response
    responseType: 'id_token',
  };
  
  if (expoClientId) googleConfig.expoClientId = expoClientId;
  if (iosClientId) googleConfig.iosClientId = iosClientId;
  if (androidClientId) googleConfig.androidClientId = androidClientId;
  
  // webClientId is REQUIRED for web platform - MUST be set and non-empty
  // The library will throw an error if webClientId is undefined, empty, or invalid
  if (Platform.OS === 'web') {
    // On web, webClientId property MUST exist and be a valid Google Client ID string
    // Always set it - use expoClientId as fallback if webClientIdEnv not provided
    // If neither is set, this will cause an error (user needs to configure env vars)
    googleConfig.webClientId = webClientIdEnv || expoClientId || '';
    
    // For web, we can specify a custom redirect URI
    // This should match what's in Google Cloud Console
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      googleConfig.redirectUri = `${origin}`;
    }
  } else if (webClientId) {
    // Include webClientId for other platforms if available
    googleConfig.webClientId = webClientId;
  }

  const [request, response, promptAsync] = Google.useAuthRequest(googleConfig);

  React.useEffect(() => {
    if (response?.type === 'success') {
      console.log('✅ Google OAuth response:', response);
      
      // Try multiple ways to get the id_token
      let idToken = null;
      
      // Method 1: Check response.params.id_token
      if (response.params?.id_token) {
        idToken = response.params.id_token;
      }
      // Method 2: Check response.authentication.idToken
      else if (response.authentication?.idToken) {
        idToken = response.authentication.idToken;
      }
      // Method 3: Check response.params directly
      else if (response.params && typeof response.params === 'string') {
        // Sometimes params is a string that needs parsing
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
    } catch (error) {
      setLocalError(error.message || 'An error occurred');
    }
  };

  const handleSignIn = async () => {
    try {
      setLocalError(null);
      await promptAsync();
    } catch (error) {
      setLocalError(error.message || 'Failed to start Google Sign-In');
    }
  };

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <View style={[styles.container, theme.container]}>
      <View style={[styles.content, theme.content]}>
        <Text style={[styles.title, theme.title]}>Welcome to Bhishma</Text>
        <Text style={[styles.subtitle, theme.subtitle]}>
          Sign in with your Google account to continue
        </Text>

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

        {(!request || !expoClientId || (Platform.OS === 'web' && !webClientIdEnv && !expoClientId)) && (
          <View style={styles.warningContainer}>
            <Text style={[styles.warning, theme.warning]}>
              Google Sign-In is not configured.
            </Text>
            <Text style={[styles.warning, theme.warning]}>
              Please set EXPO_PUBLIC_GOOGLE_CLIENT_ID in your .env file.
            </Text>
            {Platform.OS === 'web' && (
              <Text style={[styles.warning, theme.warning]}>
                For web platform, also set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (or use the same value as EXPO_PUBLIC_GOOGLE_CLIENT_ID).
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

