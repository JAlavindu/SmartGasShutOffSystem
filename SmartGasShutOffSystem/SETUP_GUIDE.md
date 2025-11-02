# Smart Gas Detector Push Notification Setup Guide

## Overview

This guide will help you set up push notifications for your Smart Gas Detector system using Firebase and React Native (Expo).

## Prerequisites

- Node.js and npm installed
- Firebase account
- Physical Android/iOS device (push notifications don't work well on emulators)
- Arduino/ESP32 with gas sensor

---

## Part 1: Firebase Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "Smart-Gas-Detector"
4. Follow the setup wizard

### 1.2 Enable Realtime Database

1. In Firebase Console, go to "Realtime Database"
2. Click "Create Database"
3. Choose a location
4. Start in **test mode** for development (change to production rules later)

### 1.3 Get Firebase Configuration

1. Go to Project Settings (gear icon) → General
2. Scroll to "Your apps"
3. Click the web icon (</>) to add a web app
4. Copy the Firebase configuration object

### 1.4 Add Firebase Config to Mobile App

Open `firebaseConfig.ts` and replace with your credentials:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### 1.5 Download Service Account Key (for backend)

1. Go to Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save as `serviceAccountKey.json` in the `backend/` folder
4. **Keep this file secure - don't commit to Git!**

---

## Part 2: Mobile App Setup

### 2.1 Install Dependencies

```bash
cd mobile/SmartGasShutOffSystem
npm install
```

### 2.2 Run the App

```bash
# For Android
npx expo start --android

# For iOS
npx expo start --ios
```

### 2.3 Get Expo Push Token

1. Run the app on a physical device
2. Accept notification permissions when prompted
3. Check the console for the Expo Push Token (starts with `ExponentPushToken[...]`)
4. Copy this token - you'll need it to send notifications

### 2.4 Store Push Token in Firebase

The app should automatically save the token, but you can manually add it:

1. Go to Firebase Console → Realtime Database
2. Add a new entry:
   ```
   userTokens/
     user1: "ExponentPushToken[xxxxx]"
   ```

---

## Part 3: Backend Setup (Node.js)

### 3.1 Initialize Backend

```bash
cd backend
npm init -y
npm install axios firebase-admin
```

### 3.2 Configure Firebase Admin

1. Copy `serviceAccountKey.json` to the `backend/` folder
2. Update the `databaseURL` in `pushNotificationService.js`

### 3.3 Run Backend Service

```bash
node pushNotificationService.js
```

This will monitor Firebase for gas leak events and send notifications automatically.

---

## Part 4: Arduino/ESP32 Setup

### 4.1 Install Arduino Libraries

Install these libraries via Arduino Library Manager:

- `ArduinoJson` by Benoit Blanchon (for HTTPClient version)
- `HTTPClient` (built-in for ESP32)
- **Note:** Firebase ESP Client is deprecated. Use the new HTTPClient version instead.

### 4.2 Configure Arduino Code

Open `arduino/gas_detector_esp32.ino` and update:

```cpp
#define WIFI_SSID "Your_WiFi_SSID"
#define WIFI_PASSWORD "Your_WiFi_Password"
#define API_KEY "Your_Firebase_API_Key"
#define DATABASE_URL "https://your-project-id.firebaseio.com/"
```

### 4.3 Hardware Connections

```
MQ-2/MQ-5 Gas Sensor:
- VCC → 5V
- GND → GND
- A0 → GPIO 34 (analog input)

Solenoid Valve Relay:
- VCC → 5V
- GND → GND
- IN → GPIO 25

Buzzer:
- Positive → GPIO 26
- Negative → GND

LED Indicator:
- Anode → GPIO 27 (with 220Ω resistor)
- Cathode → GND
```

### 4.4 Upload Code

1. Connect ESP32 to computer via USB
2. Select correct board and port in Arduino IDE
3. Upload the code

---

## Part 5: Testing

### 5.1 Test Push Notifications

You can manually trigger a notification by updating Firebase:

1. Go to Firebase Console → Realtime Database
2. Update the data:
   ```json
   {
     "gasDetector": {
       "status": {
         "gasLevel": 500,
         "isLeakDetected": true,
         "location": "Kitchen",
         "timestamp": 1234567890
       }
     }
   }
   ```
3. Check your mobile device for the notification

### 5.2 Test with Arduino

1. Power on your ESP32 with gas sensor
2. Expose sensor to gas (or breathable gas like butane from lighter)
3. Watch serial monitor for gas readings
4. When threshold is exceeded:
   - Solenoid valve should close
   - Buzzer should sound
   - LED should light up
   - Firebase should update
   - Mobile app should receive notification

---

## Part 6: Firebase Realtime Database Structure

```
smart-gas-detector/
├── gasDetector/
│   ├── status/
│   │   ├── gasLevel: 250 (ppm)
│   │   ├── isLeakDetected: false
│   │   ├── location: "Kitchen"
│   │   └── timestamp: 1234567890
│   └── history/
│       ├── 1234567890/
│       │   ├── gasLevel: 450
│       │   ├── isLeakDetected: true
│       │   ├── location: "Kitchen"
│       │   └── timestamp: 1234567890
│       └── ...
└── userTokens/
    ├── user1: "ExponentPushToken[xxxxx]"
    └── user2: "ExponentPushToken[yyyyy]"
```

---

## Part 7: Troubleshooting

### Notifications Not Received

1. **Check permissions**: Ensure notification permissions are granted
2. **Verify token**: Check if Expo Push Token is valid
3. **Test with Expo tool**: Use [Expo Push Notification Tool](https://expo.dev/notifications)
4. **Check Firebase**: Verify data is being written to Firebase
5. **Backend running**: Ensure backend service is running

### ESP32 Not Connecting

1. **Check WiFi credentials**: Verify SSID and password
2. **Check Firebase config**: Verify API key and database URL
3. **Serial monitor**: Check for error messages
4. **Library versions**: Ensure you have latest Firebase ESP Client library

### Gas Sensor Issues

1. **Warm-up time**: MQ sensors need 2-5 minutes to warm up
2. **Calibration**: Calibrate sensor in clean air before testing
3. **Threshold**: Adjust `GAS_THRESHOLD` based on your environment
4. **Wiring**: Double-check all connections

---

## Part 8: Security Best Practices

1. **Firebase Rules**: Change Realtime Database rules to production mode:

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

2. **Environment Variables**: Never commit sensitive data

   - Add `.env` file for secrets
   - Add to `.gitignore`

3. **Token Management**: Implement token refresh and cleanup

---

## Part 9: Deployment

### 9.1 Build Mobile App

```bash
# For Android APK
eas build --platform android

# For iOS
eas build --platform ios
```

### 9.2 Deploy Backend

Deploy your backend to a cloud service:

- **Heroku**: Simple deployment
- **AWS Lambda**: Serverless option
- **Google Cloud Functions**: Integrates well with Firebase
- **Raspberry Pi**: Local server option

---

## Additional Resources

- [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [Firebase Realtime Database](https://firebase.google.com/docs/database)
- [ESP32 Firebase](https://github.com/mobizt/Firebase-ESP-Client)
- [MQ-2 Sensor Datasheet](https://www.pololu.com/file/0J309/MQ2.pdf)

---

## Support

For issues or questions:

1. Check Firebase Console for errors
2. Check Arduino Serial Monitor for hardware issues
3. Check Expo logs: `npx expo start --clear`
4. Review Firebase Realtime Database for data flow

---

**⚠️ Safety Warning**: This is an educational project. For production use in safety-critical applications, ensure:

- Proper sensor calibration
- Redundant detection systems
- Professional installation
- Regular maintenance and testing
- Compliance with local safety regulations
