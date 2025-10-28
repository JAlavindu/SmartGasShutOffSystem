import { off, onValue, ref } from "firebase/database";
import { database } from "../firebaseConfig";
import { sendLocalNotification } from "./notifications";

export interface GasLeakData {
  gasLevel: number;
  isLeakDetected: boolean;
  timestamp: number;
  location?: string;
}

/**
 * Listen for gas leak events from Firebase Realtime Database
 * @param onGasLeak - Callback function when gas leak is detected
 */
export function subscribeToGasLeakEvents(
  onGasLeak: (data: GasLeakData) => void
) {
  // Reference to your gas sensor data in Firebase
  const gasLeakRef = ref(database, "gasDetector/status");

  const listener = onValue(gasLeakRef, (snapshot) => {
    const data = snapshot.val();

    if (data) {
      const gasLeakData: GasLeakData = {
        gasLevel: data.gasLevel || 0,
        isLeakDetected: data.isLeakDetected || false,
        timestamp: data.timestamp || Date.now(),
        location: data.location || "Unknown",
      };

      // If gas leak is detected, send notification
      if (gasLeakData.isLeakDetected) {
        sendLocalNotification(
          "⚠️ GAS LEAK DETECTED!",
          `Gas level: ${gasLeakData.gasLevel}ppm. Gas supply has been shut off automatically. Please evacuate immediately!`
        );
      }

      // Call the callback function
      onGasLeak(gasLeakData);
    }
  });

  // Return unsubscribe function
  return () => off(gasLeakRef, "value", listener);
}

/**
 * Get current gas detector status
 */
export async function getCurrentGasStatus(): Promise<GasLeakData | null> {
  return new Promise((resolve) => {
    const gasLeakRef = ref(database, "gasDetector/status");

    onValue(
      gasLeakRef,
      (snapshot) => {
        const data = snapshot.val();

        if (data) {
          resolve({
            gasLevel: data.gasLevel || 0,
            isLeakDetected: data.isLeakDetected || false,
            timestamp: data.timestamp || Date.now(),
            location: data.location || "Unknown",
          });
        } else {
          resolve(null);
        }
      },
      { onlyOnce: true }
    );
  });
}
