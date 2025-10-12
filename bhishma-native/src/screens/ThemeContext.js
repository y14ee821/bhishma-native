import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState(systemColorScheme || 'light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedTheme();
  }, []);

  useEffect(() => {
    if (systemColorScheme) {
      setTheme(systemColorScheme);
    }
  }, [systemColorScheme]);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('appTheme');
      if (savedTheme) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async (newTheme) => {
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('appTheme', newTheme);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const colors = {
    light: {
      primary: '#6200EE',
      secondary: '#03DAC6',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      card: '#FFFFFF',
      text: '#000000',
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

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors: colors[theme],
        toggleTheme,
        isLoading,
        isDark: theme === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
