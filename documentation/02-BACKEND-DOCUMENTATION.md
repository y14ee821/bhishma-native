# Backend Documentation (FastAPI)

Complete documentation for the Bhishma FastAPI backend server.

## Table of Contents

1. [Overview](#overview)
2. [Setup & Installation](#setup--installation)
3. [Project Structure](#project-structure)
4. [Configuration](#configuration)
5. [API Endpoints](#api-endpoints)
6. [Authentication](#authentication)
7. [Database Models](#database-models)
8. [Running the Server](#running-the-server)
9. [Testing](#testing)
10. [Deployment](#deployment)

## Overview

The Bhishma backend is a FastAPI-based REST API server that provides:
- User authentication via Google OAuth
- Device management
- JWT token generation and validation
- MongoDB data persistence

**Technology Stack:**
- FastAPI 0.115.0
- MongoDB with Motor (async driver)
- Pydantic for data validation
- Google OAuth for authentication
- PyJWT for token management

## Setup & Installation

### Prerequisites

- Python 3.11 or higher
- MongoDB instance (local or Atlas)
- Google Cloud Platform account (for OAuth)

### Step 1: Clone and Navigate

```bash
cd bhishma-backend
```

### Step 2: Create Virtual Environment

```bash
# Windows
python -m venv bhishmaenv311
bhishmaenv311\Scripts\activate

# Linux/Mac
python3 -m venv bhishmaenv311
source bhishmaenv311/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

**Dependencies:**
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `motor` - Async MongoDB driver
- `pymongo` - MongoDB driver
- `pydantic` - Data validation
- `python-dotenv` - Environment variables
- `google-auth` - Google OAuth
- `PyJWT` - JWT tokens
- `python-jose` - JWT utilities

### Step 4: Configure Environment

Create a `.env` file from `env.example`:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=bhishma_db

# JWT Configuration
JWT_SECRET_KEY=your-secure-random-secret-key-change-in-production

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Step 5: Run the Server

```bash
uvicorn main:app --reload
```

Server will start at `http://localhost:8000`

## Project Structure

```
bhishma-backend/
├── app/
│   ├── __init__.py
│   ├── database.py              # MongoDB connection
│   ├── models/                  # Pydantic models
│   │   ├── __init__.py
│   │   ├── user.py              # User models
│   │   └── device.py            # Device models
│   ├── routes/                  # API routes
│   │   ├── __init__.py
│   │   ├── auth.py              # Authentication routes
│   │   ├── users.py             # User management routes
│   │   └── devices.py            # Device management routes
│   └── services/                # Business logic
│       ├── __init__.py
│       └── auth_service.py      # Authentication service
├── main.py                      # FastAPI app entry point
├── requirements.txt             # Python dependencies
├── env.example                 # Environment variables template
└── README.md
```

## Configuration

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | `mongodb+srv://...` |
| `DATABASE_NAME` | Database name | No | `bhishma_db` (default) |
| `JWT_SECRET_KEY` | Secret key for JWT tokens | Yes | Random string |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Yes | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Yes | `GOCSPX-xxx` |

### MongoDB Setup

#### Option 1: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Add to `.env` as `MONGODB_URI`

#### Option 2: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017`
4. Add to `.env` as `MONGODB_URI`

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Copy Client ID and Secret to `.env`

## API Endpoints

### Base URL
```
http://localhost:8000
```

### Authentication Endpoints

#### POST `/api/auth/google`
Login with Google ID token.

**Request:**
```json
{
  "token": "google-id-token-here"
}
```

**Response:**
```json
{
  "access_token": "jwt-token-here",
  "token_type": "bearer",
  "user": {
    "id": "user-id",
    "name": "User Name",
    "email": "user@example.com",
    "picture": "https://...",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
}
```

#### GET `/api/auth/me`
Get current authenticated user.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "id": "user-id",
  "name": "User Name",
  "email": "user@example.com",
  "picture": "https://...",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

#### POST `/api/auth/verify`
Verify access token validity.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "valid": true,
  "user_id": "user-id"
}
```

### Device Endpoints

All device endpoints require authentication.

#### GET `/api/devices/`
Get all devices for the current user.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
[
  {
    "id": "device-id",
    "name": "Device Name",
    "type": "IE Controller",
    "status": "online",
    "user_id": "user-id",
    "metadata": {
      "channelCount": 4
    },
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
]
```

#### POST `/api/devices/`
Create a new device.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "name": "Device Name",
  "type": "IE Controller",
  "status": "online",
  "metadata": {
    "channelCount": 4
  }
}
```

**Response:**
```json
{
  "id": "device-id",
  "name": "Device Name",
  "type": "IE Controller",
  "status": "online",
  "user_id": "user-id",
  "metadata": {
    "channelCount": 4
  },
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

#### GET `/api/devices/{device_id}`
Get device by ID.

**Headers:**
```
Authorization: Bearer {access_token}
```

#### PUT `/api/devices/{device_id}`
Update device.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "name": "Updated Name",
  "status": "offline"
}
```

#### DELETE `/api/devices/{device_id}`
Delete device.

**Headers:**
```
Authorization: Bearer {access_token}
```

### User Endpoints

#### GET `/api/users/`
Get all users (admin only in production).

#### GET `/api/users/{user_id}`
Get user by ID.

#### POST `/api/users/`
Create user (for non-OAuth users).

#### PUT `/api/users/{user_id}`
Update user.

#### DELETE `/api/users/{user_id}`
Delete user.

### Health Check

#### GET `/`
API information.

**Response:**
```json
{
  "message": "Bhishma API is running",
  "version": "1.0.0"
}
```

#### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy"
}
```

## Authentication

### JWT Token Structure

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "exp": 1234567890,
  "iat": 1234567890
}
```

### Token Usage

Include the token in the `Authorization` header:

```
Authorization: Bearer {access_token}
```

### Token Expiration

- Default: 7 days
- Configurable in `app/services/auth_service.py`

## Database Models

### User Model

```python
{
  "name": str,
  "email": EmailStr,
  "password": Optional[str],  # Optional for OAuth users
  "google_id": Optional[str],
  "picture": Optional[str],
  "created_at": datetime,
  "updated_at": datetime
}
```

### Device Model

```python
{
  "name": str,
  "type": str,
  "status": str,  # "online" | "offline"
  "user_id": str,
  "metadata": {
    "channelCount": int
  },
  "created_at": datetime,
  "updated_at": datetime
}
```

## Running the Server

### Development Mode

```bash
uvicorn main:app --reload
```

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### With Custom Configuration

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Testing

### Manual Testing with curl

```bash
# Health check
curl http://localhost:8000/health

# Login (replace with actual Google token)
curl -X POST http://localhost:8000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token": "google-id-token"}'

# Get devices (replace with actual token)
curl http://localhost:8000/api/devices/ \
  -H "Authorization: Bearer {access_token}"
```

## Deployment

### Production Checklist

- [ ] Set secure `JWT_SECRET_KEY`
- [ ] Use HTTPS
- [ ] Configure CORS properly
- [ ] Set up MongoDB with authentication
- [ ] Use environment variables (not hardcoded)
- [ ] Enable logging
- [ ] Set up monitoring
- [ ] Configure rate limiting
- [ ] Use production-grade ASGI server (Gunicorn + Uvicorn)

### Docker Deployment (Optional)

Create `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check `MONGODB_URI` in `.env`
   - Verify MongoDB is running
   - Check network connectivity

2. **Google OAuth Error**
   - Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   - Check OAuth consent screen is configured
   - Verify redirect URIs match

3. **JWT Token Error**
   - Check `JWT_SECRET_KEY` is set
   - Verify token hasn't expired
   - Check token format

## Next Steps

- [ESP32 Documentation](./03-ESP32-DOCUMENTATION.md) - Set up IoT devices
- [Frontend Documentation](./04-FRONTEND-DOCUMENTATION.md) - Set up mobile app
- [Integration Guide](./05-INTEGRATION-GUIDE.md) - Connect all components

