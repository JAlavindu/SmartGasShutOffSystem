# 🛡️ Smart Gas Shut-Off System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-ESP32-green.svg)
![Firebase](https://img.shields.io/badge/backend-Firebase-orange.svg)
![React Native](https://img.shields.io/badge/mobile-React%20Native-61DAFB.svg)

> An IoT-based gas leak detection and automatic shut-off system with real-time monitoring and push notifications.

---

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Hardware Components](#hardware-components)
- [Pin Configuration](#pin-configuration)
- [Wiring Diagram](#wiring-diagram)
- [Software Stack](#software-stack)
- [Gas Detection Threshold](#gas-detection-threshold)
- [Features](#features)
- [Setup Instructions](#setup-instructions)
- [Project Structure](#project-structure)

---

## 🎯 Overview

The **Smart Gas Shut-Off System** is an IoT-enabled safety device that continuously monitors gas levels in real-time. When a gas leak is detected above a safe threshold, the system:

1. **Automatically closes** the gas valve via a solenoid
2. **Sends push notifications** to the mobile app
3. **Logs data** to Firebase Realtime Database
4. **Displays real-time status** on a mobile dashboard

**Key Benefits:**

- ✅ Prevents gas explosions and poisoning
- ✅ 24/7 automated monitoring
- ✅ Instant mobile alerts
- ✅ Remote monitoring from anywhere
- ✅ Historical data logging

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         System Overview                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│   MQ-2 Gas       │         │   Solenoid       │
│   Sensor         │         │   Valve          │
│   (Analog)       │         │   (Digital)      │
└────────┬─────────┘         └────────┬─────────┘
         │                            │
         │ GPIO34 (ADC)      GPIO25   │
         │                            │
    ┌────┴────────────────────────────┴────┐
    │                                      │
    │          ESP32 DevKit V1             │
    │     (Microcontroller + WiFi)         │
    │                                      │
    └──────────────┬───────────────────────┘
                   │
                   │ WiFi (2.4GHz)
                   │ HTTPS/REST API
                   │
    ┌──────────────▼───────────────────────┐
    │                                      │
    │      Firebase Realtime Database      │
    │   (Cloud Data Storage & Sync)        │
    │                                      │
    └──────────┬───────────────┬───────────┘
               │               │
               │               │
    ┌──────────▼──────┐   ┌────▼──────────────┐
    │                 │   │                   │
    │  Backend Service│   │   Mobile App      │
    │  (Node.js)      │   │   (React Native)  │
    │  Push Notif.    │   │   Real-time UI    │
    │                 │   │                   │
    └─────────────────┘   └───────────────────┘
```

---

## 🔧 Hardware Components

### **1. ESP32 DevKit V1** (Microcontroller)

**Specifications:**

- **Model:** ESP32-D0WD-V3 (revision v3.1)
- **Features:** Dual-core CPU, Wi-Fi, Bluetooth, 240MHz
- **Voltage:** 3.3V logic, 5V USB power
- **ADC Resolution:** 12-bit (0-4095)
- **GPIO Pins:** 34 programmable pins

**Why ESP32?**

- ✅ Built-in WiFi (connects to Firebase)
- ✅ Low power consumption (~80mA active)
- ✅ Multiple ADC channels (for analog sensors)
- ✅ Sufficient processing power for real-time monitoring
- ✅ Cost-effective (~$5-10)
- ✅ Large community support

---

### **2. MQ-2 Gas Sensor** (Analog Sensor)

**Specifications:**

- **Model:** MQ-2 Smoke/Gas Sensor
- **Detection Range:** 200 - 10,000 ppm
- **Operating Voltage:** 5V DC
- **Output:** Analog voltage (0-5V) proportional to gas concentration
- **Heater Current:** ~150mA (warm-up time: 20-30 seconds)

**Detects:**

- 🔥 LPG (Liquefied Petroleum Gas)
- 🔥 Propane
- 🔥 Methane
- 🔥 Hydrogen
- 🔥 Smoke

**Why MQ-2?**

- ✅ Detects multiple flammable gases
- ✅ Analog output (precise ppm readings)
- ✅ Fast response time (~10 seconds)
- ✅ Long lifespan (>5 years)
- ✅ Widely available and affordable (~$3-5)
- ✅ High sensitivity

**Pinout:**

- **VCC:** 5V power supply
- **GND:** Ground
- **AO (Analog Out):** Analog voltage output (connected to ESP32 GPIO34)
- **DO (Digital Out):** Not used (we use analog for precise readings)

---

### **3. 12V DC Solenoid Valve** (Actuator)

**Specifications:**

- **Operating Voltage:** 12V DC
- **Current:** ~500mA
- **Type:** Normally Closed (NC) - safe default
- **Material:** Brass body, NBR seal
- **Connection:** 1/2" or 3/4" pipe threading

**Why Normally Closed (NC)?**

- ✅ **Fail-safe:** If power is lost, valve closes automatically
- ✅ **Safety:** Default state prevents gas flow
- ✅ **Energy efficient:** No power needed to stay closed

**Why Solenoid Valve?**

- ✅ Fast response (<100ms)
- ✅ Reliable and durable
- ✅ Easy to control with relay
- ✅ Industry-standard for gas control

---

### **4. 5V Relay Module** (Switch)

**Specifications:**

- **Model:** 5V Single-Channel Relay
- **Coil Voltage:** 5V DC
- **Contact Rating:** 10A @ 250V AC / 10A @ 30V DC
- **Isolation:** Optocoupler (protects ESP32)
- **Trigger:** Active LOW (relay ON when GPIO = LOW)

**Why Relay?**

- ✅ **Isolation:** Protects ESP32 from high-voltage solenoid
- ✅ **Switching Power:** Can handle 12V solenoid current
- ✅ **Safe:** Optocoupler prevents back-EMF damage

**Pinout:**

- **VCC:** 5V (from ESP32 VIN pin or external supply)
- **GND:** Ground
- **IN:** Control signal (connected to ESP32 GPIO25)
- **COM:** Common terminal (connected to 12V+)
- **NO:** Normally Open (connected to solenoid +)
- **NC:** Normally Closed (not used)

---

### **5. Additional Components**

| Component                 | Specification                | Purpose                      |
| ------------------------- | ---------------------------- | ---------------------------- |
| **12V Power Supply**      | 2A minimum                   | Powers solenoid valve        |
| **5V USB Power Supply**   | 2A minimum                   | Powers ESP32 (via micro-USB) |
| **Jumper Wires**          | Male-to-Male, Male-to-Female | Connections                  |
| **Breadboard** (optional) | 830-point                    | Prototyping                  |
| **Resistors** (optional)  | 10kΩ pull-down               | Signal stability             |

---

## 📌 Pin Configuration

### **Complete Pin-to-Pin Connection Table:**

| Component              | Pin Name     | Pin Number | → Connects To → | ESP32 Pin Name     | ESP32 Pin Number             |
| ---------------------- | ------------ | ---------- | --------------- | ------------------ | ---------------------------- |
| **MQ-2 Gas Sensor**    | VCC          | Pin 1      | →               | VIN (5V)           | Top-right pin                |
| **MQ-2 Gas Sensor**    | GND          | Pin 2      | →               | GND                | Multiple GND pins available  |
| **MQ-2 Gas Sensor**    | DO           | Pin 3      | →               | Not Connected      | -                            |
| **MQ-2 Gas Sensor**    | AO           | Pin 4      | →               | GPIO34             | Right side, 6th pin from top |
| **5V Relay Module**    | VCC          | Pin 1      | →               | VIN (5V)           | Top-right pin                |
| **5V Relay Module**    | GND          | Pin 2      | →               | GND                | Multiple GND pins available  |
| **5V Relay Module**    | IN           | Pin 3      | →               | GPIO25             | Left side, 11th pin from top |
| **5V Relay Module**    | COM          | Terminal 1 | →               | 12V+ Power Supply  | External 12V PSU (+)         |
| **5V Relay Module**    | NO           | Terminal 2 | →               | Solenoid Valve (+) | Red wire                     |
| **5V Relay Module**    | NC           | Terminal 3 | →               | Not Connected      | -                            |
| **12V Solenoid Valve** | (+) Positive | Wire 1     | →               | Relay NO           | Via relay switch             |
| **12V Solenoid Valve** | (-) Negative | Wire 2     | →               | 12V GND            | External 12V PSU (-)         |

### **ESP32 DevKit V1 Pin Layout Reference:**

```
                    ESP32 DevKit V1

    Left Side                Right Side
    ═════════                ══════════

    3V3                      VIN (5V) ─────→ MQ-2 VCC, Relay VCC
    GND                      GND ───────────→ MQ-2 GND, Relay GND
    GPIO15                   GPIO13
    GPIO2                    GPIO12
    GPIO4                    GPIO14
    GPIO16                   GPIO27
    GPIO17                   GPIO26
    GPIO5                    GPIO25 ────────→ Relay IN (Control Signal)
    GPIO18                   GPIO33
    GPIO19                   GPIO32
    GPIO21                   GPIO35
    GPIO22                   GPIO34 ────────→ MQ-2 AO (Analog Reading)
    GPIO23                   GPIO39 (VN)
    GND                      GPIO36 (VP)
```

### **MQ-2 Gas Sensor Pinout (4-Pin Module):**

```
MQ-2 Gas Sensor Module
┌─────────────────────┐
│  [LED]  [POT]       │ ← LED Indicator & Sensitivity Potentiometer
│                     │
│  ┌─────────────┐    │
│  │   MQ-2      │    │ ← Gas Sensor Element
│  │   Sensor    │    │
│  └─────────────┘    │
│                     │
│  1   2   3   4      │ ← Pin Headers
│  │   │   │   │      │
└──┼───┼───┼───┼──────┘
   │   │   │   │
   VCC GND DO  AO
   │   │   │   │
   5V  GND NC  GPIO34
```

**Pin Descriptions:**

- **Pin 1 (VCC):** Power input - Connect to ESP32 VIN (5V)
- **Pin 2 (GND):** Ground - Connect to ESP32 GND
- **Pin 3 (DO):** Digital Output - NOT USED (provides only HIGH/LOW, no precise reading)
- **Pin 4 (AO):** Analog Output - Connect to ESP32 GPIO34 (provides 0-4095 ADC value for precise PPM calculation)

### **5V Relay Module Pinout:**

```
5V Single-Channel Relay Module
┌────────────────────────────┐
│  [LED]                     │ ← Power/Status LED
│                            │
│  ┌──────────────┐          │
│  │   Relay      │          │ ← Electromagnetic Relay
│  │   Coil       │          │
│  └──────────────┘          │
│                            │
│  Control Side   Switch Side│
│  VCC GND  IN    COM NO  NC │ ← Pin Headers & Terminals
│   │   │   │      │   │   │ │
└───┼───┼───┼──────┼───┼───┼─┘
    │   │   │      │   │   │
    5V  GND GPIO25 │   │   Not Used
                   │   │
                12V+ Solenoid+
```

**Control Side Pins (3-pin header):**

- **Pin 1 (VCC):** Power input - Connect to ESP32 VIN (5V)
- **Pin 2 (GND):** Ground - Connect to ESP32 GND
- **Pin 3 (IN):** Control signal - Connect to ESP32 GPIO25

**Switch Side Terminals (3 screw terminals):**

- **Terminal 1 (COM):** Common - Connect to 12V Power Supply (+)
- **Terminal 2 (NO):** Normally Open - Connect to Solenoid Valve (+)
- **Terminal 3 (NC):** Normally Closed - NOT USED

### **12V Solenoid Valve Pinout:**

```
12V DC Solenoid Valve
┌─────────────────┐
│                 │
│   ┌─────────┐   │
│   │ Solenoid│   │ ← Electromagnetic Coil
│   │  Coil   │   │
│   └─────────┘   │
│                 │
│   Wire 1  Wire 2│ ← Two wires (no polarity for DC solenoids)
│     │      │    │
└─────┼──────┼────┘
      │      │
    Red    Black
    (+)     (-)
     │       │
  Relay NO  12V GND
```

**Wire Connections:**

- **Wire 1 (Red/+):** Connect to Relay Module NO (Normally Open) terminal
- **Wire 2 (Black/-):** Connect to 12V Power Supply GND

**Note:** Most 12V DC solenoid valves are not polarity-sensitive, but it's best practice to connect Red to (+) and Black to (-).

### **ESP32 GPIO Pin Assignments:**

| ESP32 Pin  | Physical Location        | Function                | Component Connection      |
| ---------- | ------------------------ | ----------------------- | ------------------------- |
| **VIN**    | Top-right pin            | 5V Power Output         | MQ-2 VCC + Relay VCC      |
| **GND**    | Multiple locations       | Ground Reference        | All component grounds     |
| **GPIO34** | Right side, 6th from top | Analog Input (ADC1_CH6) | MQ-2 AO (Analog Output)   |
| **GPIO25** | Left side, 11th from top | Digital Output          | Relay IN (Control Signal) |

**Why GPIO34?**

- ✅ ADC1 channel (ADC2 conflicts with WiFi)
- ✅ Input-only pin (no output conflicts)
- ✅ 12-bit resolution (0-4095 values)
- ✅ No pull-up/pull-down resistors needed

**Why GPIO25?**

- ✅ General-purpose output pin (GPIO)
- ✅ No boot conflicts (GPIO0, GPIO2 have special boot functions)
- ✅ Can drive 40mA (sufficient for relay optocoupler ~10mA)
- ✅ Supports PWM (not used here, but available)

---

## 🔌 Wiring Diagram

### **Complete System Wiring:**

```
┌─────────────────────────────────────────────────────────────────┐
│                      Wiring Connections                         │
└─────────────────────────────────────────────────────────────────┘

MQ-2 Gas Sensor                ESP32 DevKit V1
┌─────────────┐               ┌─────────────┐
│             │               │             │
│  VCC  ──────┼───────────────┼───→ VIN(5V) │
│  GND  ──────┼───────────────┼───→ GND     │
│  AO   ──────┼───────────────┼───→ GPIO34  │
│  DO   (NC)  │               │             │
└─────────────┘               └─────────────┘


5V Relay Module               ESP32 DevKit V1
┌─────────────┐               ┌─────────────┐
│             │               │             │
│  VCC  ──────┼───────────────┼───→ VIN(5V) │
│  GND  ──────┼───────────────┼───→ GND     │
│  IN   ──────┼───────────────┼───→ GPIO25  │
│             │               │             │
│  COM  ──────┼───→ 12V+ (Power Supply)     │
│  NO   ──────┼───→ Solenoid Valve (+)      │
│  NC   (NC)  │               │             │
└─────────────┘               └─────────────┘


12V DC Solenoid Valve         12V Power Supply
┌─────────────┐               ┌─────────────┐
│             │               │             │
│  (+)  ──────┼───────────────┼───→ (+) Out │
│  (-)  ──────┼───────────────┼───→ GND     │
│             │               │             │
└─────────────┘               └─────────────┘

Power Supplies:
- ESP32: 5V USB power adapter (connected to micro-USB port)
- Relay: Powered from ESP32 VIN pin (5V)
- Solenoid: Separate 12V 2A power supply
- Common Ground: All GND pins connected together
```

---

### **Step-by-Step Wiring Instructions:**

#### **Step 1: MQ-2 Gas Sensor → ESP32**

| Connection   | From Component | From Pin    | Wire Color   | To Component | To Pin   | Notes               |
| ------------ | -------------- | ----------- | ------------ | ------------ | -------- | ------------------- |
| **Power**    | MQ-2 Sensor    | Pin 1 (VCC) | Red          | ESP32        | VIN (5V) | Top-right pin       |
| **Ground**   | MQ-2 Sensor    | Pin 2 (GND) | Black        | ESP32        | GND      | Any GND pin         |
| **Signal**   | MQ-2 Sensor    | Pin 4 (AO)  | Yellow/Green | ESP32        | GPIO34   | Right side, 6th pin |
| **Not Used** | MQ-2 Sensor    | Pin 3 (DO)  | -            | -            | -        | Leave disconnected  |

**Visual:**

```
MQ-2 Pin 1 (VCC) ──[Red Wire]───────────→ ESP32 VIN (5V)
MQ-2 Pin 2 (GND) ──[Black Wire]─────────→ ESP32 GND
MQ-2 Pin 4 (AO)  ──[Yellow Wire]────────→ ESP32 GPIO34
MQ-2 Pin 3 (DO)  ──[Not Connected]
```

#### **Step 2: 5V Relay Module → ESP32**

| Connection  | From Component | From Pin    | Wire Color  | To Component | To Pin   | Notes               |
| ----------- | -------------- | ----------- | ----------- | ------------ | -------- | ------------------- |
| **Power**   | Relay Module   | Pin 1 (VCC) | Red         | ESP32        | VIN (5V) | Shared with MQ-2    |
| **Ground**  | Relay Module   | Pin 2 (GND) | Black       | ESP32        | GND      | Common ground       |
| **Control** | Relay Module   | Pin 3 (IN)  | Orange/Blue | ESP32        | GPIO25   | Left side, 11th pin |

**Visual:**

```
Relay Pin 1 (VCC) ──[Red Wire]──────────→ ESP32 VIN (5V)
Relay Pin 2 (GND) ──[Black Wire]────────→ ESP32 GND
Relay Pin 3 (IN)  ──[Orange Wire]───────→ ESP32 GPIO25
```

#### **Step 3: Relay Module → Solenoid Valve (High Voltage Side)**

| Connection          | From Component | From Pin/Terminal | Wire Gauge | To Component   | To Pin         | Notes      |
| ------------------- | -------------- | ----------------- | ---------- | -------------- | -------------- | ---------- |
| **12V Input**       | 12V PSU        | (+) Positive      | 18-22 AWG  | Relay Module   | COM Terminal   | Red wire   |
| **Switched Output** | Relay Module   | NO Terminal       | 18-22 AWG  | Solenoid Valve | Wire 1 (Red/+) | Red wire   |
| **12V Return**      | Solenoid Valve | Wire 2 (Black/-)  | 18-22 AWG  | 12V PSU        | (-) Ground     | Black wire |

**Visual:**

```
12V PSU (+) ──[Thick Red Wire]────→ Relay COM Terminal
                                         │
                                    [Relay Switch]
                                         │
Relay NO Terminal ──[Red Wire]──────→ Solenoid (+) Red Wire
Solenoid (-) Black Wire ──[Black]───→ 12V PSU GND
```

**Circuit Operation:**

- When **GPIO25 = LOW**: Relay is OFF, NO terminal is OPEN → Solenoid has NO power → Valve is CLOSED ✅
- When **GPIO25 = HIGH**: Relay is ON, NO terminal is CLOSED → Solenoid gets 12V → Valve is OPEN

#### **Step 4: Power Connections**

| Power Source         | Output Voltage | Connects To                  | Purpose                           |
| -------------------- | -------------- | ---------------------------- | --------------------------------- |
| **5V USB Adapter**   | 5V DC @ 2A     | ESP32 Micro-USB port         | Powers ESP32, MQ-2, Relay control |
| **12V Power Supply** | 12V DC @ 2A    | Relay COM + Solenoid circuit | Powers solenoid valve (via relay) |

**Visual Power Flow:**

```
Wall Outlet (120V/220V AC)
    │
    ├──→ [5V USB Adapter] ──→ ESP32 Micro-USB ──→ VIN Pin ──→ MQ-2 & Relay
    │
    └──→ [12V Power Supply] ──→ Relay COM ──→ Relay NO ──→ Solenoid Valve
```

#### **Step 5: Common Ground Connection (CRITICAL)**

⚠️ **Important:** Connect all ground pins together for proper operation:

```
ESP32 GND ─┬─ MQ-2 Pin 2 (GND)
           ├─ Relay Pin 2 (GND)
           └─ 12V PSU GND (-)
```

**Why Common Ground?**

- ✅ Provides voltage reference for all components
- ✅ Ensures proper signal levels (GPIO HIGH/LOW)
- ✅ Prevents floating voltages and erratic behavior
- ✅ Completes electrical circuit
  - Black wire

#### **Step 4: Power Connections**

1. **ESP32 Micro-USB** → **5V USB Power Adapter**
2. **12V Power Supply** → **Wall Outlet**
3. **Common Ground:** Connect all GND pins together (ESP32 GND, MQ-2 GND, Relay GND, 12V PSU GND)

---

### **Safety Notes:**

⚠️ **Important:**

- ✅ Always connect **common ground** between all components
- ✅ Use **separate power supplies** for ESP32 (5V) and solenoid (12V)
- ✅ Never connect 12V directly to ESP32 pins (will damage the board)
- ✅ Relay provides **electrical isolation** between ESP32 and high-voltage solenoid
- ✅ MQ-2 sensor needs **20-30 seconds warm-up time** before accurate readings

---

## 💻 Software Stack

### **1. Firmware (Arduino/C++)**

**Platform:** ESP32 (Arduino Framework)

**Libraries Used:**

- `WiFi.h` - WiFi connectivity
- `HTTPClient.h` - Firebase REST API calls
- `ArduinoJson.h` - JSON parsing and serialization

**Key Functions:**

- Read analog gas sensor (ADC)
- Convert ADC value to PPM (parts per million)
- Send data to Firebase every 5 seconds
- Control solenoid valve based on threshold

**File:** `arduino/gas_detector_esp32_httpclient/gas_detector_esp32_httpclient.ino`

---

### **2. Backend Service (Node.js)**

**Platform:** Node.js 18+ (Dockerized)

**Dependencies:**

- `firebase-admin` - Firebase Realtime Database SDK
- `axios` - HTTP client for Expo Push API

**Key Functions:**

- Monitor Firebase for gas leak events
- Send push notifications via Expo Push Notification Service
- Log notification history

**File:** `backend/pushNotificationService.js`

**Deployment:** Docker container (runs 24/7)

---

### **3. Mobile App (React Native + Expo)**

**Platform:** React Native with Expo SDK 54

**Dependencies:**

- `expo-router` - File-based navigation
- `firebase` - Realtime Database client
- `expo-notifications` - Push notification handling
- `expo-linear-gradient` - Gradient UI backgrounds

**Key Features:**

- Real-time gas level display
- Status indicators (Safe/Danger)
- Push notification alerts
- Historical data view

**File:** `SmartGasShutOffSystem/app/(tabs)/index.tsx`

---

### **4. Database (Firebase Realtime Database)**

**Structure:**

```json
{
  "gasDetector": {
    "status": {
      "gasLevel": 123,
      "isLeakDetected": false,
      "lastUpdate": 1730505600000,
      "valveOpen": true,
      "location": "Kitchen"
    }
  },
  "userTokens": {
    "user1": "ExponentPushToken[xxxxxx]"
  }
}
```

---

## 🎯 Gas Detection Threshold

### **Current Threshold: 300 PPM**

```cpp
#define GAS_THRESHOLD 300  // PPM (Parts Per Million)
```

### **Why 300 PPM?**

| Gas Level (PPM) | Health Effects             | System Response            |
| --------------- | -------------------------- | -------------------------- |
| **0-50 PPM**    | Normal air quality         | ✅ Normal operation        |
| **50-100 PPM**  | Acceptable indoor levels   | ✅ Safe                    |
| **100-300 PPM** | Elevated but not dangerous | ⚠️ Monitor closely         |
| **300-500 PPM** | **Potentially hazardous**  | 🚨 **ALARM + Close valve** |
| **500+ PPM**    | **Immediate danger**       | 🚨 **Emergency shutdown**  |

### **Safety Standards Reference:**

- **OSHA (Occupational Safety):** 1000 PPM (8-hour exposure limit for methane)
- **NIOSH (Safety Recommendation):** 35-50 PPM for carbon monoxide
- **Residential Safety:** 300 PPM for flammable gases (conservative limit)

### **Why Conservative 300 PPM?**

1. ✅ **Early Warning:** Detects leaks before dangerous levels
2. ✅ **Sensor Accuracy:** MQ-2 has ±10% accuracy margin
3. ✅ **Response Time:** Allows time for ventilation before danger
4. ✅ **False Positive Prevention:** High enough to avoid cooking/cleaning triggers
5. ✅ **Family Safety:** Protects children and elderly (more sensitive)

### **Calibration:**

The threshold can be adjusted in code:

```cpp
// For more sensitive detection (lower threshold)
#define GAS_THRESHOLD 200  // PPM

// For less sensitive (higher threshold)
#define GAS_THRESHOLD 400  // PPM
```

**Recommended Settings:**

- **Kitchen/Living Room:** 300 PPM (default)
- **Garage/Workshop:** 400 PPM (higher tolerance for fumes)
- **Bedroom/Nursery:** 200 PPM (extra safety)

---

## ✨ Features

### **Hardware Features:**

- ✅ Real-time gas concentration monitoring
- ✅ Automatic valve shutoff on leak detection
- ✅ Multi-gas detection (LPG, propane, methane, hydrogen)
- ✅ Fail-safe design (valve closes on power loss)
- ✅ Low power consumption (~200mA total)

### **Software Features:**

- ✅ Cloud data logging (Firebase)
- ✅ Real-time mobile dashboard
- ✅ Push notifications on leak detection
- ✅ Historical data tracking
- ✅ Remote monitoring from anywhere
- ✅ Beautiful gradient UI with animations

### **Safety Features:**

- ✅ 24/7 automated monitoring
- ✅ Instant emergency response (<1 second)
- ✅ Redundant safety (local + cloud alerts)
- ✅ Fail-safe valve design
- ✅ Battery backup ready (with UPS)

---

## 🚀 Setup Instructions

### **Quick Start:**

1. **Hardware Setup:**

   ```bash
   # Follow wiring diagram above
   # Connect all components
   # Power on ESP32 and 12V supply
   ```

2. **Firmware Upload:**

   ```bash
   cd arduino/gas_detector_esp32_httpclient
   # Edit credentials.h with your WiFi
   # Upload to ESP32 using Arduino IDE
   ```

3. **Backend Service:**

   ```bash
   cd backend
   docker-compose up -d
   docker logs -f smart-gas-backend
   ```

4. **Mobile App:**
   ```bash
   cd SmartGasShutOffSystem
   npm install
   npx expo start
   ```

**Full Setup Guide:** See [`PROJECT_SETUP.md`](PROJECT_SETUP.md)

---

## 📁 Project Structure

```
Smart-gas-shutOff-system/
├── arduino/                          # ESP32 Firmware
│   ├── gas_detector_esp32_httpclient/
│   │   ├── gas_detector_esp32_httpclient.ino  # Main sketch
│   │   └── credentials.h             # WiFi credentials (git-ignored)
│   └── README.md                     # Hardware setup guide
│
├── backend/                          # Backend Service
│   ├── Dockerfile                    # Docker configuration
│   ├── docker-compose.yml            # Docker orchestration
│   ├── pushNotificationService.js    # Node.js service
│   ├── serviceAccountKey.json        # Firebase admin key (git-ignored)
│   └── README.md                     # Backend documentation
│
├── SmartGasShutOffSystem/            # Mobile App
│   ├── app/                          # Expo Router pages
│   │   └── (tabs)/
│   │       └── index.tsx             # Main dashboard
│   ├── utils/
│   │   ├── gasLeakService.ts         # Firebase listener
│   │   └── notifications.ts          # Push notification logic
│   ├── firebaseConfig.ts             # Firebase client config
│   └── package.json                  # Dependencies
│
├── .gitignore                        # Git ignore rules
├── README.md                         # This file
└── PROJECT_SETUP.md                  # Detailed setup guide
```

---

## 📊 Technical Specifications

### **System Specifications:**

| Parameter                 | Value                                     |
| ------------------------- | ----------------------------------------- |
| **Response Time**         | <1 second (leak detection to valve close) |
| **Detection Range**       | 200-10,000 PPM                            |
| **Accuracy**              | ±10% (MQ-2 sensor)                        |
| **Data Upload Interval**  | 5 seconds                                 |
| **WiFi Range**            | 50-100 meters (2.4GHz)                    |
| **Power Consumption**     | ~200mA (ESP32 + Sensor + Relay)           |
| **Operating Voltage**     | 5V (ESP32), 12V (Solenoid)                |
| **Operating Temperature** | -10°C to 50°C                             |

### **Network Requirements:**

- WiFi: 2.4GHz (802.11 b/g/n)
- Internet: 100 kbps upload (minimal bandwidth)
- Firewall: Allow HTTPS (port 443) to Firebase

### **Mobile App Requirements:**

- **Android:** 5.0+ (API Level 21+)
- **iOS:** 13.0+
- **Internet:** Required for real-time updates

---

## 🛡️ Safety Considerations

### **Installation:**

- ✅ Install sensor 6-12 inches below ceiling (gas rises)
- ✅ Place away from direct airflow (fans, windows)
- ✅ Test monthly by exposing to lighter gas briefly
- ✅ Keep away from moisture and extreme temperatures

### **Maintenance:**

- 🔧 Clean sensor every 6 months (soft brush)
- 🔧 Replace sensor every 3-5 years
- 🔧 Test valve operation monthly
- 🔧 Check power connections quarterly

### **Limitations:**

- ⚠️ Not UL/CE certified (DIY project)
- ⚠️ Supplement, don't replace commercial detectors
- ⚠️ Requires internet for remote monitoring
- ⚠️ Sensor needs warm-up time (20-30 seconds)

---

## 📜 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting pull requests.

---

## 📞 Support

- **Documentation:** [PROJECT_SETUP.md](PROJECT_SETUP.md)
- **Hardware Guide:** [arduino/README.md](arduino/README.md)
- **Backend Guide:** [backend/README.md](backend/README.md)

---

## 🙏 Acknowledgments

- ESP32 Community
- Firebase Documentation
- Expo Team
- Open-source contributors

---

**⚠️ Disclaimer:** This is an educational DIY project. For commercial/critical applications, use certified gas detection systems that comply with safety standards (UL, CE, etc.).

---

Made with ❤️ for Safety
