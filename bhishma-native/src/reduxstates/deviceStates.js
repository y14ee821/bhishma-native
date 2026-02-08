import { useSelector } from "react-redux";

/**
 * Hook to get all device state
 * @returns {Object} All device state values
 */
export const useDeviceState = () => {
  const channels = useSelector(state => state.device.channels);
  const online = useSelector(state => state.device.online);
  
  return { channels, online };
};

/**
 * Hook to get device channels
 * @returns {Array} channels array
 */
export const useDeviceChannels = () => {
  return useSelector(state => state.device.channels);
};

/**
 * Hook to get device online status
 * @returns {boolean} online status
 */
export const useDeviceOnline = () => {
  return useSelector(state => state.device.online);
};

/**
 * Hook to get a specific channel value
 * @param {number} channelIndex - Channel index
 * @returns {number} Channel value
 */
export const useDeviceChannel = (channelIndex) => {
  return useSelector(state => state.device.channels[channelIndex]);
};

