import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI, setAccessToken, removeAccessToken, getAccessToken } from '../services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Async thunk for Google login
export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (googleToken, { rejectWithValue }) => {
    try {
      const result = await authAPI.loginWithGoogle(googleToken);
      if (result.success) {
        // Store access token
        await setAccessToken(result.data.access_token);
        // Store user info
        await AsyncStorage.setItem('user', JSON.stringify(result.data.user));
        return result.data;
      } else {
        return rejectWithValue(result.error || 'Login failed');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred during login');
    }
  }
);

// Async thunk for getting current user
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const result = await authAPI.getCurrentUser();
      console.log("result from aysncthuink",result);
      if (result.success) {
        await AsyncStorage.setItem('user', JSON.stringify(result.data));
        return result.data;
      } else {
        return rejectWithValue(result.error || 'Failed to get user');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'An error occurred');
    }
  }
);

// Async thunk for checking authentication status
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    console.log('🔐 Checking authentication status...');
    try {
      // Check if we have a stored token
      const token = await getAccessToken();
      
      if (!token) {
        console.log('❌ No token found, user not authenticated');
        // No token, clear any stored user data
        await AsyncStorage.removeItem('user');
        return rejectWithValue('No token found');
      }

      console.log('✅ Token found, verifying...');

      // Verify token is still valid
      const verifyResult = await authAPI.verifyToken();
      if (!verifyResult.success) {
        console.log('❌ Token invalid');
        await removeAccessToken();
        await AsyncStorage.removeItem('user');
        return rejectWithValue('Token invalid');
      }
      
      // Always fetch fresh user data from API to get latest my_devices
      console.log('📡 Fetching fresh user data from API...');
      const result = await authAPI.getCurrentUser();
      if (result.success) {
        console.log('✅ User fetched successfully');
        await AsyncStorage.setItem('user', JSON.stringify(result.data));
        return result.data;
      } else {
        console.log('❌ API call failed:', result.error);
        // Clear invalid data
        await removeAccessToken();
        await AsyncStorage.removeItem('user');
        return rejectWithValue(result.error || 'Not authenticated');
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
      // Clear invalid data on any error
      await removeAccessToken();
      await AsyncStorage.removeItem('user');
      return rejectWithValue(error.message || 'Not authenticated');
    }
  }
);

// Async thunk for logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      await AsyncStorage.removeItem('user');
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    // Start true so the first paint does not load auth UI before checkAuthStatus runs
    // (avoids requiring native modules like ExpoWebBrowser before the RN runtime is ready).
    isLoading: true,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login with Google
    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.access_token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
      });

    // Get current user
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      });

    // Check auth status
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;

