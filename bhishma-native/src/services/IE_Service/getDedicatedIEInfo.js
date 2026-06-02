import axios from 'axios';
import { getAccessToken } from '../apiService';

/**
 * Get dedicated device information by device ID
 * @param {string} device_id - The device ID to fetch
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getDedicatedIEInfo = async (device_id) => {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
    
    try {
        // Get authentication token
        const token = await getAccessToken();
        if (!token) {
            return { success: false, error: "Authentication required" };
        }

        // Make authenticated request
        const response = await axios.get(`${API_BASE_URL}/api/devices/${device_id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            return { success: true, data: response.data };
        } else {
            return { success: false, error: "Failed to fetch device info" };
        }

    } catch (error) {
        // Handle specific error cases
        if (error.response) {
            const status = error.response.status;
            const detail = error.response.data?.detail || error.message;
            
            switch (status) {
                case 401:
                    return { success: false, error: "Authentication failed. Please login again." };
                case 403:
                    return { success: false, error: "Access denied. Device not mapped to your account." };
                case 404:
                    return { success: false, error: "Device not found." };
                default:
                    return { success: false, error: detail };
            }
        }
        
        return { success: false, error: error.message || "Network error" };
    }
}