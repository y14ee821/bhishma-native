# Frontend Documentation (React Native/Expo)

Complete documentation for the Bhishma React Native mobile application.

## Table of Contents

1. [Overview](#overview)
2. [Setup & Installation](#setup--installation)
3. [Project Structure](#project-structure)
4. [Configuration](#configuration)
5. [Authentication](#authentication)
6. [State Management](#state-management)
7. [MQTT Integration](#mqtt-integration)
8. [UI Components](#ui-components)
9. [Navigation](#navigation)
10. [Building & Deployment](#building--deployment)

## Overview

The Bhishma frontend is a React Native application built with Expo that provides:
- Google OAuth authentication
- Real-time device control via MQTT
- Device management interface
- User-friendly IoT control UI

**Technology Stack:**
- React Native 0.81.4
- Expo ~54.0.10
- Redux Toolkit for state management
- React Navigation for routing
- MQTT.js for real-time communication
- expo-auth-session for Google OAuth

## Setup & Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI
- Google Cloud OAuth credentials
- Backend API running

### Step 1: Navigate to Project

```bash
cd bhishma-native
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Configure Environment

Create `.env` file:

```env
# Backend API URL
EXPO_PUBLIC_API_URL=http://localhost:8000

# Google OAuth Client IDs
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com

# Optional: Platform-specific Client IDs
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com

# MQTT Configuration (optional)
REACT_APP_MQTT_HOST=wss://test.mosquitto.org:8081/mqtt
REACT_APP_MQTT_KEEPALIVE=60
REACT_APP_MQTT_RECONNECT_PERIOD=5000
```

### Step 4: Start Development Server

```bash
npm start
# or
yarn start
```

Then:
- Press `w` for web
- Press `a` for Android
- Press `i` for iOS
- Scan QR code with Expo Go app

## Project Structure

```
bhishma-native/
├── App.js                    # Main app component
├── app.json                  # Expo configuration
├── package.json              # Dependencies
├── index.js                  # Entry point
├── src/
│   ├── components/           # Reusable components
│   │   ├── ToggleSwitch.js
│   │   └── utils/
│   │       └── ErrorComponent.js
│   ├── screens/             # Screen components
│   │   ├── HomeScreen.js
│   │   ├── LoginScreen.js
│   │   ├── DeviceControl.js
│   │   └── DedicatedIEControl.js
│   ├── routes/              # Navigation
│   │   └── Routes.js
│   ├── services/            # API and services
│   │   ├── apiService.js
│   │   ├── mqttService.js
│   │   └── IE_Service/
│   │       └── getIEInfo.js
│   ├── store/               # Redux store
│   │   ├── store.js
│   │   ├── authSlice.js
│   │   ├── deviceControlSlice.js
│   │   └── deviceSlice.js
│   ├── mqttcomponents/      # MQTT connection
│   │   └── MqttConnection.js
│   ├── styles/              # Styling
│   │   ├── baseStyling.js
│   │   ├── homeScreenStyling.js
│   │   └── ...
│   └── utils/               # Utilities
│       └── common/
│           └── SnackbarContext.js
└── assets/                  # Images, icons
```

## Configuration

### app.json

```json
{
  "expo": {
    "name": "bhishma-native",
    "slug": "bhishma-native",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

### Environment Variables

All environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the app.

## Authentication

### Google OAuth Flow

1. **User taps "Sign in with Google"**
2. **expo-auth-session** opens Google OAuth
3. **User authenticates** with Google
4. **Frontend receives** Google ID token
5. **Token sent to backend** `/api/auth/google`
6. **Backend verifies** and returns JWT
7. **JWT stored** in AsyncStorage
8. **User redirected** to main app

### Token Management

Tokens are stored in AsyncStorage:
- `access_token` - JWT token
- `user` - User information

### Protected Routes

All screens except LoginScreen require authentication. The app checks authentication status on startup.

## State Management

### Redux Store Structure

```javascript
{
  auth: {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  },
  deviceControl: {
    IE_Info: {},
    connectedToBroker: false,
    connectingToBroker: false,
    // ...
  },
  device: {
    // Device state
  },
  utils: {
    error: null
  }
}
```

### Key Slices

#### authSlice
- `loginWithGoogle` - Google OAuth login
- `checkAuthStatus` - Verify token on startup
- `logout` - Clear authentication
- `getCurrentUser` - Fetch user info

#### deviceControlSlice
- `fetchIEInfo` - Fetch devices from API
- `updateIEsState` - Update device states
- `publishToggleCommand` - Send MQTT commands

## MQTT Integration

### Connection

The app connects to MQTT broker via WebSocket:

```javascript
const mqttConfig = {
  brokerUrl: "wss://test.mosquitto.org:8081/mqtt",
  keepalive: 60,
  reconnectPeriod: 5000
};
```

### Topic Structure

- **Subscribe**: `{device_name}/status` - Receive device status
- **Publish**: `{device_name}` - Send control commands

### Message Formats

#### Control Command (Publish)

Format: `op1:1-op2:0-op3:1-op4:0`

Example:
```javascript
publishToggle(channel, state, deviceName, client);
// Publishes: "op1:1"
```

#### Status Update (Subscribe)

Format: `ip1:1-ip2:0-ip3:1-ip4:0`

Parsed and stored in Redux state.

## UI Components

### Screens

#### LoginScreen
- Google Sign-In button
- Error handling
- Loading states

#### HomeScreen
- Device overview
- Statistics
- Device cards
- Empty state with "Create Sample Devices"

#### DeviceControl
- Device selection
- Navigation to device details

#### DedicatedIEControl
- Individual device control
- Channel toggles
- All On/All Off buttons
- Real-time status

### Components

#### ToggleSwitch
- Custom toggle component
- Visual feedback
- State management

#### ErrorComponent
- Error display
- Retry functionality

## Navigation

### Route Structure

```
LoginScreen (if not authenticated)
  ↓
HomeScreen
  ├── DeviceControl
  │   └── DedicatedIEControl (device details)
  └── (other screens)
```

### Navigation Stack

```javascript
<Stack.Navigator>
  <Stack.Screen name="HomeScreen" />
  <Stack.Screen name="DeviceControl" />
  <Stack.Screen name="DedicatedIEControl" />
</Stack.Navigator>
```

## API Integration

### API Service

Located in `src/services/apiService.js`:

- `authAPI.loginWithGoogle(token)`
- `authAPI.getCurrentUser()`
- `authAPI.verifyToken()`
- `deviceAPI.getUserDevices()`
- `deviceAPI.createDevice(deviceData)`
- `deviceAPI.updateDevice(deviceId, deviceData)`
- `deviceAPI.deleteDevice(deviceId)`

### Request Format

All API requests include JWT token in header:

```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## Building & Deployment

### Development Build

```bash
npm start
```

### Production Build

#### Android

```bash
expo build:android
# or
eas build --platform android
```

#### iOS

```bash
expo build:ios
# or
eas build --platform ios
```

#### Web

```bash
expo build:web
```

### Environment-Specific Builds

Update `.env` for production:

```env
EXPO_PUBLIC_API_URL=https://api.yourdomain.com
```

## Styling

### Theme System

The app supports light and dark themes:

```javascript
const theme = darkMode ? darkTheme : lightTheme;
```

### Style Files

- `baseStyling.js` - Base styles
- `homeScreenStyling.js` - Home screen styles
- `deviceControlStyling.js` - Device control styles
- `routesStyling.js` - Navigation styles

## Troubleshooting

### Common Issues

1. **Google Sign-In not working**
   - Check environment variables
   - Verify OAuth credentials
   - Check redirect URIs

2. **MQTT connection fails**
   - Verify broker URL
   - Check network connectivity
   - Verify WebSocket support

3. **API requests fail**
   - Check backend is running
   - Verify API URL in `.env`
   - Check authentication token

4. **Devices not showing**
   - Verify user is authenticated
   - Check API response
   - Verify device data format

## Next Steps

- [Backend Documentation](./02-BACKEND-DOCUMENTATION.md) - API server
- [ESP32 Documentation](./03-ESP32-DOCUMENTATION.md) - IoT devices
- [Integration Guide](./05-INTEGRATION-GUIDE.md) - Connect components

