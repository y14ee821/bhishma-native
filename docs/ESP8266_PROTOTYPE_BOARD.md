# ESP8266 Generic Prototype Board - Soldering Reference

## Board Overview

A general-purpose output board using **NodeMCU ESP8266** with **8 output channels**
connected to an **external relay module** (4CH/8CH). The prototype board only carries
the ESP8266 and signal pin headers -- no transistor drivers needed.

```
┌────────────────────────────────────────────────────────┐
│                 ESP8266 PROTOTYPE BOARD                 │
│                                                        │
│  ┌────────────┐                                        │
│  │ 5V DC IN   │  USB / Barrel Jack                     │
│  │ (to NodeMCU│                                        │
│  │  via USB)  │                                        │
│  └────────────┘                                        │
│                                                        │
│  ┌───────────────────────────────┐    ┌──────────────┐ │
│  │       NodeMCU ESP8266        │    │  PIN HEADER   │ │
│  │       (socketed)             │    │  (to Relay    │ │
│  │                              │    │   Module)     │ │
│  │  D1(GPIO5)  ─────────────────┼───►│ IN1          │ │
│  │  D2(GPIO4)  ─────────────────┼───►│ IN2          │ │
│  │  D5(GPIO14) ─────────────────┼───►│ IN3          │ │
│  │  D6(GPIO12) ─────────────────┼───►│ IN4          │ │
│  │  D7(GPIO13) ─────────────────┼───►│ IN5          │ │
│  │  D0(GPIO16) ─────────────────┼───►│ IN6          │ │
│  │  D3(GPIO0)  ─────────────────┼───►│ IN7          │ │
│  │  D4(GPIO2)  ─────────────────┼───►│ IN8          │ │
│  │  GND ────────────────────────┼───►│ GND          │ │
│  │                              │    │              │ │
│  │  TX(GPIO1)  ── [Debug Hdr]   │    │  VCC ◄── 5V  │ │
│  │  RX(GPIO3)  ── [Debug Hdr]   │    │  (from ext.  │ │
│  │                              │    │   supply)    │ │
│  └───────────────────────────────┘    └──────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘

           ┌──────────────────────────────┐
           │   EXTERNAL RELAY MODULE      │
           │   (separate board)           │
           │                              │
           │   VCC ◄── 5V (own supply)    │
           │   GND ◄── Common GND         │
           │   IN1..IN8 ◄── Signal wires  │
           │                              │
           │   Relay modules have their   │
           │   own drivers, LEDs, and     │
           │   flyback diodes built-in.   │
           └──────────────────────────────┘
```

---

## Channel Mapping

| Channel | GPIO   | NodeMCU | Relay Module Pin | Safety Level | Boot State |
|---------|--------|---------|------------------|--------------|------------|
| CH1     | GPIO5  | D1      | IN1              | FULLY SAFE   | No issue   |
| CH2     | GPIO4  | D2      | IN2              | FULLY SAFE   | No issue   |
| CH3     | GPIO14 | D5      | IN3              | FULLY SAFE   | No issue   |
| CH4     | GPIO12 | D6      | IN4              | FULLY SAFE   | No issue   |
| CH5     | GPIO13 | D7      | IN5              | FULLY SAFE   | No issue   |
| CH6     | GPIO16 | D0      | IN6              | SAFE*        | No issue   |
| CH7     | GPIO0  | D3      | IN7              | SAFE**       | Boots HIGH |
| CH8     | GPIO2  | D4      | IN8              | SAFE**       | Boots HIGH |

> *GPIO16: No PWM support, no interrupts. Don't use if you need deep sleep.
> **GPIO0/GPIO2: Boot HIGH, which means relay stays OFF at boot on
> active-LOW modules (most common modules). Actually safe for relay use!

### Active-LOW Module Behavior at Boot

Most relay modules (the blue ones with optocouplers) are **active-LOW**:
- HIGH signal = relay OFF
- LOW signal = relay ON

This works in your favor:

