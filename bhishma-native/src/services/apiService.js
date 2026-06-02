import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend API base URL - update this to match your backend
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

// Get stored access token
const getAccessToken = async () => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    return token;
  } catch (error) {
    return null;
  }
};

// Store access token
const setAccessToken = async (token) => {
  try {
    await AsyncStorage.setItem('access_token', token);
  } catch (error) {
  }
};

// Remove access token
const removeAccessToken = async () => {
  try {
    await AsyncStorage.removeItem('access_token');
  } catch (error) {
  }
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const token = await getAccessToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...config,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    // Handle non-JSON responses
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { detail: text || 'API request failed' };
    }

    if (!response.ok) {
      throw new Error(data.detail || `API request failed with status ${response.status}`);
    }

    return { success: true, data };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, error: 'Request timeout. Please check if the backend server is running.' };
    }
    return { success: false, error: error.message || 'Network error. Please check if the backend server is running.' };
  }
};

// Auth API
export const authAPI = {
  // Login with Google ID token
  loginWithGoogle: async (googleToken) => {
    return apiRequest('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token: googleToken }),
    });
  },

  // Get current user
  getCurrentUser: async () => {
    return apiRequest('/api/auth/me', {
      method: 'GET',
    });
  },

  // Verify token
  verifyToken: async () => {
    return apiRequest('/api/auth/verify', {
      method: 'POST',
    });
  },

  // Logout (clear token)
  logout: async () => {
    await removeAccessToken();
    return { success: true };
  },
};

// Device API
export const deviceAPI = {
  // Get all devices for current user
  getUserDevices: async () => {
    return apiRequest('/api/devices/', {
      method: 'GET',
    });
  },

  // Create device
  createDevice: async (deviceData) => {
    return apiRequest('/api/devices/', {
      method: 'POST',
      body: JSON.stringify(deviceData),
    });
  },

  // Update device
  updateDevice: async (deviceId, deviceData) => {
    return apiRequest(`/api/devices/${deviceId}`, {
      method: 'PUT',
      body: JSON.stringify(deviceData),
    });
  },

  // Delete device
  deleteDevice: async (deviceId) => {
    return apiRequest(`/api/devices/${deviceId}`, {
      method: 'DELETE',
    });
  },
};

// Export token management functions
export { getAccessToken, setAccessToken, removeAccessToken };

