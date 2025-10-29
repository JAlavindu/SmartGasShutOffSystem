# ✅ Smart Gas Detector - Setup Checklist

Use this checklist to ensure everything is configured correctly.

## 🔧 Backend Setup

- [ ] Node.js installed (v18+)
- [ ] `backend/package.json` exists
- [ ] Dependencies installed: `cd backend && npm install`
- [ ] `serviceAccountKey.json` downloaded from Firebase Console
- [ ] `serviceAccountKey.json` placed in `backend/` folder
- [ ] Firebase database URL updated in `pushNotificationService.js`
- [ ] Backend running: `npm start` (shows "Monitoring for gas leaks...")

## 📱 Mobile App Setup

- [ ] Node.js installed (v18+)
- [ ] Expo Go app installed on phone
- [ ] Dependencies installed: `cd SmartGasShutOffSystem && npm install`
- [ ] `firebaseConfig.ts` has real Firebase credentials (✅ Already done)
- [ ] App starts: `npx expo start`
- [ ] App opens on phone (scan QR code)
- [ ] Notification permissions granted
- [ ] Push token visible in console

## 🔌 Arduino/ESP32 Setup

- [ ] Arduino IDE installed
- [ ] ESP32 board support added
- [ ] Library installed: Firebase ESP Client by Mobizt
- [ ] WiFi SSID updated in code (line 18)
- [ ] WiFi PASSWORD updated in code (line 19)
- [ ] Firebase credentials present (✅ Already configured)
- [ ] Hardware connected:
  - [ ] Gas sensor to GPIO 34
  - [ ] Solenoid valve relay to GPIO 25
  - [ ] Buzzer to GPIO 26
  - [ ] LED to GPIO 27
- [ ] Code uploaded to ESP32
- [ ] Serial Monitor shows WiFi connected
- [ ] Serial Monitor shows Firebase connected
- [ ] Data sending to Firebase every 5 seconds

## 🔒 Security Checklist

- [ ] `.gitignore` exists in root folder
- [ ] `.gitignore` exists in backend folder
- [ ] `serviceAccountKey.json` is git-ignored
- [ ] No credentials committed to Git
- [ ] Firebase database rules reviewed
- [ ] Test mode disabled in production

## 🧪 Testing

- [ ] Backend service running without errors
- [ ] Mobile app shows "System Normal" status
- [ ] ESP32 sending data (check Serial Monitor)
- [ ] Firebase Console shows live data updates
- [ ] Manual test: Set `isLeakDetected: true` in Firebase
- [ ] Mobile app shows red alert
- [ ] Push notification received
- [ ] Backend logs "Gas leak detected!"

## 🎯 Final Verification

Run these commands to verify everything:

### Backend Test

```powershell
cd backend
npm start
# Should show: "Monitoring for gas leaks..."
```

### Mobile App Test

```powershell
cd SmartGasShutOffSystem
npx expo start
# Scan QR code, app should load
```

### ESP32 Test

- Open Serial Monitor (115200 baud)
- Should see: "Data sent successfully"

## 📝 Notes

**If ANY checkbox is unchecked**, refer to `PROJECT_SETUP.md` for detailed instructions.

**Current Status:**

- ✅ All Firebase credentials configured
- ✅ Mobile app dashboard complete
- ✅ Backend service configured
- ✅ Security files created
- ⚠️ WiFi credentials needed in Arduino
- ⚠️ serviceAccountKey.json needed for backend

**Total Setup Time:** ~10 minutes
