import { useMemo } from 'react';

/**
 * SINGLE SOURCE OF TRUTH for all dark/light theme colors.
 *
 * Every screen/component should pull colors from here via semantic tokens
 * (e.g. `t.card`, `t.textPrimary`) instead of hardcoding hex values in its
 * stylesheet. To tweak the look of either theme, edit ONLY this file.
 *
 * Usage in a component that receives a `darkMode` prop:
 *
 *   import { useThemedStyles } from '../styles/theme';
 *   import { makeMyStyles } from '../styles/myStyling';
 *
 *   const styles = useThemedStyles(makeMyStyles, darkMode);
 *
 * And the stylesheet becomes a factory:
 *
 *   export const makeMyStyles = (t) => StyleSheet.create({
 *     card: { backgroundColor: t.card, borderColor: t.cardBorder },
 *     label: { color: t.textPrimary },
 *   });
 */

const dark = {
  mode: 'dark',
  isDark: true,

  // Screen background gradient (outermost LinearGradient on every screen)
  gradient: ['#000000', '#0d0d0f', '#1a1a1d'],

  // Generic surfaces / cards
  surface: '#1a1d24',
  surfaceAlt: 'rgba(24, 24, 27, 0.85)',
  card: '#23262f',
  cardGradient: ['#23262f', '#1c1f27', '#15171d'],
  cardBorder: 'rgba(255, 255, 255, 0.12)',
  cardBorderStrong: 'rgba(255, 255, 255, 0.18)',

  // Form inputs
  inputBg: '#2a2d36',
  inputBorder: 'rgba(255, 255, 255, 0.14)',
  inputBorderFocused: '#7dd3fc',
  placeholder: '#8a8f98',

  // Text tiers
  textPrimary: '#ffffff',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  textOnGradient: '#ffffff',

  // Brand / accent
  primary: '#BB86FC',
  onPrimary: '#ffffff',
  accent: '#38bdf8',
  accentText: '#7dd3fc',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#CF6679',

  // Error component (full-screen error panel)
  dangerSurface: 'rgba(207, 102, 121, 0.12)',
  dangerBorder: 'rgba(207, 102, 121, 0.45)',
  dangerText: '#f7b4bd',
  dangerButtonBg: 'rgba(207, 102, 121, 0.22)',
  dangerButtonText: '#ffd9df',

  // Modal / blocking overlay (e.g. "Operation in progress")
  scrim: 'rgba(0, 0, 0, 0.6)',
  overlayCard: 'rgba(30, 33, 42, 0.97)',
  overlayCardBorder: 'rgba(255, 255, 255, 0.14)',
  overlayTitle: '#ffffff',
  overlaySubtext: 'rgba(255, 255, 255, 0.7)',

  // Chips / pills (channel counts, status)
  chipBg: 'rgba(56, 189, 248, 0.14)',
  chipBorder: 'rgba(56, 189, 248, 0.4)',
  chipText: '#7dd3fc',

  // Avatar circle (device initial)
  avatarBg: 'rgba(56, 189, 248, 0.16)',
  avatarBorder: 'rgba(56, 189, 248, 0.45)',
  avatarText: '#e0f2fe',

  // Switch / toggle state colors (shared across themes)
  switchOn: '#22c55e',
  switchOff: '#dc2626',
  switchWorking: '#2563eb',
  switchCardBg: '#1c1c20',
  switchWorkingBg: 'rgba(37, 99, 235, 0.22)',

  // Neutral surface used behind loaders/auth fallback screens
  loaderBg: '#121212',

  shadow: '#000000',

  // HomeScreen decorative inner-card gradients (dark cards on the dark panels)
  home: {
    overviewCardGradient: ['#1b1f29', '#171a22', '#13151c', '#101218'],
    statsStripGradient: ['#15211d', '#14161c', '#1a1530'],
    actionPrimaryGradient: ['#13241f', '#0f1a18', '#0c1512'],
    actionSecondaryGradient: ['#121a2b', '#0f1626', '#0c1220'],
    deviceCardGradient: ['#1b1f29', '#171a22', '#14161c'],
    emptyWellGradient: ['#1a1d24', '#15171d', '#101216'],
    channelPillGradient: ['#1e2540', '#1a1f38', '#181d33'],
    // Connection badge (top-right of hero)
    badgeBg: 'rgba(24, 24, 27, 0.85)',
    badgeBorder: 'rgba(255, 255, 255, 0.14)',
    iconBubbleBg: 'rgba(255, 255, 255, 0.06)',
    // Device avatar circle
    avatarBg: 'rgba(56, 189, 248, 0.16)',
    avatarText: '#7dd3fc',
  },
};

