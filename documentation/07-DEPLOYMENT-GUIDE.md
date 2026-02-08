# Deployment Guide

Complete guide for deploying Bhishma to production.

## Table of Contents

1. [Overview](#overview)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [ESP32 Deployment](#esp32-deployment)
5. [Infrastructure Setup](#infrastructure-setup)
6. [Security Checklist](#security-checklist)
7. [Monitoring](#monitoring)
8. [Backup & Recovery](#backup--recovery)

## Overview

This guide covers production deployment for all components:
- Backend API server
- Frontend mobile/web app
- ESP32 firmware
- Supporting infrastructure

## Backend Deployment

### Option 1: Cloud Platform (Recommended)

#### Heroku

1. **Install Heroku CLI**
   ```bash
   heroku login
   ```

2. **Create App**
   ```bash
   heroku create bhishma-api
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI=your-mongodb-uri
   heroku config:set JWT_SECRET_KEY=your-secret-key
   heroku config:set GOOGLE_CLIENT_ID=your-client-id
   heroku config:set GOOGLE_CLIENT_SECRET=your-secret
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

#### AWS/GCP/Azure

Similar process with platform-specific configurations.

### Option 2: VPS/Server

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Python
   sudo apt install python3.11 python3-pip
   
   # Install dependencies
   pip3 install -r requirements.txt
   ```

2. **Create Systemd Service**

   `/etc/systemd/system/bhishma-api.service`:
   ```ini
   [Unit]
   Description=Bhishma API Server
   After=network.target
   
   [Service]
   User=www-data
   WorkingDirectory=/opt/bhishma-backend
   Environment="PATH=/opt/bhishma-backend/venv/bin"
   ExecStart=/opt/bhishma-backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
   Restart=always
   
   [Install]
   WantedBy=multi-user.target
   ```

3. **Start Service**
   ```bash
   sudo systemctl enable bhishma-api
   sudo systemctl start bhishma-api
   ```

4. **Nginx Reverse Proxy**

   `/etc/nginx/sites-available/bhishma-api`:
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Environment Variables (Production)

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
DATABASE_NAME=bhishma_db
JWT_SECRET_KEY=very-secure-random-string-here
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-secret
```

## Frontend Deployment

### Web Deployment

#### Option 1: Expo Hosting

```bash
expo build:web
expo publish
```

#### Option 2: Static Hosting

1. **Build Web App**
   ```bash
   expo build:web
   ```

2. **Deploy to Netlify/Vercel**
   ```bash
   # Netlify
   netlify deploy --prod --dir web-build
   
   # Vercel
   vercel --prod
   ```

### Mobile App Deployment

#### Android

1. **Generate Keystore**
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore bhishma.keystore -alias bhishma -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Build APK**
   ```bash
   eas build --platform android --profile production
   ```

3. **Submit to Play Store**

#### iOS

1. **Configure App Store Connect**
2. **Build**
   ```bash
   eas build --platform ios --profile production
   ```
3. **Submit to App Store**

### Environment Variables (Production)

Update `.env`:
```env
EXPO_PUBLIC_API_URL=https://api.yourdomain.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID=production-client-id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=production-web-client-id
```

## ESP32 Deployment

### Production Configuration

1. **Update config.json**
   ```json
   {
     "broker": "mqtt.yourdomain.com",
     "port": 8883,
     "topic": "device-unique-name",
     "ssid": "ProductionWiFi",
     "password": "SecurePassword"
   }
   ```

2. **Use Secure MQTT (TLS)**
   - Port: 8883
   - Enable TLS in MQTT client
   - Use certificates

3. **Deploy Firmware**
   - Upload all files
   - Verify configuration
   - Test connectivity

## Infrastructure Setup

### MongoDB

#### MongoDB Atlas (Recommended)

1. Create cluster
2. Configure network access
3. Create database user
4. Get connection string
5. Enable backups

#### Self-Hosted

1. Install MongoDB
2. Configure authentication
3. Set up replication
4. Enable backups

### MQTT Broker

#### Option 1: Cloud MQTT

- HiveMQ Cloud
- AWS IoT Core
- Azure IoT Hub
- Google Cloud IoT

#### Option 2: Self-Hosted Mosquitto

1. **Install**
   ```bash
   sudo apt install mosquitto mosquitto-clients
   ```

2. **Configure** (`/etc/mosquitto/mosquitto.conf`):
   ```
   listener 1883
   listener 8883
   protocol mqtt
   allow_anonymous false
   password_file /etc/mosquitto/passwd
   ```

3. **Create Users**
   ```bash
   mosquitto_passwd -c /etc/mosquitto/passwd username
   ```

4. **Start Service**
   ```bash
   sudo systemctl enable mosquitto
   sudo systemctl start mosquitto
   ```

### SSL/TLS Certificates

1. **Obtain Certificates** (Let's Encrypt)
   ```bash
   sudo certbot certonly --standalone -d api.yourdomain.com
   ```

2. **Configure Nginx**
   ```nginx
   server {
       listen 443 ssl;
       ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
       
       location / {
           proxy_pass http://localhost:8000;
       }
   }
   ```

## Security Checklist

### Backend

- [ ] Use HTTPS only
- [ ] Set secure `JWT_SECRET_KEY`
- [ ] Enable CORS for specific origins only
- [ ] Use environment variables (not hardcoded)
- [ ] Enable MongoDB authentication
- [ ] Use strong database passwords
- [ ] Implement rate limiting
- [ ] Enable request logging
- [ ] Set up firewall rules
- [ ] Regular security updates

### Frontend

- [ ] Use HTTPS for API calls
- [ ] Secure token storage
- [ ] Validate all inputs
- [ ] Use secure MQTT (WSS)
- [ ] Implement error handling
- [ ] Remove debug logs in production

### ESP32

- [ ] Use secure WiFi (WPA2/WPA3)
- [ ] Use MQTT over TLS
- [ ] Implement authentication
- [ ] Secure configuration storage
- [ ] Regular firmware updates

### Infrastructure

- [ ] Firewall configuration
- [ ] DDoS protection
- [ ] Regular backups
- [ ] Monitoring and alerts
- [ ] Access control
- [ ] SSL/TLS certificates

## Monitoring

### Application Monitoring

#### Backend

- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry
- **Logging**: CloudWatch, Loggly
- **Metrics**: Prometheus, Grafana

#### Frontend

- **Analytics**: Google Analytics, Mixpanel
- **Error Tracking**: Sentry
- **Performance**: New Relic

### Infrastructure Monitoring

- **Server**: CPU, Memory, Disk
- **Database**: Connection pool, Query performance
- **MQTT**: Message throughput, Connection count
- **Network**: Bandwidth, Latency

## Backup & Recovery

### Database Backups

#### MongoDB Atlas

- Automatic daily backups
- Point-in-time recovery
- Manual snapshots

#### Self-Hosted

```bash
# Backup
mongodump --uri="mongodb://..." --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://..." /backup/20240101
```

### Configuration Backups

- Backup `.env` files (securely)
- Backup ESP32 configurations
- Version control for code

### Recovery Procedures

1. **Database Recovery**
   - Restore from backup
   - Verify data integrity
   - Test application

2. **Application Recovery**
   - Redeploy from version control
   - Restore environment variables
   - Verify functionality

## Performance Optimization

### Backend

- Use connection pooling
- Implement caching (Redis)
- Optimize database queries
- Use CDN for static assets
- Enable compression

### Frontend

- Code splitting
- Image optimization
- Lazy loading
- Cache API responses
- Minimize bundle size

## Scaling

### Horizontal Scaling

- Multiple backend instances
- Load balancer
- Database replication
- MQTT cluster

### Vertical Scaling

- Increase server resources
- Optimize database indexes
- Cache frequently accessed data

## Next Steps

- [Troubleshooting](./08-TROUBLESHOOTING.md) - Common issues
- [System Overview](./01-SYSTEM-OVERVIEW.md) - Architecture

