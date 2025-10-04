//import mqtt from 'mqtt';
//import { updateDeviceState } from '../store/deviceSlice';
import { updateIEsState } from '../store/deviceControlSlice';

//   const options = {
//     protocol: 'wss',
//      keepalive: 600,
//     clean: true,
//     reconnectPeriod: 1000, // ms
//     connectTimeout: 30 * 1000, // ms
//     clientId: 'emqx_react_lohit_' + Math.random().toString(16).substring(2, 8)
    
//   }

// const url = "wss://test.mosquitto.org:8081/mqtt"
// console.log('MQTT URL:', url);
// const client = mqtt.connect(url, options)

export const parseMessage = (msg,channelCount) => {
  let channels = new Array(channelCount).fill(0);
  //Received message: ip4:0-ip1:0-ip2:1-ip3:1
  msg.split('-').map(
    part => {
      channels[part.split(':')[0].slice(- 1)-1] = parseInt(part.split(':')[1]);
    }
  );
  return { channels };
};

export const initMQTT = (dispatch,ie_name,channelCount,client) => {

  client.on('connect', () => {

    client.subscribe(`${ie_name}/status`);
    console.log('Connected to MQTT broker and subscribed to topic:', `${ie_name}/status`);
  });

  client.on('message', (topic, message) => {
    //console.log('Received message:', message.toString());
    const parsed = parseMessage(message.toString(),channelCount);
    dispatch(updateIEsState({ie_name, valueList: parsed.channels}));
  });
};

export const publishToggle = (channel, state, ie_name, client) => {

  const message = `op${channel}:${state}`;
  
  console.log('Publishing message:', message);

  client.publish(ie_name, message);
};