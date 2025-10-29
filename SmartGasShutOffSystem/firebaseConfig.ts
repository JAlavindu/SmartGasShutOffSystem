import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getMessaging, isSupported } from "firebase/messaging";

// Replace with your Firebase project configuration
// Get this from Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
  apiKey: "AIzaSyBCkgUksQoOaZA5IbryXZvAdlnffm2NI4U",
  authDomain: "smart-gas-detector-98d0c.firebaseapp.com",
  databaseURL: "https://smart-gas-detector-98d0c-default-rtdb.firebaseio.com",
  projectId: "smart-gas-detector-98d0c",
  storageBucket: "smart-gas-detector-98d0c.firebasestorage.app",
  messagingSenderId: "91556823235",
  appId: "1:91556823235:web:c62b26559d6b6d60af6276",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const database = getDatabase(app);

// Initialize Firebase Cloud Messaging (for web only)
export const messaging = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

export default app;
