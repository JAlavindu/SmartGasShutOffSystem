import { Image } from "expo-image";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Alert, Platform, StyleSheet } from "react-native";

import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link } from "expo-router";

import {
  subscribeToGasLeakEvents,
  type GasLeakData,
} from "@/utils/gasLeakService";
import {
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  registerForPushNotificationsAsync,
} from "@/utils/notifications";

export default function HomeScreen() {
  const [expoPushToken, setExpoPushToken] = useState<string>("");
  const [gasStatus, setGasStatus] = useState<GasLeakData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const gasLeakUnsubscribe = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
        console.log("Push token:", token);
        // TODO: Send this token to your backend server to store in Firebase
      }
    });

    // Listen for notifications received while app is in foreground
    notificationListener.current = addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      }
    );

    // Listen for user interaction with notifications
    responseListener.current = addNotificationResponseReceivedListener(
      (response) => {
        console.log("Notification tapped:", response);
        const data = response.notification.request.content.data;

        if (data.type === "gas_leak") {
          Alert.alert(
            "Gas Leak Alert",
            "Please check the gas detector status and evacuate if necessary.",
            [{ text: "OK" }]
          );
        }
      }
    );

    // Subscribe to gas leak events from Firebase
    gasLeakUnsubscribe.current = subscribeToGasLeakEvents((data) => {
      console.log("Gas leak data updated:", data);
      setGasStatus(data);
      setIsLoading(false);

      // Show alert if gas leak detected
      if (data.isLeakDetected) {
        Alert.alert(
          "⚠️ GAS LEAK DETECTED!",
          `Gas level: ${data.gasLevel}ppm\nLocation: ${
            data.location || "Unknown"
          }\n\nGas supply has been automatically shut off. Please evacuate immediately!`,
          [
            {
              text: "Call Emergency",
              onPress: () => console.log("Emergency called"),
            },
            { text: "OK", style: "cancel" },
          ]
        );
      }
    });

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
      if (gasLeakUnsubscribe.current) {
        gasLeakUnsubscribe.current();
      }
    };
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Smart Gas Detector</ThemedText>
        <HelloWave />
      </ThemedView>

      {/* Gas Status Display */}
      <ThemedView
        style={[
          styles.statusContainer,
          gasStatus?.isLeakDetected
            ? styles.dangerContainer
            : styles.safeContainer,
        ]}
      >
        <ThemedText type="subtitle" style={styles.statusTitle}>
          {isLoading
            ? "Loading..."
            : gasStatus?.isLeakDetected
            ? "⚠️ GAS LEAK DETECTED!"
            : "✓ System Normal"}
        </ThemedText>
        {gasStatus && !isLoading && (
          <>
            <ThemedText style={styles.statusText}>
              Gas Level: {gasStatus.gasLevel} ppm
            </ThemedText>
            <ThemedText style={styles.statusText}>
              Status:{" "}
              {gasStatus.isLeakDetected ? "DANGER - Gas Shut Off" : "Safe"}
            </ThemedText>
            {gasStatus.location && (
              <ThemedText style={styles.statusText}>
                Location: {gasStatus.location}
              </ThemedText>
            )}
            <ThemedText style={styles.statusText}>
              Last Updated: {new Date(gasStatus.timestamp).toLocaleString()}
            </ThemedText>
          </>
        )}
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Push Notifications</ThemedText>
        <ThemedText>
          {expoPushToken
            ? `✓ Notifications enabled. You&apos;ll be alerted if gas leak is detected.`
            : "Setting up notifications..."}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">How It Works</ThemedText>
        <ThemedText>
          The system monitors gas levels in real-time using Firebase. When a gas
          leak is detected, you&apos;ll receive an immediate push notification,
          and the gas supply will be automatically shut off.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">hi!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit{" "}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText>{" "}
          to see changes. Press{" "}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: "cmd + d",
              android: "cmd + m",
              web: "F12",
            })}
          </ThemedText>{" "}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction
              title="Action"
              icon="cube"
              onPress={() => alert("Action pressed")}
            />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert("Share pressed")}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert("Delete pressed")}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">
            npm run reset-project
          </ThemedText>{" "}
          to get a fresh <ThemedText type="defaultSemiBold">app</ThemedText>{" "}
          directory. This will move the current{" "}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{" "}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  statusContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  safeContainer: {
    backgroundColor: "#d4edda",
  },
  dangerContainer: {
    backgroundColor: "#f8d7da",
  },
  statusTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    marginVertical: 4,
  },
});
