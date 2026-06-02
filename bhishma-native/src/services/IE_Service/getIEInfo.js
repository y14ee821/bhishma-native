import axios from 'axios';
import { getAccessToken } from '../apiService';

/**
 * Get all devices (IE Info) for the authenticated user
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getIEInfo = async () => {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
    
    try {
        // Get authentication token
        const token = await getAccessToken();
        if (!token) {
            return { success: false, error: 'Authentication required. Please login again.' };
        }

        // Make authenticated request
        const response = await axios.get(`${API_BASE_URL}/api/devices`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200 && response.data?.data) {
            return { success: true, data: response.data.data };
        } else {
            return { success: false, error: 'Invalid response format from server' };
        }

    } catch (error) {
        // Handle specific error cases
        if (error.response) {
            const status = error.response.status;
            const detail = error.response.data?.detail || error.message;
            
            switch (status) {
                case 401:
                    return { success: false, error: 'Authentication failed. Please login again.' };
                case 403:
                    return { success: false, error: 'Access denied.' };
                case 404:
                    return { success: false, error: 'Devices endpoint not found.' };
                case 500:
                    return { success: false, error: 'Server error. Please try again later.' };
                default:
                    return { success: false, error: detail || 'Failed to fetch devices' };
            }
        }
        
        // Network or other errors
        return { success: false, error: error.message || 'Network error. Please check your connection.' };
    }
}