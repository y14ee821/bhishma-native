# Troubleshooting Guide

Common issues and solutions for the Bhishma system.

## Table of Contents

1. [Backend Issues](#backend-issues)
2. [Frontend Issues](#frontend-issues)
3. [ESP32 Issues](#esp32-issues)
4. [MQTT Issues](#mqtt-issues)
5. [Integration Issues](#integration-issues)
6. [Authentication Issues](#authentication-issues)
7. [Database Issues](#database-issues)

## Backend Issues

### MongoDB Connection Failed

**Symptoms:**
- Error: "Database not connected"
- Server fails to start

**Solutions:**
1. Check `MONGODB_URI` in `.env`
2. Verify MongoDB is running
3. Check network connectivity
4. Verify credentials
5. Check firewall settings

**Debug:**
```python
# Test connection
from motor.motor_asyncio import AsyncIOMotorClient
client = AsyncIOMotorClient("your-uri")
await client.admin.command('ping')
```

### Google OAuth Not Working

**Symptoms:**
- Error: "Invalid Google token"
- Error: "GOOGLE_CLIENT_ID is not configured"

**Solutions:**
1. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
2. Check OAuth consent screen is configured
3. Verify redirect URIs match
4. Check token hasn't expired
5. Verify API is enabled in Google Cloud Console

### JWT Token Errors

**Symptoms:**
- Error: "Invalid or expired token"
- Error: "Invalid token payload"

**Solutions:**
1. Check `JWT_SECRET_KEY` is set
2. Verify token format
3. Check token expiration
4. Regenerate token if needed
5. Verify token is sent in Authorization header

### CORS Errors

**Symptoms:**
- Error: "CORS policy"
- Requests blocked by browser

**Solutions:**
1. Update CORS origins in `main.py`
2. Verify frontend URL is allowed
3. Check credentials setting
4. Verify preflight requests

## Frontend Issues

### Google Sign-In Not Working

**Symptoms:**
- Error: "webClientId must be defined"
- Error: "redirect_uri_mismatch"
- Error: "Failed to get ID token"

**Solutions:**
1. Check environment variables are set
2. Restart Expo server after `.env` changes
3. Verify Google OAuth credentials
4. Add redirect URIs to Google Console
5. Check browser console for errors

**Common Redirect URIs:**
- `http://localhost:8081`
- `http://localhost:19006`
- `http://localhost:19000`

### API Requests Failing

**Symptoms:**
- Network errors
- 401 Unauthorized
- 500 Server errors

**Solutions:**
1. Verify backend is running
2. Check `EXPO_PUBLIC_API_URL` in `.env`
3. Verify authentication token
4. Check network connectivity
5. Review error messages in console

### MQTT Connection Issues

**Symptoms:**
- MQTT not connecting
- Status updates not received
- Connection drops

**Solutions:**
1. Verify MQTT broker URL
2. Check WebSocket support
3. Verify network connectivity
4. Check firewall settings
5. Test with MQTT client tool

### Devices Not Showing

**Symptoms:**
- Empty device list
- "No devices found" message

**Solutions:**
1. Verify user is authenticated
2. Check devices exist in database
3. Verify `user_id` matches
4. Check API response
5. Create sample devices via UI

### Redux State Issues

**Symptoms:**
- State not updating
- Stale data
- Actions not dispatching

**Solutions:**
1. Check Redux DevTools
2. Verify action creators
3. Check reducer logic
4. Verify middleware
5. Clear AsyncStorage if needed

## ESP32 Issues

### WiFi Connection Failed

**Symptoms:**
- Cannot connect to WiFi
- Connection timeout
- Indicator LED off

**Solutions:**
1. Verify SSID and password in `config.json`
2. Check WiFi signal strength
3. Increase `connectivityTimeout`
4. Verify WiFi credentials
5. Check serial output for errors

**Debug:**
```python
# Check WiFi status
import network
wlan = network.WLAN(network.STA_IF)
print(wlan.isconnected())
print(wlan.ifconfig())
```

### MQTT Connection Failed

**Symptoms:**
- Cannot connect to broker
- Connection errors
- Reconnection loops

**Solutions:**
1. Verify broker hostname and port
2. Check internet connectivity
3. Test broker with MQTT client
4. Check firewall settings
5. Verify broker is accessible

**Test MQTT:**
```bash
mosquitto_sub -h test.mosquitto.org -t test
mosquitto_pub -h test.mosquitto.org -t test -m "hello"
```

### GPIO Not Responding

**Symptoms:**
- Pins not changing state
- Commands ignored
- Wrong pin behavior

**Solutions:**
1. Verify pin numbers in `config.json`
2. Check for pin conflicts
3. Verify pin capabilities
4. Check hardware connections
5. Test pins individually

### Device Resets/Crashes

**Symptoms:**
- Frequent resets
- Memory errors
- Unresponsive device

**Solutions:**
1. Enable garbage collection
2. Reduce logging
3. Optimize code
4. Check memory usage
5. Verify power supply

**Debug:**
```python
import gc
print("Free memory:", gc.mem_free())
gc.collect()
```

## MQTT Issues

### Messages Not Received

**Symptoms:**
- No status updates
- Commands not working
- Silent failures

**Solutions:**
1. Verify subscription topics
2. Check message format
3. Verify QoS settings
4. Test with MQTT client
5. Check broker logs

### Message Format Errors

**Symptoms:**
- Parsing errors
- Invalid format
- Unexpected behavior

**Solutions:**
1. Verify message format:
   - Control: `op1:1-op2:0`
   - Status: `ip1:1-ip2:0`
2. Check topic names match
3. Verify parsing logic
4. Add error handling
5. Log raw messages

### Broker Connection Drops

**Symptoms:**
- Intermittent disconnections
- Reconnection loops
- Timeout errors

**Solutions:**
1. Increase keepalive interval
2. Check network stability
3. Verify broker settings
4. Implement reconnection logic
5. Monitor connection status

## Integration Issues

### End-to-End Not Working

**Symptoms:**
- Control commands don't work
- Status not syncing
- Devices not responding

**Solutions:**
1. Verify all components running
2. Check MQTT topics match
3. Verify device names match
4. Test each component individually
5. Check logs at each step

### Device Name Mismatch

**Symptoms:**
- Device not found
- Wrong device controlled
- Status from wrong device

**Solutions:**
1. Verify device name in database
2. Check MQTT topic matches device name
3. Verify ESP32 config topic
4. Ensure consistency across system
5. Use unique device names

## Authentication Issues

### Login Fails

**Symptoms:**
- Google Sign-In error
- Token not received
- Authentication loop

**Solutions:**
1. Check Google OAuth configuration
2. Verify redirect URIs
3. Check environment variables
4. Review browser console
5. Test OAuth flow step by step

### Token Expired

**Symptoms:**
- 401 Unauthorized
- "Invalid token" errors
- Forced logout

**Solutions:**
1. Token expires after 7 days
2. Re-authenticate user
3. Implement token refresh
4. Check token expiration time
5. Clear stored tokens

### User Not Found

**Symptoms:**
- User creation fails
- User lookup errors
- Database errors

**Solutions:**
1. Check database connection
2. Verify user exists
3. Check user_id format
4. Verify authentication
5. Check database permissions

## Database Issues

### Connection Timeout

**Symptoms:**
- Slow queries
- Timeout errors
- Connection drops

**Solutions:**
1. Check network connectivity
2. Verify connection string
3. Check MongoDB status
4. Increase timeout settings
5. Use connection pooling

### Data Not Persisting

**Symptoms:**
- Data lost on restart
- Changes not saved
- Inconsistent data

**Solutions:**
1. Verify write operations
2. Check error handling
3. Verify transaction logic
4. Check database permissions
5. Review save operations

## Debugging Tips

### Enable Debug Logging

**Backend:**
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Frontend:**
```javascript
console.log('Debug:', data);
```

**ESP32:**
```python
print("Debug:", data)
```

### Check Logs

- Backend: Server console output
- Frontend: Browser console
- ESP32: Serial monitor

### Test Components Individually

1. Test backend API with curl/Postman
2. Test MQTT with mosquitto clients
3. Test ESP32 with serial monitor
4. Test frontend in isolation

## Getting Help

1. Check error messages carefully
2. Review relevant documentation
3. Check GitHub issues
4. Enable debug logging
5. Test with minimal configuration

## Next Steps

- [System Overview](./01-SYSTEM-OVERVIEW.md) - Understand architecture
- [API Reference](./06-API-REFERENCE.md) - Check API docs
- [Integration Guide](./05-INTEGRATION-GUIDE.md) - Verify integration

