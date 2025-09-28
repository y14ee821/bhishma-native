import React from 'react';
import { Switch } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { toggleChannel } from '../store/deviceSlice';
import { publishToggle } from '../services/mqttService';

const ToggleSwitch = ({ index }) => {
  const dispatch = useDispatch();
  const value = useSelector(state => state.device.channels[index]);

  const onToggle = () => {
    const newValue = value === 1 ? 0 : 1;
    dispatch(toggleChannel({ index, value: newValue }));
    publishToggle(index, newValue);
  };

  return <Switch value={value === 1} onValueChange={onToggle} />;
};

export default ToggleSwitch;