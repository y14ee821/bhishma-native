import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';

// Create the context
const SnackbarContext = createContext(null);

/**
 * SnackbarProvider - Provides global snackbar functionality
 * Wrap your app with this provider to enable snackbar notifications
 */
export const SnackbarProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info'); // 'success', 'error', 'warning', 'info'
  const [duration, setDuration] = useState(3000);
  const [action, setAction] = useState(null); // { label: 'Undo', onPress: () => {} }
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  const showSnackbar = useCallback((text, snackbarType = 'info', snackbarDuration = 3000, snackbarAction = null) => {
    setMessage(text);
    setType(snackbarType);
    setDuration(snackbarDuration);
    setAction(snackbarAction);
    setVisible(true);

    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide after duration
    if (snackbarDuration > 0) {
      setTimeout(() => {
        hideSnackbar();
      }, snackbarDuration);
    }
  }, [fadeAnim, slideAnim]);

  const hideSnackbar = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setMessage('');
      setAction(null);
    });
  }, [fadeAnim, slideAnim]);

  // Convenience methods
  const showSuccess = useCallback((text, duration = 3000) => {
    showSnackbar(text, 'success', duration);
  }, [showSnackbar]);

  const showError = useCallback((text, duration = 4000) => {
    showSnackbar(text, 'error', duration);
  }, [showSnackbar]);

  const showWarning = useCallback((text, duration = 3000) => {
    showSnackbar(text, 'warning', duration);
  }, [showSnackbar]);

  const showInfo = useCallback((text, duration = 3000) => {
    showSnackbar(text, 'info', duration);
  }, [showSnackbar]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      case 'info':
      default:
        return '#2196F3';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <SnackbarContext.Provider
      value={{
        showSnackbar,
        hideSnackbar,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        visible,
        message,
        type,
      }}
    >
      {children}
      {visible && (
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={[styles.snackbar, { backgroundColor: getBackgroundColor() }]}>
            <Text style={styles.icon}>{getIcon()}</Text>
            <Text style={styles.message} numberOfLines={2}>
              {message}
            </Text>
            {action && (
              <TouchableOpacity onPress={() => {
                action.onPress();
                hideSnackbar();
              }} style={styles.actionButton}>
                <Text style={styles.actionText}>{action.label}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={hideSnackbar} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </SnackbarContext.Provider>
  );
};

/**
 * useSnackbar - Hook to access snackbar functions from any component
 * 
 * @returns {Object} { showSnackbar, hideSnackbar, showSuccess, showError, showWarning, showInfo }
 * 
 * @example
 * const { showSuccess, showError } = useSnackbar();
 * showSuccess('Operation completed!');
 * showError('Something went wrong');
 */
export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    padding: 16,
  },
  snackbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minHeight: 48,
  },
  icon: {
    fontSize: 20,
    color: '#FFFFFF',
    marginRight: 12,
    fontWeight: 'bold',
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

