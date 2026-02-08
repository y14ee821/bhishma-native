import { deviceAPI } from '../apiService';

export const getIEInfo = async () => {
    try {
        // Fetch devices from backend API
        const result = await deviceAPI.getUserDevices();
        
        if (!result.success) {
            // If API call fails, return empty data structure
            console.warn('Failed to fetch devices from API:', result.error);
            return { success: true, data: {} };
        }

        // Transform devices from backend into the expected IE format
        // Devices from backend have: id, name, type, status, user_id, metadata
        // Expected format: { deviceName: { channels: {...}, channelCount, ... } }
        const devices = result.data || [];
        const transformedData = {};

        devices.forEach((device) => {
            // Use device name as the key (IE name)
            const deviceName = device.name.toLowerCase().replace(/\s+/g, '_');
            
            // Get channel count from metadata or default to 4
            const channelCount = device.metadata?.channelCount || 4;
            
            // Initialize channels
            const channels = {};
            for (let i = 1; i <= channelCount; i++) {
                channels[i] = {
                    id: i,
                    name: String(i),
                    currentState: 0,
                    IE_Name: device.name,
                    uiValue: 0,
                    channelUpdatedTime: device.updated_at || ""
                };
            }

            transformedData[deviceName] = {
                channels,
                lastUpdated: device.updated_at || "",
                channelCount,
                faulty: device.status === "offline" ? "offline" : "",
                running: device.status !== "offline",
                deviceId: device.id,
                deviceType: device.type
            };
        });

        // If no devices, return empty object (app will handle this)
        return { success: true, data: transformedData };
    } catch (error) {
        console.error('Error fetching IE info:', error);
        return { success: false, error: error.message };
    }
}
