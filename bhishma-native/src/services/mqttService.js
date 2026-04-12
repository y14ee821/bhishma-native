// Avoid static import from deviceControlSlice (creates a require cycle with deviceControlSlice → mqttService).
const getDeviceControlActions = () => require('../store/deviceControlSlice');

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
import { useStore } from 'react-redux';
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

export const initMQTT = (dispatch, ie_name, channelCount, client) => {
  const { updateIEsState, checkBrokerConnection } = getDeviceControlActions();

  // If client is already connected, subscribe immediately
  if (client.connected) {
    client.subscribe(`${ie_name}/status`, (err) => {
      if (err) {
        console.error(`Failed to subscribe to ${ie_name}/status:`, err);
      }
    });
    dispatch(checkBrokerConnection(true));
  }

  // Setup event handlers
  client.on('connect', () => {
    dispatch(checkBrokerConnection(true));
    client.subscribe(`${ie_name}/status`, (err) => {
      if (err) {
        console.error(`Failed to subscribe to ${ie_name}/status:`, err);
      }
    });
  });

  client.on('message', (topic, message) => {
    if (topic === `${ie_name}/status`) {
      const parsed = parseMessage(message.toString(), channelCount);
      dispatch(updateIEsState({ie_name, valueList: parsed.channels}));
    }
  });

  client.on('error', (error) => {
    console.error(`MQTT error for ${ie_name}:`, error.message);
    dispatch(checkBrokerConnection(false));
  });

  client.on('close', () => {
    dispatch(checkBrokerConnection(false));
  });

  client.on('disconnect', () => {
    dispatch(checkBrokerConnection(false));
  });

  client.on('reconnect', () => {
    dispatch(checkBrokerConnection(true));
  });

  client.on('offline', () => {
    dispatch(checkBrokerConnection(false));
  });
};

export const publishToggle = (channel, state, ie_name, client) => {
  const message = `op${channel}:${state}`;
  client.publish(ie_name, message);
};
export const subscribeToIE = (client, ie_name) => {
  client.subscribe(`${ie_name}/status`);
};
export const unsubscribeFromIE = (client, ie_name) => {
  if (!client) {
    return;
  }

  const topic = `${ie_name}/status`;
  client.unsubscribe(topic, (err) => {
    if (err) {
      console.error(`Failed to unsubscribe from ${topic}:`, err);
    }
  });
};
export const publishFullOperation = (client, ie_name, state, IE_Info,dispatch,
  setAllChannelOperationPerforming,store,setAllChannelOperationSuccess,showSuccess,showError ) =>{
  // state: 1 for "All On", 0 for "All Off"
  dispatch(setAllChannelOperationPerforming(true));
  let desiredState  = false
  if (!IE_Info || !IE_Info[ie_name] || !IE_Info[ie_name].channels) {
    console.error('Invalid IE_Info provided to publishFullOperation');
    return;
  }

  const channels = IE_Info[ie_name].channels;  
  // Build message: op1:1-op2:1-op3:1-op4:1 (for All On)
  // or: op1:0-op2:0-op3:0-op4:0 (for All Off)
  let message = '';
  Object.keys(channels).forEach((channelId, index) => {
    if (index > 0) message += '-';
    message += `op${channelId}:${state}`;
  });
  client.publish(ie_name, message);
  setTimeout(()=>{
    const stateRedux = store.getState();
    Object.keys(channels).forEach((channel, index) => {
      let latestValue = stateRedux.deviceControl.currentIEInfo[ie_name]["channels"][channel]["currentState"];
      if(latestValue== state)
        {
          desiredState = true;
        }
      else
        {
          desiredState = false;
        }
    })
    dispatch(setAllChannelOperationPerforming(false));    
    dispatch(setAllChannelOperationSuccess(desiredState));
    if(desiredState)
      {
        showSuccess(`Operation completed successfully,  ${state==1?"All On":"All Off"}`);
      }
    else
      {
        showError(`Operation failed, unable to change state to ${state==1?"All On":"All Off"}`);
      }
  }
  ,5000)
  
};