const light = {
  mode: 'light',
  isDark: false,

  gradient: ['#a3d5e8', '#5a9fc4', '#2d5f8d', '#1e3a5f'],

  surface: '#f1f5f9',
  surfaceAlt: 'rgba(255, 255, 255, 0.95)',
  card: '#ffffff',
  cardGradient: ['#ffffff', '#f8fafc', '#edf2f7'],
  cardBorder: '#e5e7eb',
  cardBorderStrong: 'rgba(148, 163, 184, 0.4)',

  inputBg: '#F5F5F5',
  inputBorder: '#E0E0E0',
  inputBorderFocused: '#6200EE',
  placeholder: '#999999',

  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',
  textOnGradient: '#ffffff',

  primary: '#6200EE',
  onPrimary: '#ffffff',
  accent: '#2563eb',
  accentText: '#1d4ed8',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#F44336',

  dangerSurface: '#ffebee',
  dangerBorder: '#f5c6cb',
  dangerText: '#c62828',
  dangerButtonBg: '#f5c6cb',
  dangerButtonText: '#721c24',

  scrim: 'rgba(0, 0, 0, 0.45)',
  overlayCard: 'rgba(255, 255, 255, 0.97)',
  overlayCardBorder: 'rgba(148, 163, 184, 0.4)',
  overlayTitle: '#1f2937',
  overlaySubtext: '#6b7280',

  chipBg: 'rgba(37, 99, 235, 0.10)',
  chipBorder: 'rgba(37, 99, 235, 0.28)',
  chipText: '#2563eb',

  avatarBg: 'rgba(191, 219, 254, 0.95)',
  avatarBorder: 'rgba(37, 99, 235, 0.35)',
  avatarText: '#1e3a8a',

  switchOn: '#22c55e',
  switchOff: '#dc2626',
  switchWorking: '#2563eb',
  switchCardBg: '#ffffff',
  switchWorkingBg: '#dbeafe',

  loaderBg: '#f5f5f5',

  shadow: '#000000',

  home: {
    overviewCardGradient: ['#ffffff', '#f0f9ff', '#dbeafe', '#e2e8f0'],
    statsStripGradient: ['#ecfdf5', '#f8fafc', '#faf5ff'],
    actionPrimaryGradient: ['#ffffff', '#f0fdf9', '#d1fae5'],
    actionSecondaryGradient: ['#ffffff', '#f0f7ff', '#e0e7ff'],
    deviceCardGradient: ['#ffffff', '#f8fafc', '#edf2f7'],
    emptyWellGradient: ['#ffffff', '#f4f7fb', '#e8edf4'],
    channelPillGradient: ['#eef2ff', '#e0e7ff', '#ede9fe'],
    badgeBg: 'rgba(241, 245, 249, 0.92)',
    badgeBorder: 'rgba(148, 163, 184, 0.32)',
    iconBubbleBg: '#f1f5f9',
    avatarBg: 'rgba(191, 219, 254, 0.92)',
    avatarText: '#1e3a8a',
  },
};

export const themes = { light, dark };

/** Returns the token object for the active theme. */
export const getTheme = (darkMode) => (darkMode ? dark : light);

/**
 * Builds a StyleSheet from a `(theme) => StyleSheet.create({...})` factory and
 * memoizes the result per theme so styles aren't rebuilt on every render.
 */
export const useThemedStyles = (factory, darkMode) => {
  const theme = getTheme(darkMode);
  return useMemo(() => factory(theme), [factory, theme]);
};
