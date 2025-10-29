// Backend service to send push notifications via Expo Push Notification Service
// This should run on your server or microcontroller with network capability

const axios = require("axios");

// Expo Push Notification API endpoint
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

/**
 * Send push notification to a device via Expo
 * @param {string} pushToken - Expo Push Token (e.g., ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx])
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data
 */
async function sendPushNotification(pushToken, title, body, data = {}) {
  try {
    const message = {
      to: pushToken,
      sound: "default",
      title: title,
      body: body,
      data: data,
      priority: "high",
      channelId: "default",
    };

    const response = await axios.post(EXPO_PUSH_URL, message, {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
    });

    console.log("Push notification sent:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error sending push notification:",
      error.response?.data || error.message
    );
    throw error;
  }
}

/**
 * Send gas leak alert notification
 * @param {string} pushToken - Expo Push Token
 * @param {number} gasLevel - Gas level in ppm
 * @param {string} location - Location of the gas detector
 */
async function sendGasLeakAlert(pushToken, gasLevel, location = "Unknown") {
  return sendPushNotification(
    pushToken,
    "⚠️ GAS LEAK DETECTED!",
    `Gas level: ${gasLevel}ppm at ${location}. Gas supply has been shut off. Evacuate immediately!`,
    {
      type: "gas_leak",
      gasLevel: gasLevel,
      location: location,
      timestamp: Date.now(),
    }
  );
}

/**
 * Example: Firebase Realtime Database integration
 * This monitors for gas leak events and sends notifications
 */
async function monitorGasLeaksAndNotify() {
  const admin = require("firebase-admin");

  // Initialize Firebase Admin SDK
  const serviceAccount = require("./serviceAccountKey.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://smart-gas-detector-98d0c-default-rtdb.firebaseio.com",
  });

  const db = admin.database();
  const gasDetectorRef = db.ref("gasDetector/status");
  const tokensRef = db.ref("userTokens");

  // Listen for gas leak events
  gasDetectorRef.on("value", async (snapshot) => {
    const data = snapshot.val();

    if (data && data.isLeakDetected) {
      console.log("Gas leak detected! Sending notifications...");

      // Get all user tokens
      const tokensSnapshot = await tokensRef.once("value");
      const tokens = tokensSnapshot.val();

      if (tokens) {
        // Send notification to all registered devices
        const notificationPromises = Object.values(tokens).map((token) =>
          sendGasLeakAlert(token, data.gasLevel, data.location)
        );

        await Promise.all(notificationPromises);
        console.log("All notifications sent successfully");
      }
    }
  });

  console.log("Monitoring for gas leaks...");
}

// For Arduino/ESP32 integration
/**
 * Update Firebase when gas leak is detected
 * Call this from your microcontroller via HTTP request
 */
async function reportGasLeak(gasLevel, isLeakDetected, location = "Home") {
  const admin = require("firebase-admin");
  const db = admin.database();
  const gasDetectorRef = db.ref("gasDetector/status");

  await gasDetectorRef.set({
    gasLevel: gasLevel,
    isLeakDetected: isLeakDetected,
    location: location,
    timestamp: Date.now(),
  });

  console.log("Gas status updated in Firebase");
}

module.exports = {
  sendPushNotification,
  sendGasLeakAlert,
  monitorGasLeaksAndNotify,
  reportGasLeak,
};

// Example usage:
if (require.main === module) {
  // Start monitoring
  monitorGasLeaksAndNotify();
}
