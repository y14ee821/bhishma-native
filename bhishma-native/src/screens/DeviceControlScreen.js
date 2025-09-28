import mqtt from "mqtt"
import { IOcard } from "../components/card/IOcard"
import { MqttSub,MqttPub,MqttMessage } from "../mqttcomponents/"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { checkBrokerConnection,modifyIE_Machines } from "../store/deviceControlSlice"
import { useDeviceControlState } from "../reduxstates/deviceControlStates";
import {IE_Data} from "../services"
import { useState, useEffect } from "react"

import { useRoute } from '@react-navigation/native';

export const DeviceControlScreen = ({ieName}) => {
IE_Data()//IE data context
const params = useRoute()

const productId = params.id==undefined?"":params.id;
const { connectedToBroker, channelStates, IE_Mapper, IE_Info } = useDeviceControlState();
let IE_Info_dup = {...JSON.parse(JSON.stringify(IE_Info))}

//const { checkBrokerConnection,modifyIE_Machines } = useIEState();
// const [currentIE, setCurrentIE] = useState(productId!=""?productId:"")
//const currentIE = params.id
const currentIE = "rao"
const dispatch = useDispatch();


const IE_Names = Object.keys(IE_Info)//gets the machine names
  const options = {
    protocol: 'wss',
     keepalive: 600,
    clean: true,
    reconnectPeriod: 1000, // ms
    connectTimeout: 30 * 1000, // ms
    clientId: 'emqx_react_lohit123_' + Math.random().toString(16).substring(2, 8)
    
  }
  //const url = process.env.REACT_APP_MQTT_HOST
  const url = "wss://test.mosquitto.org:8081/mqtt"
  const [client,setClient] = useState(mqtt.connect(url, options)) 
  useEffect(()=>{
      
    client.on('connect', function () 
    {
      console.log("client Connected",client.connected) 
      dispatch(checkBrokerConnection(true))//sets connectedToBroker to true
      setClient(client)
      //IE_Names.map(ie=>(MqttSub(client,`${ie}/status`)))
    })
    client.on('error', (err) => {
      dispatch(checkBrokerConnection(false))//sets connectedToBroker to false
      console.error('Connection error: ', err);
      client.end();
    });
    client.on('reconnect', () => {
      dispatch(checkBrokerConnection(false))//sets connectedToBroker to false
      console.log('Reconnecting');
    });
  
  },[client])

 const ieEnabler = (_IE_Info, ie) => {
  const timeOut = 50000; // in ms
  const curTime = new Date();
  const groupKey = ie.split("/")[0];
  //const lastUpdated = new Date(_IE_Info[groupKey]?.lastUpdated || 0);
  const lastUpdated = new Date(_IE_Info[groupKey]["lastUpdated"]);
  const updatedTime = curTime - lastUpdated;
  console.log("cur time",curTime)
  console.log("last updated",lastUpdated)
  console.log("new updated time",updatedTime)

  if (isNaN(lastUpdated.getTime())) {
  // Fallback to epoch or skip logic
  console.warn("Invalid lastUpdated value:", lastUpdated);
  return false;
}
  // Clone the group object
  const updatedGroup = {
    ..._IE_Info[groupKey],
    running: false,
  };

  // Clone the full IE_Info object
  const updatedIE_Info = {
    ..._IE_Info,
    [groupKey]: updatedGroup,
  };

  if (updatedTime >= timeOut || _IE_Info[groupKey]?.lastUpdated === "") {
    dispatch(modifyIE_Machines(updatedIE_Info));
    return false;
  }

  return true;
};


  if(IE_Names!=[] && connectedToBroker)
  {
    MqttMessage(client,IE_Info,dispatch)//checks for incoming messages from IEs
  }

  
  if(Object.keys(IE_Info).length!=0)
    setInterval(ieEnabler,10000,IE_Info,currentIE)



  function bulkControl(ie_name,state="",channelCount=null)
  {
    // To turn on or turn off the channels in bulk
    
    let finalString = ""
    if(state!="")
    {
      channelCount.map(c=> finalString= finalString+"op"+c+":"+state+"-")
    }
    console.log(finalString.slice(0,finalString.length-1))
    MqttPub(
      client,
      `${ie_name}`,
      finalString.slice(0,finalString.length-1)
    );
  }

    const handleRefresh = () => {
    Alert.alert("Refresh", "Please restart the app to reconnect.");
    // Here, you would reconnect MQTT or reinitialize state
  };
  return (
 <ScrollView style={styles.main}>
      <View style={styles.statusContainer}>
        {!connectedToBroker ? (
          <View>
            <Text style={styles.connectionStatusFailed}>
              Connecting to Server...Hang on!
            </Text>
            <Text style={styles.infoText}>
              It will take mostly 1 minute, if not connected
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.connectionStatusConnected}>
            Connected To Server!
          </Text>
        )}
      </View>

      {connectedToBroker && currentIE !== "" && IE_Names.length > 0 && (
        <View style={styles.borderContainer}>
          {/* Replace with your IOcard RN component for channels */}
          
            <IOcard
              key={currentIE}
              item={{ [currentIE]: IE_Info[currentIE]["channels"] }}
              client={client}
              IE_Info={IE_Info}
              dispatch={dispatch}
            /> 
          
          <View style={styles.bulkControlContainer}>
            <TouchableOpacity
              style={styles.allOnButton}
              onPress={() =>
                bulkControl(
                  currentIE,
                  "1",
                  Object.keys(IE_Info[currentIE]["channels"])
                )
              }
            >
              <Text style={styles.allOnButtonText}>ALL ON</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.allOffButton}
              onPress={() =>
                bulkControl(
                  currentIE,
                  "0",
                  Object.keys(IE_Info[currentIE]["channels"])
                )
              }
            >
              <Text style={styles.allOffButtonText}>ALL OFF</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
} 


const styles = StyleSheet.create({
  main: {
    flex: 1,
    padding: 12,
    backgroundColor: '#141414', // Dark background
  },
  statusContainer: {
    marginBottom: 24,
  },
  connectionStatusFailed: {
    backgroundColor: '#D32F2F',
    color: 'white',
    padding: 12,
    borderRadius: 8,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 16,
  },
  connectionStatusConnected: {
    backgroundColor: '#388E3C',
    color: 'white',
    padding: 12,
    borderRadius: 8,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 12,
  },
  infoText: {
    color: '#EDEDED',
    textAlign: 'center',
    fontWeight: 'bold',
    padding: 16,
    fontSize: 15,
  },
  refreshButton: {
    backgroundColor: '#7C4DFF',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 10,
    alignSelf: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center'
  },
  borderContainer: {
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 10,
    marginBottom: 20,
    padding: 8,
  },
  bulkControlContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  allOnButton: {
    backgroundColor: '#388E3C',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginRight: 8,
  },
  allOnButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  allOffButton: {
    backgroundColor: '#D32F2F',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginLeft: 8,
  },
  allOffButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600'
  },
});
//ieEnabler(IE_Info,currentIE)