# API Reference

Complete API documentation for the Bhishma backend.

## Base URL

```
Development: http://localhost:8000
Production: https://api.yourdomain.com
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer {access_token}
```

## Endpoints

### Authentication

#### POST `/api/auth/google`

Authenticate with Google ID token.

**Request:**
```json
{
  "token": "google-id-token-string"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "picture": "https://lh3.googleusercontent.com/...",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
}
```

**Errors:**
- `400` - Missing token
- `401` - Invalid Google token
- `500` - Server error

---

#### GET `/api/auth/me`

Get current authenticated user.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "picture": "https://lh3.googleusercontent.com/...",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

**Errors:**
- `401` - Invalid or expired token
- `404` - User not found

---

#### POST `/api/auth/verify`

Verify access token validity.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "valid": true,
  "user_id": "507f1f77bcf86cd799439011"
}
```

**Errors:**
- `401` - Invalid or expired token

---

### Devices

All device endpoints require authentication.

#### GET `/api/devices/`

Get all devices for the current user.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
[
  {
    "id": "507f1f77bcf86cd799439012",
    "name": "rao",
    "type": "IE Controller",
    "status": "online",
    "user_id": "507f1f77bcf86cd799439011",
    "metadata": {
      "channelCount": 4
    },
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
]
```

---

#### POST `/api/devices/`

Create a new device.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "rao",
  "type": "IE Controller",
  "status": "online",
  "metadata": {
    "channelCount": 4
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "507f1f77bcf86cd799439012",
  "name": "rao",
  "type": "IE Controller",
  "status": "online",
  "user_id": "507f1f77bcf86cd799439011",
  "metadata": {
    "channelCount": 4
  },
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

**Errors:**
- `400` - Invalid request data
- `401` - Unauthorized

---

#### GET `/api/devices/{device_id}`

Get device by ID.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439012",
  "name": "rao",
  "type": "IE Controller",
  "status": "online",
  "user_id": "507f1f77bcf86cd799439011",
  "metadata": {
    "channelCount": 4
  },
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

**Errors:**
- `400` - Invalid device ID
- `401` - Unauthorized
- `404` - Device not found

---

#### PUT `/api/devices/{device_id}`

Update device.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "updated-name",
  "status": "offline"
}
```

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439012",
  "name": "updated-name",
  "type": "IE Controller",
  "status": "offline",
  "user_id": "507f1f77bcf86cd799439011",
  "metadata": {
    "channelCount": 4
  },
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-02T00:00:00"
}
```

**Errors:**
- `400` - Invalid request
- `401` - Unauthorized
- `404` - Device not found

---

#### DELETE `/api/devices/{device_id}`

Delete device.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:** `204 No Content`

**Errors:**
- `400` - Invalid device ID
- `401` - Unauthorized
- `404` - Device not found

---

### Users

#### GET `/api/users/`

Get all users.

**Response:** `200 OK`
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "picture": "https://...",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
]
```

---

#### GET `/api/users/{user_id}`

Get user by ID.

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "picture": "https://...",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

---

#### POST `/api/users/`

Create user (for non-OAuth users).

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure-password"
}
```

**Response:** `201 Created`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

---

#### PUT `/api/users/{user_id}`

Update user.

**Request:**
```json
{
  "name": "Updated Name"
}
```

**Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Updated Name",
  "email": "john@example.com",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-02T00:00:00"
}
```

---

#### DELETE `/api/users/{user_id}`

Delete user.

**Response:** `204 No Content`

---

### Health Check

#### GET `/`

API information.

**Response:** `200 OK`
```json
{
  "message": "Bhishma API is running",
  "version": "1.0.0"
}
```

---

#### GET `/health`

Health check.

**Response:** `200 OK`
```json
{
  "status": "healthy"
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "detail": "Error message description"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Currently not implemented. Consider adding in production.

## Pagination

Not implemented. All endpoints return all results.

## Filtering & Sorting

Not implemented. Can be added as needed.

## Interactive Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Examples

### Complete Authentication Flow

```bash
# 1. Login with Google token
curl -X POST http://localhost:8000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token": "google-id-token"}'

# Response includes access_token

# 2. Get current user
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer {access_token}"

# 3. Get devices
curl http://localhost:8000/api/devices/ \
  -H "Authorization: Bearer {access_token}"

# 4. Create device
curl -X POST http://localhost:8000/api/devices/ \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "rao",
    "type": "IE Controller",
    "status": "online",
    "metadata": {"channelCount": 4}
  }'
```

## Next Steps

- [Deployment Guide](./07-DEPLOYMENT-GUIDE.md) - Production setup
- [Troubleshooting](./08-TROUBLESHOOTING.md) - Common issues

