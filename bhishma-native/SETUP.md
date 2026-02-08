# Gmail Authentication Setup Guide

This guide will help you set up Gmail-based authentication for the Bhishma Native app.

## Backend Setup

1. **Install Dependencies**
   ```bash
   cd bhishma-backend
   pip install -r requirements.txt
   ```

2. **Configure Google OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a new project or select an existing one
   - Enable Google+ API
   - Create OAuth 2.0 Client ID credentials
   - For web application: Copy the Client ID and Client Secret
   - Add authorized redirect URIs:
     - `http://localhost:8000` (for development)
     - Your production backend URL

3. **Set Environment Variables**
   - Copy `env.example` to `.env` in `bhishma-backend/`
   - Add your credentials:
     ```
     GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=your-google-client-secret
     JWT_SECRET_KEY=your-secure-random-secret-key
     ```

4. **Start Backend Server**
   ```bash
   uvicorn main:app --reload
   ```

## Frontend Setup

1. **Install Dependencies**
   ```bash
   cd bhishma-native
   npm install
   # or
   yarn install
   ```

2. **Configure Google OAuth for Expo**
   - In Google Cloud Console, create OAuth 2.0 credentials for:
     - **iOS**: Add your iOS bundle identifier
     - **Android**: Add your Android package name
     - **Web**: Use the same web client ID from backend

3. **Set Environment Variables**
   Create a `.env` file in `bhishma-native/`:
   ```
   EXPO_PUBLIC_API_URL=http://localhost:8000
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-google-ios-client-id.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-google-android-client-id.apps.googleusercontent.com
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
   ```

4. **Start Expo App**
   ```bash
   npm start
   # or
   yarn start
   ```

## How It Works

1. **User Login Flow**:
   - User taps "Sign in with Google" on LoginScreen
   - Google OAuth flow starts via expo-auth-session
   - User authenticates with Google
   - Frontend receives Google ID token
   - Frontend sends token to backend `/api/auth/google`
   - Backend verifies token and creates/updates user in database
   - Backend returns JWT access token
   - Frontend stores token and user info
   - User is redirected to main app

2. **Device Management**:
   - When user logs in, their devices are fetched from backend
   - All device operations require authentication
   - Devices are automatically associated with the logged-in user
   - Each user only sees their own devices

3. **Protected Routes**:
   - All app screens are protected by authentication
   - If user is not authenticated, LoginScreen is shown
   - Token is verified on app startup
   - Token is included in all API requests

## API Endpoints

### Authentication
- `POST /api/auth/google` - Login with Google ID token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify` - Verify access token

### Devices (Requires Authentication)
- `GET /api/devices/` - Get user's devices
- `POST /api/devices/` - Create device
- `GET /api/devices/{device_id}` - Get device
- `PUT /api/devices/{device_id}` - Update device
- `DELETE /api/devices/{device_id}` - Delete device

## Troubleshooting

1. **"Google Sign-In is not configured"**
   - Check that environment variables are set correctly
   - Ensure Google OAuth credentials are created in Google Cloud Console

2. **"Invalid Google token"**
   - Verify GOOGLE_CLIENT_ID matches in both frontend and backend
   - Check that the token hasn't expired

3. **"Database not connected"**
   - Verify MongoDB connection string in backend `.env`
   - Ensure MongoDB is running

4. **Devices not showing**
   - Check that user is authenticated
   - Verify devices exist in database with correct user_id
   - Check browser/device console for API errors