| GPIO | Boots As | Active-LOW Relay At Boot | Safe? |
|------|----------|--------------------------|-------|
| GPIO5, 4, 14, 12, 13 | Undefined (LOW after init) | OFF after code sets HIGH | YES |
| GPIO16 | Undefined | OFF after code sets HIGH | YES |
| GPIO0  | HIGH | OFF (HIGH = relay off) | YES |
| GPIO2  | HIGH | OFF (HIGH = relay off) | YES |
| GPIO15 (NOT USED) | LOW | ON (danger!) | NO - excluded |

**All 8 channels are safe with active-LOW relay modules.**

---

## Wiring: ESP8266 to Relay Module

Only **10 wires** needed between your prototype board and the relay module:

```
ESP8266 Board                    Relay Module
─────────────                    ────────────
D1  (GPIO5)  ──── wire ────────► IN1
D2  (GPIO4)  ──── wire ────────► IN2
D5  (GPIO14) ──── wire ────────► IN3
D6  (GPIO12) ──── wire ────────► IN4
D7  (GPIO13) ──── wire ────────► IN5
D0  (GPIO16) ──── wire ────────► IN6
D3  (GPIO0)  ──── wire ────────► IN7
D4  (GPIO2)  ──── wire ────────► IN8
GND          ──── wire ────────► GND
                                 VCC ◄── 5V (from relay's own supply)
```

### Power Wiring (Two Options)

**Option A: Shared Power (Simple, OK for up to 4 relays)**
```
5V USB/Adapter ──► NodeMCU VIN ──► Also feeds Relay Module VCC
                   GND ──────────► Common GND
```

**Option B: Separate Power (Recommended for 5-8 relays)**
```
5V 1A Adapter ───► NodeMCU (via USB or VIN)
5V 2A Adapter ───► Relay Module VCC
                   GND ──── tied together (IMPORTANT: common ground!)
```

> Option B is better because relay coil switching causes voltage dips
> that can reset the ESP8266 if sharing the same supply.

---

## Power Budget

| Component                | Current Draw    |
|--------------------------|-----------------|
| ESP8266 (WiFi active)    | ~80mA peak      |
| Relay module (per relay) | ~70-90mA        |

### With 5V 1A Supply (Shared)
- ESP (80mA) + 4 relays (360mA) = **440mA** -- works fine
- ESP (80mA) + 8 relays (720mA) = **800mA** -- tight, but possible

### With Separate Supplies (Recommended)
- **5V 1A** for NodeMCU alone -- more than enough
- **5V 1A** for relay module (up to 8 relays) -- sufficient
- Just make sure **GND is shared** between both supplies

---

## Prototype Board Components (Simplified BOM)

Since the relay module handles all the driver electronics, your prototype
board is very simple:

| # | Component                   | Qty | Notes                           |
|---|------------------------------|-----|---------------------------------|
| 1 | NodeMCU ESP8266 V3          | 1   | Or Wemos D1 Mini                |
| 2 | Female pin headers (15-pin) | 2   | To socket the NodeMCU           |
| 3 | Male pin header (10-pin)    | 1   | Output connector to relay module|
| 4 | Perfboard (small, ~7x5cm)   | 1   | Just for the ESP + headers      |
| 5 | Hookup wire / Dupont cables | 10  | Signal + GND to relay module    |
| 6 | 4CH or 8CH Relay Module     | 1   | External, with optocouplers     |
| 7 | 100μF 25V electrolytic cap  | 1   | Optional, near NodeMCU VIN      |

No transistors, no resistors, no flyback diodes needed!

---

## Physical Layout (Top View)

```
    ◄───── 7cm ─────►

    ┌─────────────────────┐  ▲
    │                     │  │
    │  [USB Port]         │  │
    │                     │  │
    │  ┌───────────────┐  │  │
    │  │   NodeMCU     │  │  │
    │  │  (socketed)   │  │  5cm
    │  │               │  │  │
    │  └───────────────┘  │  │
    │                     │  │
    │  [10-pin header]    │  │
    │  OUT to Relay Module│  │
    │                     │  ▼
    └─────────────────────┘

    Wires go from 10-pin header ───► Relay Module (separate board)
```

---

## Soldering Checklist

