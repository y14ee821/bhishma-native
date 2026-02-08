# ESP32 Documentation (MicroPython)

Complete documentation for the Bhishma ESP32 firmware.

## Table of Contents

1. [Overview](#overview)
2. [Hardware Requirements](#hardware-requirements)
3. [Software Setup](#software-setup)
4. [Project Structure](#project-structure)
5. [Configuration](#configuration)
6. [Pin Mapping](#pin-mapping)
7. [MQTT Communication](#mqtt-communication)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

## Overview

The ESP32 firmware enables IoT devices to:
- Connect to WiFi networks
- Communicate via MQTT protocol
- Control GPIO pins (outputs)
- Read GPIO pins (inputs)
- Report device status

**Technology Stack:**
- MicroPython
- MQTT Client (custom implementation)
- WiFi (network module)
- GPIO (machine.Pin)

## Hardware Requirements

### Required Components

- ESP32 development board (ESP32-WROOM-32 or compatible)
- USB cable for programming
- Power supply (5V via USB or external)
- Optional: Relay modules for high-power control
- Optional: Status LED

### GPIO Pins

The firmware supports:
- **Input pins**: Read sensor/switch states (ip1, ip2, ip3, ip4)
- **Output pins**: Control devices/relays (op1, op2, op3, op4)
- **Connection indicator**: LED pin (configurable)

## Software Setup

### Step 1: Install MicroPython

1. Download MicroPython firmware for ESP32:
   ```
   https://micropython.org/download/esp32/
   ```

2. Install esptool:
   ```bash
   pip install esptool
   ```

3. Erase flash:
   ```bash
   esptool.py --port COM3 erase_flash
   ```

4. Flash firmware:
   ```bash
   esptool.py --chip esp32 --port COM3 write_flash -z 0x1000 esp32-xxx.bin
   ```

### Step 2: Install Required Files

Copy all files from `bhishma-esp/` to ESP32:

```bash
# Using rshell (recommended)
rshell -p COM3
> cp mqtt_handle.py /pyboard/
> cp mqtt_custom.py /pyboard/
> cp utils.py /pyboard/
> cp wifiConnect.py /pyboard/
> cp boot.py /pyboard/
> cp main.py /pyboard/
> cp config.json /pyboard/
```

Or use Thonny IDE:
1. Open Thonny
2. Connect to ESP32
3. Upload all files

### Step 3: Configure Device

Edit `config.json` on ESP32 with your settings (see Configuration section).

## Project Structure

```
bhishma-esp/
├── main.py              # Entry point
├── boot.py              # Boot configuration
├── mqtt_handle.py       # MQTT operations handler
├── mqtt_custom.py       # Custom MQTT client
├── wifiConnect.py       # WiFi connection
├── utils.py             # Utility functions
├── config.json          # Device configuration
├── config_hyd.json      # Alternative config (Hyderabad)
├── config_kkd.json      # Alternative config (Kakinada)
└── mosquitto.conf       # MQTT broker config (reference)
```

## Configuration

### config.json Structure

```json
{
  "broker": "test.mosquitto.org",
  "port": 1883,
  "connectionType": "publish",
  "topic": "rao",
  "client": "lohit-automationClient",
  "ssid": "YourWiFiSSID",
  "password": "YourWiFiPassword",
  "resetTimeout": 5,
  "totalInputs": 4,
  "ip1": 14,
  "ip2": 16,
  "ip3": "",
  "ip4": "",
  "totalOutputs": 4,
  "op1": 4,
  "op2": 5,
  "op3": 12,
  "op4": 13,
  "connectionIndicatorPin": 2,
  "connectivityTimeout": 10,
  "reconnectTimeout": 5,
  "loads": 4
}
```

### Configuration Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `broker` | MQTT broker hostname | `test.mosquitto.org` |
| `port` | MQTT broker port | `1883` |
| `topic` | MQTT topic name (device name) | `rao` |
| `client` | MQTT client ID prefix | `lohit-automationClient` |
| `ssid` | WiFi network name | `YourWiFiSSID` |
| `password` | WiFi password | `YourWiFiPassword` |
| `totalInputs` | Number of input pins | `4` |
| `ip1-ip4` | GPIO pin numbers for inputs | `14`, `16`, `""`, `""` |
| `totalOutputs` | Number of output pins | `4` |
| `op1-op4` | GPIO pin numbers for outputs | `4`, `5`, `12`, `13` |
| `connectionIndicatorPin` | LED pin for connection status | `2` |
| `connectivityTimeout` | WiFi connection timeout (seconds) | `10` |
| `reconnectTimeout` | Reconnection delay (seconds) | `5` |

## Pin Mapping

### Input Pins (ip1-ip4)

Read sensor states or switch positions:
- Configured as `Pin.IN`
- Read values: `0` (LOW) or `1` (HIGH)
- Used for status reporting

### Output Pins (op1-op4)

Control devices/relays:
- Configured as `Pin.OUT`
- Set values: `0` (OFF) or `1` (ON)
- Controlled via MQTT commands

### Connection Indicator

- Pin configured in `connectionIndicatorPin`
- `ON` = WiFi connected
- `OFF` = WiFi disconnected

## MQTT Communication

### Topic Structure

```
{device_name}              # Control commands (subscribe)
{device_name}/status       # Status updates (publish)
```

Example:
- Device name: `rao`
- Control topic: `rao`
- Status topic: `rao/status`

### Message Formats

#### Control Command (Received)

Format: `op1:1-op2:0-op3:1-op4:0`

- `op1:1` = Turn output 1 ON
- `op2:0` = Turn output 2 OFF
- Multiple commands separated by `-`

Example:
```
op1:1-op2:1-op3:0-op4:0
```

#### Status Update (Published)

Format: `ip1:1-ip2:0-ip3:1-ip4:0`

- Published to `{device_name}/status`
- Sent every 1 second
- Maps output states to input format

Example:
```
ip1:1-ip2:1-ip3:0-ip4:0
```

### MQTT Flow

1. **Device Startup**:
   - Connect to WiFi
   - Connect to MQTT broker
   - Subscribe to control topic: `{device_name}`

2. **Receiving Commands**:
   - Listen on control topic
   - Parse command: `op1:1-op2:0`
   - Update GPIO pins
   - Update state cache

3. **Publishing Status**:
   - Every 1 second
   - Read output states from cache
   - Format as: `ip1:1-ip2:0`
   - Publish to `{device_name}/status`

## Code Flow

### main.py

```python
1. Detach UART REPL (optional)
2. Import modules
3. Connect to WiFi
4. Load configuration
5. Initialize MQTT operations
6. Start executor loop
```

### mqtt_handle.py

```python
class mqttOperations:
  - __init__(): Initialize pins from config
  - connect_and_subscribe(): Connect to MQTT
  - executor(): Main loop
  - espOutputControl(): Handle commands
  - _formatOutputStatesAsIP(): Format status
```

### wifiConnect.py

```python
def connect():
  - Activate WiFi
  - Connect to SSID
  - Wait for connection
  - Set indicator pin
  - Return connection status
```

## Deployment

### Step 1: Prepare Configuration

1. Copy `config.json` template
2. Update WiFi credentials
3. Set MQTT broker details
4. Configure GPIO pins
5. Set device name (topic)

### Step 2: Upload Files

Using rshell:
```bash
rshell -p COM3
> cp *.py /pyboard/
> cp config.json /pyboard/
```

### Step 3: Test Connection

1. Power on ESP32
2. Check serial output for:
   - WiFi connection status
   - MQTT connection status
   - Topic subscription confirmation

### Step 4: Verify MQTT

Use MQTT client to test:

**Subscribe to status:**
```bash
mosquitto_sub -h test.mosquitto.org -t rao/status
```

**Publish command:**
```bash
mosquitto_pub -h test.mosquitto.org -t rao -m "op1:1-op2:0"
```

## Troubleshooting

### WiFi Connection Issues

**Problem**: Cannot connect to WiFi

**Solutions**:
- Verify SSID and password in `config.json`
- Check WiFi signal strength
- Increase `connectivityTimeout`
- Check serial output for error messages

### MQTT Connection Issues

**Problem**: Cannot connect to MQTT broker

**Solutions**:
- Verify broker hostname and port
- Check internet connectivity
- Test broker with MQTT client
- Check firewall settings

### GPIO Issues

**Problem**: Pins not responding

**Solutions**:
- Verify pin numbers in config
- Check for pin conflicts (input/output)
- Verify pin capabilities
- Check hardware connections

### Memory Issues

**Problem**: Device crashes or resets

**Solutions**:
- Enable garbage collection (`gc.collect()`)
- Reduce logging
- Optimize code
- Check for memory leaks

## Serial Output Examples

### Successful Startup

```
Wifi Connection is good!
network config: ('192.168.1.100', '255.255.255.0', '192.168.1.1', '8.8.8.8')
Inputs initialized: {'ip1': Pin(14, mode=IN), 'ip2': Pin(16, mode=IN)}
Outputs initialized: {'op1': Pin(4, mode=OUT), 'op2': Pin(5, mode=OUT), ...}
Connected to test.mosquitto.org MQTT broker, subscribed to rao topic
```

### Error Output

```
Issue with wifi, please check.
Failed to connect to MQTT broker. Reconnecting...
sleeping For 5 seconds...
```

## Best Practices

1. **Pin Configuration**:
   - Avoid pin conflicts
   - Use appropriate pin types
   - Document pin assignments

2. **Error Handling**:
   - Implement reconnection logic
   - Add timeout handling
   - Log errors for debugging

3. **Power Management**:
   - Use appropriate power supply
   - Consider deep sleep for battery
   - Monitor power consumption

4. **Security**:
   - Use secure MQTT (TLS) in production
   - Change default passwords
   - Implement authentication

## Next Steps

- [Backend Documentation](./02-BACKEND-DOCUMENTATION.md) - API server setup
- [Frontend Documentation](./04-FRONTEND-DOCUMENTATION.md) - Mobile app setup
- [Integration Guide](./05-INTEGRATION-GUIDE.md) - Connect all components

