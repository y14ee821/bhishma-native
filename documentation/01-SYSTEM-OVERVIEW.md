# System Overview

## Architecture

Bhishma is an IoT device control system that allows users to remotely control ESP32-based devices through a mobile/web application. The system consists of three main components:

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Frontend      │         │    Backend       │         │   ESP32 Device  │
│  (React Native) │◄───────►│   (FastAPI)      │◄───────►│  (MicroPython)  │
│                 │  HTTP   │                  │  MQTT   │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
         │                           │                            │
         │                           │                            │
         └───────────────────────────┴────────────────────────────┘
                                     │
                              ┌──────▼──────┐
                              │   MongoDB   │
                              │  Database   │
                              └─────────────┘
```

## Components

### 1. Frontend (bhishma-native)
- **Technology**: React Native with Expo
- **Purpose**: User interface for device control
- **Features**:
  - Google OAuth authentication
  - Real-time device status via MQTT
  - Device control interface
  - User device management

### 2. Backend (bhishma-backend)
- **Technology**: FastAPI (Python)
- **Purpose**: API server and authentication
- **Features**:
  - RESTful API
  - Google OAuth verification
  - JWT token management
  - User and device data management
  - MongoDB integration

### 3. ESP32 Firmware (bhishma-esp)
- **Technology**: MicroPython
- **Purpose**: IoT device controller
- **Features**:
  - WiFi connectivity
  - MQTT client
  - GPIO pin control
  - Status reporting

## Data Flow

### Authentication Flow
```
User → Frontend → Google OAuth → Backend → MongoDB
                ↓
            JWT Token → Frontend (stored)
```

### Device Control Flow
```
User Action → Frontend → MQTT Broker → ESP32 → GPIO Control
                                    ↓
                              Status Update → MQTT → Frontend
```

### Device Registration Flow
```
ESP32 → MQTT Status → Backend (optional) → MongoDB
User → Frontend → Backend API → MongoDB
```

## Technology Stack

### Frontend
- **Framework**: React Native 0.81.4
- **Build Tool**: Expo ~54.0.10
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **MQTT Client**: mqtt.js
- **Authentication**: expo-auth-session

### Backend
- **Framework**: FastAPI 0.115.0
- **Database**: MongoDB (Motor async driver)
- **Authentication**: Google OAuth, JWT
- **Validation**: Pydantic
- **Server**: Uvicorn

### ESP32
- **Language**: MicroPython
- **Protocol**: MQTT 3.1.1
- **Network**: WiFi (network module)
- **GPIO**: machine.Pin

### Infrastructure
- **MQTT Broker**: test.mosquitto.org (development)
- **Database**: MongoDB Atlas or local
- **OAuth Provider**: Google Cloud Platform

## Key Features

### Security
- ✅ Google OAuth authentication
- ✅ JWT token-based API access
- ✅ User-specific device access
- ✅ Secure token storage

### Real-time Communication
- ✅ MQTT for device status updates
- ✅ WebSocket support for MQTT
- ✅ Real-time device state synchronization

### Scalability
- ✅ Modular architecture
- ✅ Async/await for performance
- ✅ Database indexing support
- ✅ Stateless API design

## System Requirements

### Development
- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- MicroPython-compatible ESP32
- MongoDB instance
- MQTT broker access

### Production
- Node.js 18+ runtime
- Python 3.11+ runtime
- MongoDB database
- MQTT broker (self-hosted or cloud)
- SSL/TLS certificates
- Google OAuth credentials

## Communication Protocols

### HTTP/REST
- **Used for**: API communication between frontend and backend
- **Port**: 8000 (default)
- **Protocol**: HTTP/HTTPS
- **Format**: JSON

### MQTT
- **Used for**: Real-time device communication
- **Port**: 1883 (default), 8081 (WebSocket)
- **Protocol**: MQTT 3.1.1
- **Format**: String messages
- **Topics**:
  - `{device_name}` - Control commands
  - `{device_name}/status` - Status updates

## Database Schema

### Users Collection
```json
{
  "_id": ObjectId,
  "name": "string",
  "email": "string",
  "google_id": "string",
  "picture": "string",
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### Devices Collection
```json
{
  "_id": ObjectId,
  "name": "string",
  "type": "string",
  "status": "string",
  "user_id": "string",
  "metadata": {
    "channelCount": number
  },
  "created_at": ISODate,
  "updated_at": ISODate
}
```

## Next Steps

- [Backend Documentation](./02-BACKEND-DOCUMENTATION.md) - Set up the API server
- [ESP32 Documentation](./03-ESP32-DOCUMENTATION.md) - Configure IoT devices
- [Frontend Documentation](./04-FRONTEND-DOCUMENTATION.md) - Set up the mobile app
- [Integration Guide](./05-INTEGRATION-GUIDE.md) - Connect all components

