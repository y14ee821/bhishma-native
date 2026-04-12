import React, { useState,useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { lightTheme, darkTheme, addDeviceStyles } from "../styles";
import { addDeviceService } from '../services/user_services';
import { useSnackbar } from '../utils/common/SnackbarContext';
import { getCurrentUser } from '../store/authSlice';

const styles = addDeviceStyles;

export const AddDevice = ({ darkMode, navigation }) => {
  const dispatch = useDispatch();
  const { showSuccess, showError } = useSnackbar();
  const theme = darkMode ? darkTheme : lightTheme;
  const [deviceName, setDeviceName] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [deviceNameFocused, setDeviceNameFocused] = useState(false);
  const [secretKeyFocused, setSecretKeyFocused] = useState(false);

  const isFormValid = deviceName.trim() !== '' && secretKey.trim() !== '';

  const handleAddDevice = async () => {
    if (isFormValid) {
      const result = await addDeviceService(deviceName, secretKey);
      if(result.data.success)
      {
        showSuccess(result.data.message);
        dispatch(getCurrentUser());
      }else{
        showError(result.data.message);
      }

      setDeviceName('');
      setSecretKey('');
    }
  };

  const handleCancel = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  return (
    <LinearGradient colors={theme.gradient} style={styles.gradient}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Add New Device</Text>
            <Text style={styles.subtitle}>Connect your IoT device to Bhishma</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Device Name</Text>
              <TextInput
                placeholder="e.g., Remcon"
                placeholderTextColor="#999"
                style={[styles.input, deviceNameFocused && styles.inputFocused]}
                value={deviceName}
                onChangeText={setDeviceName}
                onFocus={() => setDeviceNameFocused(true)}
                onBlur={() => setDeviceNameFocused(false)}
                autoCapitalize="words"
              />
              <Text style={styles.helperText}>Give your device a friendly name</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Secret Key</Text>
              <TextInput
                placeholder="Enter device secret key"
                placeholderTextColor="#999"
                style={[styles.input, secretKeyFocused && styles.inputFocused]}
                value={secretKey}
                onChangeText={setSecretKey}
                onFocus={() => setSecretKeyFocused(true)}
                onBlur={() => setSecretKeyFocused(false)}
                secureTextEntry
                autoCapitalize="none"
              />
              <Text style={styles.helperText}>Found on your device or documentation</Text>
            </View>

            <TouchableOpacity 
              style={[styles.button, !isFormValid && styles.buttonDisabled]}
              onPress={handleAddDevice}
              disabled={!isFormValid}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Add Device</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};
