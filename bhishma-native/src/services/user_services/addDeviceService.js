import axios from 'axios';
import { getAccessToken } from '../apiService';

export const addDeviceService = async (deviceName, secretKey) => {
  const token = await getAccessToken();
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
  const data = {
    name: deviceName,
    security_key: secretKey
  };

  try {
    const response = await axios.post(`${API_BASE_URL}/api/devices/map/userDevice`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.detail || error.message };
  }
};
