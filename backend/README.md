# Smart Gas Detector - Backend Service

This backend service monitors Firebase Realtime Database for gas leak events and sends push notifications to registered mobile devices.

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure Firebase Admin:**

   - Download your `serviceAccountKey.json` from Firebase Console
   - Go to: Project Settings → Service Accounts → Generate New Private Key
   - Place the file in this `backend/` folder
   - **IMPORTANT:** This file is git-ignored for security

3. **Update Firebase Database URL:**
   - Open `pushNotificationService.js`
   - Replace `"https://your-project-id.firebaseio.com"` with your actual database URL
   - You can find this in Firebase Console → Realtime Database

## Running the Service

```bash
# Start the service
npm start

# Or with auto-reload during development
npm run dev
```

## How It Works

1. Monitors `gasDetector/status` in Firebase Realtime Database
2. When `isLeakDetected` is `true`, it:
   - Fetches all registered user tokens from `userTokens`
   - Sends push notifications to all devices via Expo Push API
   - Logs the notification status

## User Token Storage

Mobile app should store Expo push tokens in Firebase:

```json
{
  "userTokens": {
    "user1": "ExponentPushToken[xxxxxx]",
    "user2": "ExponentPushToken[yyyyyy]"
  }
}
```

## Security Notes

- Never commit `serviceAccountKey.json` to version control
- Keep your Firebase database rules secure
- Use environment variables for production deployments
