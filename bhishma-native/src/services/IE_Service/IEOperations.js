import axios from "axios";
import { getAccessToken } from '../apiService';

/**
 * Rename a single channel on a device.
 * Backend: PATCH /api/devices/{device_id}/channels/{channel_id}  body: { name }
 * @param {string} device_id  Mongo ObjectId of the device.
 * @param {number|string} channel_id  Channel key on the device.
 * @param {string} new_name  New display name for the channel.
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const changeChannelName = async (device_id, channel_id, new_name) => {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
    try {
        const token = await getAccessToken();
        if (!token) {
            return { success: false, error: 'Authentication required. Please login again.' };
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
        const data = { name: new_name };

        const response = await axios.patch(
            `${API_BASE_URL}/api/devices/${device_id}/channels/${channel_id}`,
            data,
            { headers }
        );

        if (response.status === 200) {
            return { success: true, data: response.data };
        }
        return {
            success: false,
            error: response.data?.detail || 'Failed to change channel name',
        };
    } catch (error) {
        if (error.response) {
            const status = error.response.status;
            const detail = error.response.data?.detail || error.message;
            switch (status) {
                case 401:
                    return { success: false, error: 'Authentication failed. Please login again.' };
                case 403:
                    return { success: false, error: 'You are not authorized to rename this channel.' };
                case 404:
                    return { success: false, error: detail || 'Device or channel not found.' };
                case 422:
                    return { success: false, error: detail || 'Invalid channel name.' };
                default:
                    return { success: false, error: detail || 'Failed to change channel name' };
            }
        }

        return { success: false, error: error.message || 'Network error. Please try again.' };
    }
};