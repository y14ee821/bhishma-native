import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { loginWithGoogle } from '../store/authSlice';
import { styles, lightTheme, darkTheme } from './loginGoogleShared';
import { getTheme } from '../styles';

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function convertBufferToString(buffer) {
  const state = [];
  for (let i = 0; i < buffer.byteLength; i += 1) {
    const index = buffer[i] % CHARSET.length;
    state.push(CHARSET[index]);
  }
  return state.join('');
}

function convertToUrlSafeString(b64) {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function buildPkcePair(byteLength = 64) {
  const raw = Crypto.getRandomValues(new Uint8Array(byteLength));
  const codeVerifier = convertBufferToString(raw);
  const codeChallenge = convertToUrlSafeString(
    await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, codeVerifier, {
      encoding: Crypto.CryptoEncoding.BASE64,
    })
  );
  return { codeVerifier, codeChallenge };
}

function randomState() {
  const raw = Crypto.getRandomValues(new Uint8Array(16));
  return Array.from(raw, (b) => b.toString(16).padStart(2, '0')).join('');
}

function getRedirectUri() {
  const fromEnv = process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI?.trim();
  if (fromEnv) return fromEnv;

  const pkg =
    Constants.expoConfig?.android?.package ||
    Constants.manifest?.android?.package ||
    'com.bhishma.bhishmanative';
  return `${pkg}:/oauthredirect`;
}

function parseOAuthReturn(url) {
  if (!url || typeof url !== 'string') return null;
  const base = url.split('#')[0];
  if (!base.includes('oauthredirect')) return null;
  const qIdx = base.indexOf('?');
  if (qIdx === -1) return { code: null, error: null, state: null };
  const params = new URLSearchParams(base.slice(qIdx + 1));
  return {
    code: params.get('code'),
    error: params.get('error'),
    error_description: params.get('error_description'),
    state: params.get('state'),
  };
}

const GOOGLE_AUTH = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN = 'https://oauth2.googleapis.com/token';

export default function LoginGooglePanel({ darkMode }) {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [localError, setLocalError] = useState(null);
  const [busy, setBusy] = useState(false);

  const codeVerifierRef = useRef(null);
  const stateRef = useRef(null);

  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  /**
   * Custom-scheme redirect (com.package:/oauthredirect) is only valid with an Android-type OAuth client.
   * Google rejects the same redirect with a Web client id ("Custom scheme URIs are not allowed for WEB client type").
   */
  const oauthClientId = androidClientId?.trim() || null;
  const redirectUri = getRedirectUri();

  const exchangeCode = useCallback(
    async (code, codeVerifier) => {
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: oauthClientId,
        code_verifier: codeVerifier,
      });
      const { data } = await axios.post(GOOGLE_TOKEN, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return data?.id_token || null;
    },
    [oauthClientId, redirectUri]
  );

  const finishWithCode = useCallback(
    async (code) => {
      const verifier = codeVerifierRef.current;
      if (!verifier) {
        setLocalError('Sign-in session expired. Please try again.');
        return;
      }
      setBusy(true);
      setLocalError(null);
      try {
        const idToken = await exchangeCode(code, verifier);
        codeVerifierRef.current = null;
        stateRef.current = null;
        if (!idToken) {
          setLocalError('Google did not return an ID token.');
          return;
        }
        const result = await dispatch(loginWithGoogle(idToken));
        if (loginWithGoogle.rejected.match(result)) {
          setLocalError(result.payload || 'Login failed');
        }
      } catch (e) {
        const msg = e?.response?.data?.error_description || e?.message || 'Token exchange failed';
        setLocalError(String(msg));
      } finally {
        setBusy(false);
      }
    },
    [dispatch, exchangeCode]
  );

  const onUrl = useCallback(
    (url) => {
      const parsed = parseOAuthReturn(url);
      if (!parsed) return;
      if (parsed.error) {
        codeVerifierRef.current = null;
        stateRef.current = null;
        setLocalError(parsed.error_description || parsed.error || 'Google Sign-In failed');
        return;
      }
      if (!parsed.code) return;
      if (stateRef.current && parsed.state !== stateRef.current) {
        setLocalError('Invalid OAuth state. Please try again.');
        return;
      }
      finishWithCode(parsed.code);
    },
    [finishWithCode]
  );

  useEffect(() => {
    let sub;
    (async () => {
      try {
        const initial = await Linking.getInitialURL();
        if (initial) onUrl(initial);
      } catch {
        /* ignore */
      }
      sub = Linking.addEventListener('url', ({ url }) => onUrl(url));
    })();
    return () => sub?.remove?.();
  }, [onUrl]);

  const handleSignIn = async () => {
    if (!oauthClientId) {
      setLocalError(
        'Set EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID to your Google Cloud "Android" OAuth client id (not the Web client).'
      );
      return;
    }
    setLocalError(null);
    setBusy(true);
    try {
      const { codeVerifier, codeChallenge } = await buildPkcePair(64);
      const state = randomState();
      codeVerifierRef.current = codeVerifier;
      stateRef.current = state;

      const params = new URLSearchParams({
        client_id: oauthClientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid profile email',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state,
      });

      const authUrl = `${GOOGLE_AUTH}?${params.toString()}`;
      await Linking.openURL(authUrl);
    } catch (e) {
      setLocalError(e?.message || 'Could not open Google sign-in');
    } finally {
      setBusy(false);
    }
  };

  const theme = darkMode ? darkTheme : lightTheme;
  const t = getTheme(darkMode);
  const misconfigured = Platform.OS === 'android' && !oauthClientId;

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
          style={[styles.googleButton, (isLoading || busy) && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={isLoading || busy || misconfigured}
        >
          {isLoading || busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          )}
        </TouchableOpacity>

        {!misconfigured && (
          <View style={{ marginTop: 16, paddingHorizontal: 4, width: '100%' }}>
            <Text style={{ fontSize: 11, color: darkMode ? '#888' : '#666', textAlign: 'center' }}>
              Android OAuth client must have package{' '}
              <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>com.bhishma.bhishmanative</Text>,
              correct SHA-1, and under Advanced settings enable the custom URI scheme redirect (Google blocks it by
              default). Redirect in use:{' '}
              <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: darkMode ? '#aaa' : '#333' }}>
                {redirectUri}
              </Text>
            </Text>
          </View>
        )}

        {misconfigured && (
          <View style={styles.warningContainer}>
            <Text style={[styles.warning, theme.warning]}>Google Sign-In is not configured.</Text>
            <Text style={[styles.warning, theme.warning]}>
              Set EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID to your Google Cloud Android OAuth client id. Web client ids
              cannot be used with this app redirect scheme.
            </Text>
            <Text style={[styles.warning, { marginTop: 8, fontSize: 11 }]}>
              After changing .env, restart Expo and rebuild the native app if needed.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
