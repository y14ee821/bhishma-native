# Integration Guide

Complete guide to integrating all Bhishma components.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Integration Steps](#integration-steps)
4. [MQTT Topic Structure](#mqtt-topic-structure)
5. [Device Registration](#device-registration)
6. [End-to-End Flow](#end-to-end-flow)
7. [Testing Integration](#testing-integration)
8. [Troubleshooting](#troubleshooting)

## Overview

This guide explains how to connect:
- **Frontend** (React Native app)
- **Backend** (FastAPI server)
- **ESP32 Devices** (IoT controllers)
- **MQTT Broker** (Message broker)

```
User → Frontend → Backend API → MongoDB
  ↓
MQTT Broker ← ESP32 Device
  ↑
Frontend (real-time updates)
```

## Prerequisites

Before integration, ensure:

- ✅ Backend server is running
- ✅ MongoDB is accessible
- ✅ MQTT broker is running
- ✅ ESP32 devices are configured
- ✅ Frontend app is built
- ✅ Google OAuth is configured

## Integration Steps

### Step 1: Start Backend Server

```bash
cd bhishma-backend
uvicorn main:app --reload
```

Verify: http://localhost:8000/health

### Step 2: Start MQTT Broker

**Option A: Use Public Broker (Development)**
- Broker: `test.mosquitto.org`
- Port: `1883` (MQTT), `8081` (WebSocket)

**Option B: Local Mosquitto (Production)**
```bash
mosquitto -c mosquitto.conf
```

### Step 3: Configure ESP32 Device

1. Edit `config.json` on ESP32:
```json
{
  "broker": "test.mosquitto.org",
  "port": 1883,
  "topic": "device-name",
  "ssid": "YourWiFi",
  "password": "YourPassword",
  "op1": 4,
  "op2": 5,
  "op3": 12,
  "op4": 13
}
```

2. Upload files to ESP32
3. Power on and verify connection

### Step 4: Start Frontend App

```bash
cd bhishma-native
npm start
```

### Step 5: Register Device in Backend

**Option A: Via Frontend**
1. Login to app
2. Click "Create Sample Devices"
3. Or use device creation API

**Option B: Via API**
```bash
curl -X POST http://localhost:8000/api/devices/ \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "rao",
    "type": "IE Controller",
    "status": "online",
    "metadata": {
      "channelCount": 4
    }
  }'
```

## MQTT Topic Structure

### Topic Naming Convention

Devices use their name as the MQTT topic:

```
Device Name: "rao"
Control Topic: "rao"
Status Topic: "rao/status"
```

### Topic Hierarchy

```
{device_name}              # Control commands (ESP32 subscribes)
{device_name}/status       # Status updates (ESP32 publishes)
```

### Message Flow

```
Frontend → MQTT → ESP32
  Topic: "rao"
  Message: "op1:1-op2:0"

ESP32 → MQTT → Frontend
  Topic: "rao/status"
  Message: "ip1:1-ip2:0-ip3:1-ip4:0"
```

## Device Registration

### Method 1: Frontend UI

1. Login to app
2. Navigate to HomeScreen
3. Click "Create Sample Devices"
4. Devices appear in list

### Method 2: API Call

```javascript
// From frontend
const device = {
  name: "rao",
  type: "IE Controller",
  status: "online",
  metadata: { channelCount: 4 }
};

await deviceAPI.createDevice(device);
```

### Method 3: Manual Database Entry

```javascript
// MongoDB document
{
  "name": "rao",
  "type": "IE Controller",
  "status": "online",
  "user_id": "user-object-id",
  "metadata": {
    "channelCount": 4
  },
  "created_at": ISODate(),
  "updated_at": ISODate()
}
```

## End-to-End Flow

### 1. User Authentication

```
User → Frontend → Google OAuth → Backend
  ↓
Backend → MongoDB (create/update user)
  ↓
Backend → Frontend (JWT token)
  ↓
Frontend → AsyncStorage (store token)
```

### 2. Device Discovery

```
Frontend → Backend API → MongoDB
  ↓
Backend → Frontend (device list)
  ↓
Frontend → Redux Store (store devices)
```

### 3. Real-time Control

```
User Action (Toggle Switch)
  ↓
Frontend → MQTT Publish
  Topic: "rao"
  Message: "op1:1"
  ↓
MQTT Broker → ESP32
  ↓
ESP32 → GPIO Control
  Pin 4 → HIGH
  ↓
ESP32 → MQTT Publish
  Topic: "rao/status"
  Message: "ip1:1-ip2:0-ip3:0-ip4:0"
  ↓
MQTT Broker → Frontend
  ↓
Frontend → Redux Store (update state)
  ↓
UI Updates (switch reflects new state)
```

### 4. Status Monitoring

```
ESP32 (every 1 second)
  ↓
Read output states
  ↓
Format: "ip1:1-ip2:0-ip3:1-ip4:0"
  ↓
Publish to "rao/status"
  ↓
Frontend subscribes to "rao/status"
  ↓
Parse message → Update Redux
  ↓
UI reflects current state
```

## Testing Integration

### Test 1: Authentication Flow

1. Open app
2. Click "Sign in with Google"
3. Complete OAuth
4. Verify login success
5. Check user info in navbar

### Test 2: Device Creation

1. Login to app
2. Click "Create Sample Devices"
3. Verify devices appear
4. Check backend database

### Test 3: MQTT Connection

1. Check MQTT connection status in app
2. Verify ESP32 is connected
3. Check MQTT broker logs

### Test 4: Device Control

1. Navigate to DeviceControl
2. Select a device
3. Toggle a channel
4. Verify ESP32 responds
5. Check status updates

### Test 5: Real-time Updates

1. Control device from app
2. Verify immediate UI update
3. Check ESP32 physical response
4. Verify status sync

## MQTT Testing Tools

### mosquitto_sub (Subscribe)

```bash
# Subscribe to device status
mosquitto_sub -h test.mosquitto.org -t rao/status

# Subscribe to all topics
mosquitto_sub -h test.mosquitto.org -t "#"
```

### mosquitto_pub (Publish)

```bash
# Send control command
mosquitto_pub -h test.mosquitto.org -t rao -m "op1:1-op2:0"

# Test single channel
mosquitto_pub -h test.mosquitto.org -t rao -m "op1:1"
```

## Verification Checklist

- [ ] Backend server running
- [ ] MongoDB connected
- [ ] MQTT broker accessible
- [ ] ESP32 connected to WiFi
- [ ] ESP32 connected to MQTT
- [ ] Frontend app running
- [ ] User can login
- [ ] Devices visible in app
- [ ] MQTT connection established
- [ ] Control commands work
- [ ] Status updates received
- [ ] UI updates in real-time

## Troubleshooting

### Device Not Appearing

**Check:**
1. Device exists in database
2. Device `user_id` matches logged-in user
3. Frontend fetched devices successfully
4. Check browser console for errors

### MQTT Not Connecting

**Check:**
1. MQTT broker is running
2. Network connectivity
3. Broker URL is correct
4. Port is accessible
5. Firewall settings

### Control Commands Not Working

**Check:**
1. ESP32 is subscribed to correct topic
2. Message format is correct
3. ESP32 is receiving messages
4. GPIO pins are configured correctly
5. Check ESP32 serial output

### Status Updates Not Received

**Check:**
1. Frontend is subscribed to status topic
2. ESP32 is publishing status
3. Topic name matches
4. Message format is correct
5. MQTT connection is active

## Next Steps

- [API Reference](./06-API-REFERENCE.md) - Complete API docs
- [Deployment Guide](./07-DEPLOYMENT-GUIDE.md) - Production setup
- [Troubleshooting](./08-TROUBLESHOOTING.md) - Common issues