### Step 1: Headers
- [ ] Solder 2 rows of female headers (15-pin each) for NodeMCU socket
- [ ] Solder 10-pin male header for output connector
- [ ] Test: Insert NodeMCU, verify it sits firmly

### Step 2: Wiring
- [ ] Wire D1 (GPIO5) to output header pin 1
- [ ] Wire D2 (GPIO4) to output header pin 2
- [ ] Wire D5 (GPIO14) to output header pin 3
- [ ] Wire D6 (GPIO12) to output header pin 4
- [ ] Wire D7 (GPIO13) to output header pin 5
- [ ] Wire D0 (GPIO16) to output header pin 6
- [ ] Wire D3 (GPIO0) to output header pin 7
- [ ] Wire D4 (GPIO2) to output header pin 8
- [ ] Wire GND to output header pin 9
- [ ] Wire 5V/VIN to output header pin 10 (if using shared power)

### Step 3: Connect Relay Module
- [ ] Connect output header to relay module using Dupont wires
- [ ] Connect GND between ESP board and relay module
- [ ] Power the relay module (shared or separate supply)
- [ ] Upload test sketch and verify all channels

---

## Test Sketch

```cpp
// ESP8266 Prototype Board - Relay Module Test
// Most relay modules are ACTIVE-LOW (LOW = relay ON, HIGH = relay OFF)

#define ACTIVE_LOW true  // Set to false if your relay module is active-HIGH

const int channels[] = {5, 4, 14, 12, 13, 16, 0, 2};
const char* labels[]  = {"CH1-D1", "CH2-D2", "CH3-D5", "CH4-D6",
                          "CH5-D7", "CH6-D0", "CH7-D3", "CH8-D4"};
const int NUM_CHANNELS = 8;

const int RELAY_ON  = ACTIVE_LOW ? LOW : HIGH;
const int RELAY_OFF = ACTIVE_LOW ? HIGH : LOW;

void setup() {
  Serial.begin(115200);
  Serial.println("\n=== ESP8266 Relay Module Test ===");
  Serial.printf("Mode: %s\n\n", ACTIVE_LOW ? "ACTIVE-LOW" : "ACTIVE-HIGH");

  for (int i = 0; i < NUM_CHANNELS; i++) {
    pinMode(channels[i], OUTPUT);
    digitalWrite(channels[i], RELAY_OFF);
  }

  delay(2000);
}

void loop() {
  for (int i = 0; i < NUM_CHANNELS; i++) {
    Serial.printf("Testing %s (GPIO%d) -> ON\n", labels[i], channels[i]);
    digitalWrite(channels[i], RELAY_ON);
    delay(1000);
    digitalWrite(channels[i], RELAY_OFF);
    delay(500);
  }

  Serial.println("\n--- ALL RELAYS ON ---");
  for (int i = 0; i < NUM_CHANNELS; i++) {
    digitalWrite(channels[i], RELAY_ON);
  }
  delay(3000);

  Serial.println("--- ALL RELAYS OFF ---\n");
  for (int i = 0; i < NUM_CHANNELS; i++) {
    digitalWrite(channels[i], RELAY_OFF);
  }
  delay(2000);
}
```

---

## Important Notes

1. **Common GND is critical** - ESP8266 and relay module MUST share ground,
   even if powered by separate supplies. Without it, signals won't work.

2. **GPIO15 (D8) intentionally excluded** - Boots LOW, which turns ON
   active-LOW relays during startup. Too dangerous for relay control.

3. **GPIO0 (D3) and GPIO2 (D4)** - Don't let the relay module pull these
   LOW during boot, or ESP enters flash mode. Most optocoupler-based relay
   modules have high-impedance inputs, so this is normally fine.

4. **If relays flicker during boot** - Add a 10KΩ pull-up resistor on
   GPIO0 and GPIO2 lines to ensure they stay HIGH during boot.

5. **For active-HIGH relay modules** - GPIO0 and GPIO2 will briefly activate
   their relays during boot (they boot HIGH). Put non-critical loads on CH7/CH8.

6. **Relay module VCC** - Some modules have a JD-VCC jumper to separate
   relay coil power from signal power. If present, remove the jumper and
   supply 5V directly to JD-VCC for better isolation.
