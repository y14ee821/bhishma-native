import { useSelector } from "react-redux";


export const useDeviceControlState = () => {
  const connectedToBroker = useSelector(state => state.deviceControl.connectedToBroker);
  const channelStates = useSelector(state => state.deviceControl.channelStates);  
  const IE_Mapper = useSelector(state => state.deviceControl.IE_Mapper);
  const IE_Info = useSelector(state => state.deviceControl.IE_Info);
  
  return { connectedToBroker, channelStates, IE_Mapper, IE_Info };
}