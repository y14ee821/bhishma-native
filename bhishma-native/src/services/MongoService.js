import { useEffect, useRef } from "react";
import {modifyIE_Machines, updateIE_Mapper} from "../store/deviceControlSlice"  
import { useDispatch } from "react-redux";

export const IE_Data = () => {
  const dispatch = useDispatch();
  const data = 
    {
      "rao": {
        "channels":{
        1: {
          id: 1,
          name: "1",
          currentState: "OFF",
          IE_Name: "rao",
          radioValue: "",
          channelUpdatedTime:""
        },
        2: {
          id: 2,
          name: "2",
          currentState: "OFF",
          IE_Name: "rao",
          radioValue: "",
          channelUpdatedTime:""
        },
        3: {
          id: 3,
          name: "3",
          currentState: "OFF",
          IE_Name: "rao",
          radioValue: "",
          channelUpdatedTime:""
        },
        4: {
          id: 4,
          name: "4",
          currentState: "OFF",
          IE_Name: "rao",
          radioValue: "",
          channelUpdatedTime:""
        },
      },
      "lastUpdated":"",

      "faulty":"",
      "running":true
      },
      "venky": {
        "channels":{
        1: {
          id: 1,
          name: "1",
          currentState: "OFF",
          IE_Name: "venky",
          radioValue: "",
          channelUpdatedTime:""
        },
        2: {
          id: 2,
          name: "2",
          currentState: "OFF",
          IE_Name: "venky",
          radioValue: "",
          channelUpdatedTime:""
        },
      },
      "lastUpdated":"",
      "faulty":"",
      "running":true
      },
    }
  

  let map = {}
  for(let i in data.current)
    {
    map[Object.keys(data.current[i])[0]]=parseInt(i)
    }
  useEffect(() => {
    
    dispatch(modifyIE_Machines(data))
    dispatch(updateIE_Mapper(map))
  }, []);
};