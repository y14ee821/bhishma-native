# Quick Reference Guide

Quick reference for common tasks and commands.

## Backend

### Start Server
```bash
cd bhishma-backend
uvicorn main:app --reload
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Environment Variables
```env
MONGODB_URI=mongodb+srv://...
DATABASE_NAME=bhishma_db
JWT_SECRET_KEY=your-secret-key
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret
```

### API Base URL
```
http://localhost:8000
```

### API Docs
- Swagger: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Frontend

### Start Development
```bash
cd bhishma-native
npm start
```

### Install Dependencies
```bash
npm install
```

### Environment Variables
```env
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id
```

### Build Commands
```bash
# Web
expo build:web

# Android
expo build:android

# iOS
expo build:ios
```

## ESP32

### Upload Files
```bash
rshell -p COM3
> cp *.py /pyboard/
> cp config.json /pyboard/
```

### Configuration
Edit `config.json`:
- WiFi SSID and password
- MQTT broker and port
- Device topic name
- GPIO pin numbers

### Serial Monitor
```bash
# Windows
putty COM3 115200

# Linux/Mac
screen /dev/ttyUSB0 115200
```

## MQTT

### Subscribe to Status
```bash
mosquitto_sub -h test.mosquitto.org -t rao/status
```

### Publish Command
```bash
mosquitto_pub -h test.mosquitto.org -t rao -m "op1:1-op2:0"
```

### Test Connection
```bash
mosquitto_pub -h test.mosquitto.org -t test -m "hello"
mosquitto_sub -h test.mosquitto.org -t test
```

## Common Tasks

### Create Device via API
```bash
curl -X POST http://localhost:8000/api/devices/ \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "rao",
    "type": "IE Controller",
    "status": "online",
    "metadata": {"channelCount": 4}
  }'
```

### Get User Devices
```bash
curl http://localhost:8000/api/devices/ \
  -H "Authorization: Bearer {token}"
```

### Verify Token
```bash
curl -X POST http://localhost:8000/api/auth/verify \
  -H "Authorization: Bearer {token}"
```

## File Locations

### Backend
- Main app: `bhishma-backend/main.py`
- Routes: `bhishma-backend/app/routes/`
- Models: `bhishma-backend/app/models/`
- Config: `bhishma-backend/.env`

### Frontend
- Main app: `bhishma-native/App.js`
- Screens: `bhishma-native/src/screens/`
- Services: `bhishma-native/src/services/`
- Config: `bhishma-native/.env`

### ESP32
- Main: `bhishma-esp/main.py`
- MQTT: `bhishma-esp/mqtt_handle.py`
- Config: `bhishma-esp/config.json`

## Ports

- Backend API: `8000`
- Expo Web: `8081` or `19006`
- MQTT: `1883` (TCP), `8081` (WebSocket)
- MQTT TLS: `8883`

## Message Formats

### Control Command
```
op1:1-op2:0-op3:1-op4:0
```

### Status Update
```
ip1:1-ip2:0-ip3:1-ip4:0
```

## Troubleshooting Commands

### Check Backend Health
```bash
curl http://localhost:8000/health
```

### Test MongoDB Connection
```python
from motor.motor_asyncio import AsyncIOMotorClient
client = AsyncIOMotorClient("your-uri")
await client.admin.command('ping')
```

### Check ESP32 WiFi
```python
import network
wlan = network.WLAN(network.STA_IF)
print(wlan.isconnected())
print(wlan.ifconfig())
```

### Clear Frontend Storage
```javascript
// In browser console
localStorage.clear();
// Or in app
await AsyncStorage.clear();
```

## Environment Setup Checklist

- [ ] Backend `.env` configured
- [ ] Frontend `.env` configured
- [ ] ESP32 `config.json` configured
- [ ] MongoDB running/accessible
- [ ] MQTT broker accessible
- [ ] Google OAuth configured
- [ ] All services running

## Quick Links

- [System Overview](./01-SYSTEM-OVERVIEW.md)
- [Backend Docs](./02-BACKEND-DOCUMENTATION.md)
- [Frontend Docs](./04-FRONTEND-DOCUMENTATION.md)
- [ESP32 Docs](./03-ESP32-DOCUMENTATION.md)
- [Integration Guide](./05-INTEGRATION-GUIDE.md)
- [API Reference](./06-API-REFERENCE.md)
- [Troubleshooting](./08-TROUBLESHOOTING.md)

