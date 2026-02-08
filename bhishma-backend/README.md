# Bhishma Backend API

A modular and generic FastAPI backend with MongoDB for the Bhishma Native App.

## Project Structure

```
bhishma-backend/
├── app/
│   ├── __init__.py
│   ├── database.py          # MongoDB connection
│   ├── models/              # Pydantic models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── device.py
│   └── routes/              # API routes
│       ├── __init__.py
│       ├── users.py
│       └── devices.py
├── main.py                  # FastAPI app entry point
├── requirements.txt         # Python dependencies
├── .env.example            # Environment variables template
└── README.md
```

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   DATABASE_NAME=bhishma_db
   ```

3. **Run the server:**
   ```bash
   uvicorn main:app --reload
   ```

## API Endpoints

### Users

- `POST /api/users` - Create user
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Devices

- `POST /api/devices` - Create device
- `GET /api/devices` - Get all devices (optional: `?user_id=xxx`)
- `GET /api/devices/{id}` - Get device by ID
- `PUT /api/devices/{id}` - Update device
- `DELETE /api/devices/{id}` - Delete device

### Health Check

- `GET /` - API info
- `GET /health` - Health check

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Features

- ✅ Modular structure (easy to extend)
- ✅ Generic CRUD operations
- ✅ MongoDB integration with Motor (async)
- ✅ Pydantic models for validation
- ✅ CORS enabled for React Native
- ✅ Error handling
- ✅ Auto-generated API documentation

