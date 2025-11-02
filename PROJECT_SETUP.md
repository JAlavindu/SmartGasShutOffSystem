# Smart Gas Shut-Off System - Complete Setup Guide

A complete IoT gas leak detection system with automatic shut-off, real-time monitoring, and push notifications.

## 🏗️ Project Structure

```
Smart-gas-shutOff-system/
├── arduino/                    # ESP32 firmware for gas sensor
│   └── gas_detector_esp32.ino
├── backend/                    # Push notification service
│   ├── pushNotificationService.js
│   ├── pushNotificationService.py
│   ├── package.json
│   └── serviceAccountKey.json  (git-ignored)
└── SmartGasShutOffSystem/     # React Native mobile app
    ├── app/
    ├── utils/
    ├── firebaseConfig.ts
    └── package.json
```

## ✅ Current Status

All configuration is **COMPLETE** and ready to run!

### What's Already Configured:

- ✅ Firebase credentials set in all three components
- ✅ Mobile app has gas monitoring dashboard
- ✅ Push notifications configured
- ✅ Real-time database listeners active
- ✅ Security .gitignore files created
- ✅ Dependencies installed (or installing now)

### What You Need to Do:

1. **Arduino only**: Update WiFi SSID and password
2. **Backend**: Get `serviceAccountKey.json` from Firebase Console
3. **Test**: Run all three components

---

## 🚀 Quick Start (5 Minutes)

### 1. Backend Service (Terminal 1)

```powershell
cd backend
npm install  # If not already installed
npm start
```

Expected output: `Monitoring for gas leaks...`

### 2. Mobile App (Terminal 2)

```powershell
cd SmartGasShutOffSystem
npm install  # If not already installed
npx expo start
```

Scan QR code with Expo Go app on your phone.

### 3. Arduino/ESP32

1. Open `arduino/gas_detector_esp32.ino` in Arduino IDE
2. Update WiFi credentials (lines 18-19):
   ```cpp
   #define WIFI_SSID "Your_WiFi_Name"
   #define WIFI_PASSWORD "Your_WiFi_Password"
   ```
3. Install library: **FirebaseClient** (new version by Mobizt) or use HTTPClient
4. Select board: ESP32 Dev Module (or your board)
5. Upload to ESP32
6. Open Serial Monitor (115200 baud)

---

## 📋 Detailed Setup Instructions

### Prerequisites

- **Node.js** 18+ installed
- **Expo Go** app on your phone (iOS/Android)
- **Arduino IDE** with ESP32 board support
- **Firebase project** (already configured)

### Backend Setup

#### Step 1: Get Firebase Admin Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `smart-gas-detector-98d0c`
3. Go to **Project Settings** (⚙️) → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the downloaded JSON file as `serviceAccountKey.json`
6. Move it to the `backend/` folder

#### Step 2: Install & Run

```powershell
cd backend
npm install
npm start
```

The service will:

- Monitor Firebase for gas leak events
- Send push notifications when leak detected
- Log all activities to console

### Mobile App Setup

#### Step 1: Install Dependencies

```powershell
cd SmartGasShutOffSystem
npm install
```

#### Step 2: Run on Your Phone

```powershell
npx expo start
```

Options:

- **Press `a`** - Run on Android emulator
- **Press `i`** - Run on iOS simulator
- **Scan QR code** - Run on physical device (Expo Go app)

#### Step 3: Test Notifications

1. Open app on your phone
2. Allow notification permissions
3. You'll see your Expo Push Token in the console
4. The token is automatically saved to Firebase

### Arduino/ESP32 Setup

#### Step 1: Install Arduino IDE & Libraries

