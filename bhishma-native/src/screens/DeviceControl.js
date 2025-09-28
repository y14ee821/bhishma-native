import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import ToggleSwitch from '../components/ToggleSwitch';
import { useDispatch } from 'react-redux';
import { initMQTT } from '../services/mqttService';

export const DeviceControl = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    initMQTT(dispatch);
  }, []);

  return (
    <View>
      <Text>Device Control</Text>
      {[0, 1, 2, 3].map(i => (
        <ToggleSwitch key={i} index={i} />
      ))}
    </View>
  );
};

