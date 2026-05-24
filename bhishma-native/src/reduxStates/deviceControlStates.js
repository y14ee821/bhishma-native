import { useSelector } from "react-redux";

/**
 * Hook to get all device control state
 * @returns {Object} All device control state values
 */
export const useDeviceControlState = () => {
  const connectedToBroker = useSelector(state => state.deviceControl.connectedToBroker);
  const connectingToBroker = useSelector(state => state.deviceControl.connectingToBroker);
  const channelStates = useSelector(state => state.deviceControl.channelStates);
  const IE_Mapper = useSelector(state => state.deviceControl.IE_Mapper);
  const IE_Info = useSelector(state => state.deviceControl.IE_Info);
  const loadingIEInfo = useSelector(state => state.deviceControl.loadingIEInfo);
  const errorIEInfo = useSelector(state => state.deviceControl.errorIEInfo);
  const publishingToggle = useSelector(state => state.deviceControl.publishingToggle);
  const toggleError = useSelector(state => state.deviceControl.toggleError);
  const allChannelOperationPerforming = useSelector(state=>state.deviceControl.allChannelOperationPerforming);
  const allChannelOperationSuccess = useSelector(state=>state.deviceControl.allChannelOperationSuccess);
  return { 
    connectedToBroker, 
    connectingToBroker,
    channelStates, 
    IE_Mapper, 
    IE_Info,
    loadingIEInfo,
    errorIEInfo,
    publishingToggle,
    toggleError,
    allChannelOperationPerforming,
    allChannelOperationSuccess,
  };
};
export const useUpdateChannelDetails = ()=>
{
  return useSelector(state=>state.deviceControl.updateChannelDetails);
}
/**
 * Hook to get IE Info only
 * @returns {Object} IE_Info object
 */
export const useIEInfo = () => {
  
  return useSelector(state => state.deviceControl.IE_Info);
};

/**
 * Hook to get broker connection state
 * @returns {boolean} connectedToBroker
 */
export const useBrokerConnection = () => {
  return useSelector(state => state.deviceControl.connectedToBroker);
};

/**
 * Hook to get broker connecting state
 * @returns {boolean} connectingToBroker
 */
export const useBrokerConnecting = () => {
  return useSelector(state => state.deviceControl.connectingToBroker);
};

/**
 * Hook to get IE Info loading state
 * @returns {boolean} loadingIEInfo
 */
export const useIEInfoLoading = () => {
  return useSelector(state => state.deviceControl.loadingIEInfo);
};

/**
 * Hook to get IE Info error
 * @returns {string|null} errorIEInfo
 */
export const useIEInfoError = () => {
  return useSelector(state => state.deviceControl.errorIEInfo);
};

/**
 * Hook to get channel states
 * @returns {Object} channelStates
 */
export const useChannelStates = () => {
  return useSelector(state => state.deviceControl.channelStates);
};

/**
 * Hook to get IE Mapper
 * @returns {Object} IE_Mapper
 */
export const useIEMapper = () => {
  return useSelector(state => state.deviceControl.IE_Mapper);
};

/**
 * Hook to get toggle publishing state
 * @returns {boolean} publishingToggle
 */
export const useTogglePublishing = () => {
  return useSelector(state => state.deviceControl.publishingToggle);
};

/**
 * Hook to get toggle error
 * @returns {string|null} toggleError
 */
export const useToggleError = () => {
  return useSelector(state => state.deviceControl.toggleError);
};

/**
 * Hook to get a specific IE's info
 * @param {string} ieName - Name of the IE
 * @returns {Object|null} IE info for the specified name
 */
export const useIEByName = (ieName) => {
  return useSelector(state => state.deviceControl.IE_Info[ieName] || null);
};

/**
 * Hook to get a specific channel's state
 * @param {string} ieName - Name of the IE
 * @param {number} channelId - Channel ID
 * @returns {Object|null} Channel state
 */
export const useChannelState = (ieName, channelId) => {
  return useSelector(state => 
    state.deviceControl.currentIEInfo[ieName]?.channels?.[channelId] || null
  );
};
