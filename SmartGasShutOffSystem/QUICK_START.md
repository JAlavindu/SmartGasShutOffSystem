# Quick Start: Firebase Push Notifications for Gas Leak Detection

## 🚀 Quick Summary

Your React Native app is now configured to receive push notifications when a gas leak is detected!

## 📱 What's Been Set Up

1. ✅ **Expo Notifications** - Push notification system
2. ✅ **Firebase Configuration** - Real-time database connection
3. ✅ **Gas Leak Service** - Monitors Firebase for leak events
4. ✅ **Notification Handlers** - Displays alerts automatically
5. ✅ **Backend Services** - Node.js and Python scripts to send notifications
6. ✅ **Arduino Code** - ESP32/Arduino integration example

## 🎯 Next Steps

### 1. Configure Firebase (5 minutes)

```bash
# 1. Create Firebase project at https://console.firebase.google.com/
# 2. Enable Realtime Database
# 3. Copy your config and paste into firebaseConfig.ts
```

Update `firebaseConfig.ts`:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  // ... rest of config
};
```

### 2. Test on Physical Device (2 minutes)

```bash
# Run the app
npx expo start

# Scan QR code with Expo Go app on your phone
# Grant notification permissions when prompted
```

### 3. Test Notifications (1 minute)

Go to Firebase Console → Realtime Database and add:

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

You should receive a notification immediately! 🎉

## 🔧 How It Works

```
Gas Sensor → ESP32 → Firebase → Mobile App → Push Notification
                    ↓
              Backend Service (monitors changes)
```

### Data Flow:

1. **Gas sensor** detects high gas levels
2. **ESP32/Arduino** sends data to Firebase Realtime Database
3. **Firebase** stores current status in `gasDetector/status`
4. **Mobile app** listens for changes in Firebase
5. **Notification** is triggered when `isLeakDetected: true`
6. **Alert popup** shows on the phone screen
7. **Solenoid valve** automatically shuts off gas supply

## 📊 Firebase Database Structure

```
gasDetector/
  status/
    gasLevel: 450          # Current gas level in ppm
    isLeakDetected: true   # Boolean flag
    location: "Kitchen"    # Sensor location
    timestamp: 1698765432  # Unix timestamp

userTokens/
  user1: "ExponentPushToken[...]"  # Store user push tokens here
```

## 🧪 Testing Without Hardware

You can test the notification system without gas sensor hardware:

### Method 1: Manual Firebase Update

1. Open Firebase Console
2. Go to Realtime Database
3. Edit `gasDetector/status` → set `isLeakDetected: true`
4. Watch your phone receive the notification!

### Method 2: Using Expo Push Notification Tool

1. Get your Expo Push Token from the app console
2. Visit: https://expo.dev/notifications
3. Paste your token
4. Send a test notification

## 📂 File Structure

```
SmartGasShutOffSystem/
├── app/(tabs)/
│   └── index.tsx              # Main screen with gas status display
├── utils/
│   ├── notifications.ts       # Push notification setup
│   └── gasLeakService.ts      # Firebase real-time listener
├── backend/
│   ├── pushNotificationService.js   # Node.js backend
│   └── pushNotificationService.py   # Python backend
├── arduino/
│   └── gas_detector_esp32.ino       # ESP32 code
├── firebaseConfig.ts          # Firebase configuration
├── SETUP_GUIDE.md            # Detailed setup instructions
└── QUICK_START.md            # This file
```

## 🎨 UI Features

Your home screen now displays:

- ✅ Real-time gas level monitoring
- ✅ Visual status indicator (green = safe, red = danger)
- ✅ Push notification status
- ✅ Last update timestamp
- ✅ Location information

## 🔔 Notification Features

- **Foreground**: Shows banner notification
- **Background**: Shows push notification
- **Sound & Vibration**: Enabled
- **Priority**: HIGH (immediate delivery)
- **Persistence**: Stays until dismissed
- **Data payload**: Includes gas level, location, type

## ⚙️ Customization Options

### Change Gas Threshold

In Arduino code:

```cpp
#define GAS_THRESHOLD 400  // Change this value (ppm)
```

### Change Notification Sound

In `utils/notifications.ts`:

```typescript
await Notifications.setNotificationChannelAsync("default", {
  name: "Gas Leak Alerts",
  importance: Notifications.AndroidImportance.MAX,
  sound: "custom_sound.mp3", // Add custom sound
});
```

### Add Multiple Sensors

Update Firebase structure:

```json
{
  "gasDetector": {
    "kitchen": { "gasLevel": 100, "isLeakDetected": false },
    "bedroom": { "gasLevel": 450, "isLeakDetected": true },
    "garage": { "gasLevel": 200, "isLeakDetected": false }
  }
}
```

## 🐛 Common Issues

### "Notifications not showing"

- ✅ Check notification permissions in phone settings
- ✅ Use a physical device (not emulator)
- ✅ Restart the app after granting permissions

### "Firebase connection failed"

- ✅ Verify firebaseConfig.ts has correct credentials
- ✅ Check Firebase Realtime Database rules (set to test mode initially)
- ✅ Ensure internet connection is active

### "Expo Push Token not received"

- ✅ Must use physical device
- ✅ Check console logs for errors
- ✅ Ensure Expo Go app is updated

## 📚 Full Documentation

For complete setup instructions, see `SETUP_GUIDE.md`

## 🔐 Security Reminder

Before deploying to production:

1. Update Firebase security rules
2. Never commit `serviceAccountKey.json` or API keys
3. Use environment variables for sensitive data
4. Implement user authentication
5. Set up proper token management

## 🎓 Learning Resources

- [Expo Notifications Docs](https://docs.expo.dev/push-notifications/overview/)
- [Firebase Realtime Database](https://firebase.google.com/docs/database)
- [React Native Best Practices](https://reactnative.dev/docs/getting-started)

## 💡 Pro Tips

1. **Test early and often** - Don't wait until hardware is ready
2. **Monitor Firebase Console** - Watch data flow in real-time
3. **Use console.logs** - Debug notification flow
4. **Keep backend running** - For automatic notifications
5. **Calibrate sensor** - Let MQ sensors warm up 2-5 minutes

---

## 🚨 Safety Notice

This is an **educational project**. For production safety systems:

- Use professional-grade sensors
- Implement redundant detection
- Get professional installation
- Follow local safety codes
- Regular maintenance required

---

**Need Help?** Check the detailed `SETUP_GUIDE.md` or Firebase Console logs.

**Ready to Deploy?** See deployment instructions in `SETUP_GUIDE.md` Part 9.
