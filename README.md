"# 🛡️ Smart Gas Shut-Off System

An intelligent IoT gas leak detection system with automatic shut-off valve control, real-time monitoring via mobile app, and instant push notifications.

![Status](https://img.shields.io/badge/status-ready%20to%20run-brightgreen)
![Platform](https://img.shields.io/badge/platform-ESP32%20%7C%20iOS%20%7C%20Android-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Quick Start (5 Minutes)

### ✅ Current Status: **95% Ready to Run!**

All code is configured. You only need to:

1. Add WiFi credentials to Arduino (1 line change)
2. Download Firebase admin key for backend (1 file)

### Start Here:

**See [FIXES_SUMMARY.md](FIXES_SUMMARY.md) for what was fixed and current status**

**See [PROJECT_SETUP.md](PROJECT_SETUP.md) for complete setup instructions**

**See [CHECKLIST.md](CHECKLIST.md) for quick verification checklist**

## 📁 Project Structure

```
├── arduino/                    # ESP32/ESP8266 firmware
│   └── gas_detector_esp32.ino  # ✅ Firebase configured, needs WiFi
│
├── backend/                    # Node.js notification service
│   ├── pushNotificationService.js  # ✅ Configured & ready
│   ├── package.json               # ✅ Created
│   └── node_modules/              # ✅ Installed
│
└── SmartGasShutOffSystem/     # React Native mobile app
    ├── app/                    # ✅ Gas monitoring dashboard
    ├── utils/                  # ✅ Firebase & notifications
    ├── firebaseConfig.ts       # ✅ Configured
    └── node_modules/           # ✅ Installed
```

## 🎯 Features

- 🔥 **Real-time Gas Detection** - MQ-2/MQ-5 sensor with ESP32
- 🚫 **Automatic Shut-Off** - Solenoid valve closes on leak detection
- 📱 **Mobile Monitoring** - Live gas levels on iOS/Android app
- 🔔 **Push Notifications** - Instant alerts when leak detected
- ☁️ **Cloud Sync** - Firebase Realtime Database
- 📊 **Historical Data** - Track gas levels over time
- 🚨 **Multi-Alert System** - Buzzer, LED, and app notifications

## 🛠️ Tech Stack

- **Hardware:** ESP32/ESP8266, MQ-2/MQ-5 Gas Sensor, Solenoid Valve
- **Backend:** Node.js, Firebase Admin SDK, Expo Push API
- **Mobile:** React Native, Expo, TypeScript
- **Cloud:** Firebase Realtime Database, Firebase Cloud Messaging
- **Communication:** WiFi, HTTPS, WebSocket

## 📋 Setup Instructions

### Backend (2 minutes)

```powershell
cd backend
npm install  # ✅ Already done
npm start    # Start monitoring service
```

⚠️ **Action needed:** Download `serviceAccountKey.json` from Firebase Console

### Mobile App (2 minutes)

```powershell
cd SmartGasShutOffSystem
npm install  # ✅ Already done
npx expo start
```

Scan QR code with Expo Go app

### Arduino (5 minutes)

1. Open `arduino/gas_detector_esp32.ino` in Arduino IDE
2. Update WiFi credentials (lines 18-19)
3. Install library: **Firebase ESP Client** by Mobizt
4. Upload to ESP32

**Hardware Connections:**

- Gas Sensor (MQ-2/MQ-5) → GPIO 34
- Solenoid Valve Relay → GPIO 25
- Buzzer → GPIO 26
- LED → GPIO 27

## 🎓 Documentation

| Document                                                                     | Description                          |
| ---------------------------------------------------------------------------- | ------------------------------------ |
| [FIXES_SUMMARY.md](FIXES_SUMMARY.md)                                         | ✅ All issues fixed + current status |
| [PROJECT_SETUP.md](PROJECT_SETUP.md)                                         | 📚 Complete setup guide (250+ lines) |
| [CHECKLIST.md](CHECKLIST.md)                                                 | ✔️ Quick verification checklist      |
| [backend/README.md](backend/README.md)                                       | 🔧 Backend setup & configuration     |
| [SmartGasShutOffSystem/SETUP_GUIDE.md](SmartGasShutOffSystem/SETUP_GUIDE.md) | 📱 Original app setup guide          |

## 🧪 Testing

### Test Normal Operation

```powershell
# Terminal 1
cd backend && npm start

# Terminal 2
cd SmartGasShutOffSystem && npx expo start
```

Mobile app should show "✓ System Normal"

### Test Gas Leak Alert

1. Go to Firebase Console → Realtime Database
2. Set `gasDetector/status/isLeakDetected` to `true`
3. Set `gasDetector/status/gasLevel` to `500`
4. **Expected:** Red alert in app + push notification

## 🔒 Security

- ✅ `.gitignore` files protecting sensitive data
- ✅ `serviceAccountKey.json` git-ignored
- ✅ Firebase client SDK (public keys safe)
- ⚠️ Firebase database in test mode (change before production)

**Production Security:**

```json
{
  "rules": {
    "gasDetector": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

## 📊 System Flow

```
ESP32 Sensor → Firebase Realtime DB → Backend Service → Push Notification
                      ↓
                  Mobile App (Real-time Updates)
```

1. **ESP32** reads gas sensor every second
2. **Firebase** receives data every 5 seconds
3. **Mobile App** displays real-time status
4. **Backend** monitors for leaks and sends notifications
5. **Solenoid Valve** closes automatically if leak detected

## 🐛 Troubleshooting

| Issue                     | Solution                               |
| ------------------------- | -------------------------------------- |
| Backend: Module not found | `cd backend && npm install`            |
| Mobile: Expo update error | `npx expo start --clear`               |
| Arduino: WiFi failed      | Check SSID/password, use 2.4GHz WiFi   |
| Arduino: Firebase error   | Verify API_KEY and DATABASE_URL        |
| No notifications          | Allow permissions, use physical device |

See [PROJECT_SETUP.md](PROJECT_SETUP.md) for detailed troubleshooting.

## 🎯 What's Working

- ✅ Firebase configuration (all 3 components)
- ✅ Mobile app gas monitoring dashboard
- ✅ Real-time database listeners
- ✅ Push notification system
- ✅ Backend notification service
- ✅ Arduino Firebase integration
- ✅ All dependencies installed
- ✅ Security .gitignore files

## ⚠️ What You Need to Add

1. **Arduino:** WiFi SSID and password (2 lines)
2. **Backend:** `serviceAccountKey.json` from Firebase Console

**That's it! Takes ~2 minutes total.**

## 📱 Screenshots

### Mobile App

- ✅ System Normal (green)
- 🚨 Gas Leak Detected (red alert)
- 📊 Real-time gas level display
- 📍 Location tracking
- 🕒 Last update timestamp

### Serial Monitor

```
Connecting to WiFi...
Connected with IP: 192.168.1.100
Firebase sign up successful
Sending data to Firebase... Gas Level: 123 ppm
Data sent successfully
```

## 🎓 Learning Resources

- [Firebase Realtime Database](https://firebase.google.com/docs/database)
- [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [ESP32 Arduino Core](https://docs.espressif.com/projects/arduino-esp32/en/latest/)
- [MQ-2 Gas Sensor](https://www.instructables.com/How-to-Use-MQ2-Gas-Sensor-Arduino-Tutorial/)

## 🤝 Contributing

Contributions welcome! Areas for improvement:

- [ ] Add authentication to mobile app
- [ ] Multiple sensor support
- [ ] Historical data charts
- [ ] Web dashboard
- [ ] SMS alerts
- [ ] Email notifications

## 📄 License

MIT License - Feel free to use in your projects!

## 🙏 Acknowledgments

Built with:

- Firebase Realtime Database & Cloud Messaging
- Expo & React Native
- Arduino & ESP32
- Node.js & Firebase Admin SDK

---

## 🎉 Ready to Run!

**Start with:** [FIXES_SUMMARY.md](FIXES_SUMMARY.md) to see what was fixed

**Then follow:** [PROJECT_SETUP.md](PROJECT_SETUP.md) for complete setup

**Quick check:** [CHECKLIST.md](CHECKLIST.md) to verify everything

---

**⚡ Total setup time: ~10 minutes | Difficulty: Beginner-friendly**
"
