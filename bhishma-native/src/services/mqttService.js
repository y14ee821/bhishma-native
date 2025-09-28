import mqtt from 'mqtt';
import { updateDeviceState } from '../store/deviceSlice';

  const options = {
    protocol: 'wss',
     keepalive: 600,
    clean: true,
    reconnectPeriod: 1000, // ms
    connectTimeout: 30 * 1000, // ms
    clientId: 'emqx_react_lohit_' + Math.random().toString(16).substring(2, 8)
    
  }

const url = "wss://test.mosquitto.org:8081/mqtt"
console.log('MQTT URL:', url);
const client = mqtt.connect(url, options)

export const parseMessage = (msg) => {
  const channels = msg.split('-').map(part => parseInt(part.split(':')[1]));
  return { channels };
};

export const initMQTT = (dispatch) => {

  client.on('connect', () => {
    client.subscribe('rao/status');
  });

  client.on('message', (topic, message) => {
    console.log('Received message:', message.toString());
    const parsed = parseMessage(message.toString());
    dispatch(updateDeviceState(parsed));
  });
};

export const publishToggle = (channel, state) => {
  const message = `op${channel+1}:${state}`;
  console.log('Publishing message:', message);
  client.publish('rao', message);
};