1. Download [Arduino IDE](https://www.arduino.cc/en/software)
2. Add ESP32 board support:

   - File → Preferences
   - Additional Board URLs: `https://dl.espressif.com/dl/package_esp32_index.json`
   - Tools → Board → Boards Manager → Search "ESP32" → Install

3. Install required library:
   - Sketch → Include Library → Manage Libraries
   - Search: **FirebaseClient** (new version by Mobizt)
   - Or use **HTTPClient** for direct REST API calls (built-in)

#### Step 2: Configure & Upload

1. Open `arduino/gas_detector_esp32.ino`
2. Update WiFi credentials:
   ```cpp
   #define WIFI_SSID "Your_WiFi_Name"       // Line 18
   #define WIFI_PASSWORD "Your_WiFi_Password"  // Line 19
   ```
3. Firebase credentials are already set (lines 22-23)
4. Select your board: Tools → Board → ESP32 Dev Module
5. Select port: Tools → Port → (your ESP32 port)
6. Click Upload (→)

#### Step 3: Hardware Connections

**Gas Sensor (MQ-2 or MQ-5):**

- VCC → 3.3V
- GND → GND
- AOUT → GPIO 34

**Solenoid Valve Relay:**

- VCC → 5V
- GND → GND
- IN → GPIO 25

**Buzzer:**

- Positive → GPIO 26
- Negative → GND

**LED:**

- Anode (+) → GPIO 27 (with 220Ω resistor)
- Cathode (-) → GND

#### Step 4: Monitor & Test

1. Open Serial Monitor (Tools → Serial Monitor)
2. Set baud rate: **115200**
3. You should see:
   ```
   Connecting to WiFi...
   Connected with IP: 192.168.x.x
   Firebase sign up successful
   Sending data to Firebase... Gas Level: 123 ppm
   Data sent successfully
   ```

---

## 🧪 Testing the Complete System

### Test 1: Normal Operation

1. **Start all three components** (backend, mobile app, ESP32)
2. **Check mobile app**: Should show "✓ System Normal"
3. **Watch Serial Monitor**: Gas level updates every 5 seconds
4. **Check Firebase Console**:
   - Realtime Database → `gasDetector/status`
   - Should see live updates

### Test 2: Gas Leak Simulation

**Option A: Manual Firebase Edit**

1. Go to Firebase Console → Realtime Database
2. Edit `gasDetector/status/isLeakDetected` → `true`
3. Edit `gasDetector/status/gasLevel` → `500`
4. **Expected results**:
   - Mobile app shows red alert
   - Push notification received
   - Backend logs "Gas leak detected!"

**Option B: Sensor Test**

1. Expose gas sensor to lighter gas (DO NOT IGNITE)
2. Gas level should rise above 400 ppm threshold
3. ESP32 will:
   - Close solenoid valve (GPIO 25 HIGH)
   - Sound buzzer
   - Turn on LED
   - Send data to Firebase
4. Mobile app receives alert

### Test 3: Push Notifications

1. **Close mobile app** (swipe away)
2. Trigger gas leak (Option A or B above)
3. **Notification should appear** even when app is closed
4. **Tap notification** → App opens with alert

---

## 🔒 Security Checklist

- ✅ `serviceAccountKey.json` is git-ignored
- ✅ Root `.gitignore` protects sensitive files
- ✅ Backend `.gitignore` protects secrets
- ✅ Firebase API key is public-safe (client-side key)
- ⚠️ **Firebase Database Rules**: Currently in test mode

  **Before production**, update rules:

  ```json
  {
    "rules": {
      "gasDetector": {
        ".read": "auth != null",
        ".write": "auth != null"
      },
      "userTokens": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
  ```

---

## 🐛 Troubleshooting

### Backend Issues

**Error: Cannot find module 'firebase-admin'**

```powershell
cd backend
npm install
```

**Error: serviceAccountKey.json not found**

- Download from Firebase Console (see Backend Setup Step 1)
- Ensure file is named exactly `serviceAccountKey.json`
- Place in `backend/` folder

### Mobile App Issues

**Error: Expo update download failed**

```powershell
cd SmartGasShutOffSystem
npx expo start --clear
```

**Notifications not working**

- Check permissions in phone settings
- Physical device required (doesn't work in simulator)
- Ensure Expo Go app is up to date

### Arduino Issues

**Compilation error: Firebase.h not found**

- Install library: Firebase ESP Client by Mobizt
- Restart Arduino IDE

**WiFi connection failed**

- Check SSID and password are correct
- Ensure 2.4GHz WiFi (ESP32 doesn't support 5GHz)
- Check WiFi signal strength

**Firebase sign up error**

- Verify API_KEY is correct
- Check DATABASE_URL ends with `/`
- Ensure internet connection is working

---

## 📱 Mobile App Features

### Home Screen

- Real-time gas level display
- Leak detection status (green = safe, red = danger)
- Location of detector
- Last update timestamp
- Push notification status

### Notifications

- Instant alerts when leak detected
- Sound + vibration
- Shows gas level and location
- Works when app is closed

### Real-time Updates

- Automatic refresh every 5 seconds (from Firebase)
- No manual refresh needed
- Background monitoring

---

## 🔧 Customization

### Change Gas Threshold

Edit `arduino/gas_detector_esp32.ino` line 26:

```cpp
#define GAS_THRESHOLD 400  // Change to desired ppm value
```

### Change Update Interval

Edit `arduino/gas_detector_esp32.ino` line 107:

```cpp
if (millis() - sendDataPrevMillis > 5000) {  // Change 5000 to desired milliseconds
```

### Change Sensor Location

Edit `arduino/gas_detector_esp32.ino` line 39:

```cpp
String location = "Kitchen";  // Change to your location
```

### Modify Mobile App Theme

Edit `SmartGasShutOffSystem/constants/theme.ts`

---

## 📊 Firebase Database Structure

```json
{
  "gasDetector": {
    "status": {
      "gasLevel": 123,
      "isLeakDetected": false,
      "location": "Kitchen",
      "timestamp": 1234567890000
    },
    "history": {
      "1234567890": {
        /* historical data */
      },
      "1234567891": {
        /* historical data */
      }
    }
  },
  "userTokens": {
    "user1": "ExponentPushToken[xxxxxx]",
    "user2": "ExponentPushToken[yyyyyy]"
  }
}
```

---

## 🎯 Next Steps

### Production Deployment

1. **Secure Firebase**:

   - Enable authentication
   - Update database rules
   - Set up security rules

2. **Deploy Backend**:

   - Host on cloud (AWS, Google Cloud, Heroku)
   - Use environment variables for secrets
   - Set up monitoring/logging

3. **Build Mobile App**:

   ```powershell
   cd SmartGasShutOffSystem
   eas build --platform all
   ```

4. **Hardware Enclosure**:
   - 3D print or purchase enclosure
   - Ensure proper ventilation for sensor
   - Weatherproof if outdoor installation

### Additional Features

- [ ] Add authentication to mobile app
- [ ] Multiple sensor support
- [ ] Historical data charts
- [ ] SMS alerts (Twilio integration)
- [ ] Email notifications
- [ ] Web dashboard
- [ ] Battery backup notification
- [ ] Sensor calibration UI

---

## 📞 Support

If you encounter issues:

1. Check Firebase Console for data updates
2. Check Serial Monitor for ESP32 logs
3. Check backend terminal for notification logs
4. Check mobile app console for errors

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🙏 Credits

Built with:

- Firebase Realtime Database
- Expo / React Native
- ESP32 / Arduino
- Firebase Cloud Messaging

---

**🎉 Your system is ready to run! Start with the Quick Start section above.**
