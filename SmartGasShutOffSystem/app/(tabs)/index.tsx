import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
  Text,
  Dimensions,
  Animated,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

import {
  subscribeToGasLeakEvents,
  type GasLeakData,
} from "@/utils/gasLeakService";
import {
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  registerForPushNotificationsAsync,
} from "@/utils/notifications";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const [expoPushToken, setExpoPushToken] = useState<string>("");
  const [gasStatus, setGasStatus] = useState<GasLeakData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const gasLeakUnsubscribe = useRef<(() => void) | null>(null);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for danger state
  useEffect(() => {
    if (gasStatus?.isLeakDetected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [gasStatus?.isLeakDetected]);

  // Rotate animation for loading
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [isLoading]);

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

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const getStatusColor = (): [string, string] => {
    if (isLoading) return ["#6B7280", "#4B5563"];
    return gasStatus?.isLeakDetected
      ? ["#EF4444", "#DC2626"]
      : ["#10B981", "#059669"];
  };

  const getStatusIcon = () => {
    if (isLoading) return "⏳";
    return gasStatus?.isLeakDetected ? "🚨" : "✅";
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={
          gasStatus?.isLeakDetected
            ? ["#FEE2E2", "#FECACA"]
            : ["#E0F2FE", "#BAE6FD"]
        }
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Smart Gas</Text>
            <Text style={styles.headerSubtitle}>Detector System</Text>
          </View>

          {/* Main Status Card */}
          <Animated.View
            style={[styles.mainCard, { transform: [{ scale: pulseAnim }] }]}
          >
            <LinearGradient
              colors={getStatusColor()}
              style={styles.statusGradient}
            >
              <View style={styles.statusIconContainer}>
                {isLoading ? (
                  <Animated.Text
                    style={[
                      styles.statusIcon,
                      { transform: [{ rotate: spin }] },
                    ]}
                  >
                    ⚙️
                  </Animated.Text>
                ) : (
                  <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
                )}
              </View>

              <Text style={styles.statusTitle}>
                {isLoading
                  ? "Connecting..."
                  : gasStatus?.isLeakDetected
                  ? "GAS LEAK DETECTED!"
                  : "System Normal"}
              </Text>

              {!isLoading && gasStatus && (
                <>
                  <View style={styles.gasLevelContainer}>
                    <Text style={styles.gasLevelValue}>
                      {gasStatus.gasLevel}
                    </Text>
                    <Text style={styles.gasLevelUnit}>ppm</Text>
                  </View>

                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>
                      {gasStatus.isLeakDetected
                        ? "⛔ Gas Shut Off"
                        : "🟢 Operating"}
                    </Text>
                  </View>
                </>
              )}
            </LinearGradient>
          </Animated.View>

          {/* Info Cards */}
          {!isLoading && gasStatus && (
            <>
              {/* Location Card */}
              <View style={styles.infoCard}>
                <View style={styles.infoCardHeader}>
                  <Text style={styles.infoCardIcon}>📍</Text>
                  <Text style={styles.infoCardTitle}>Location</Text>
                </View>
                <Text style={styles.infoCardValue}>
                  {gasStatus.location || "Unknown"}
                </Text>
              </View>

              {/* Last Update Card */}
              <View style={styles.infoCard}>
                <View style={styles.infoCardHeader}>
                  <Text style={styles.infoCardIcon}>🕒</Text>
                  <Text style={styles.infoCardTitle}>Last Update</Text>
                </View>
                <Text style={styles.infoCardValue}>
                  {formatTime(gasStatus.timestamp)}
                </Text>
                <Text style={styles.infoCardSubValue}>
                  {new Date(gasStatus.timestamp).toLocaleDateString()}
                </Text>
              </View>

              {/* Notifications Card */}
              <View style={styles.infoCard}>
                <View style={styles.infoCardHeader}>
                  <Text style={styles.infoCardIcon}>🔔</Text>
                  <Text style={styles.infoCardTitle}>Notifications</Text>
                </View>
                <Text style={styles.infoCardValue}>
                  {expoPushToken ? "Enabled" : "Setting up..."}
                </Text>
                {expoPushToken && (
                  <Text style={styles.infoCardSubValue}>
                    Alerts active • Real-time monitoring
                  </Text>
                )}
              </View>

              {/* Safety Info */}
              <View style={styles.safetyCard}>
                <Text style={styles.safetyTitle}>🛡️ Safety Features</Text>
                <View style={styles.safetyList}>
                  <Text style={styles.safetyItem}>
                    ✓ Real-time gas level monitoring
                  </Text>
                  <Text style={styles.safetyItem}>
                    ✓ Automatic gas shut-off valve
                  </Text>
                  <Text style={styles.safetyItem}>
                    ✓ Instant push notifications
                  </Text>
                  <Text style={styles.safetyItem}>
                    ✓ Cloud-based data logging
                  </Text>
                </View>
              </View>

              {/* Emergency Button */}
              {gasStatus.isLeakDetected && (
                <TouchableOpacity
                  style={styles.emergencyButton}
                  onPress={() =>
                    Alert.alert(
                      "Emergency Services",
                      "This will call emergency services. Make sure you are in a safe location.",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Call 911",
                          onPress: () => console.log("Emergency called"),
                          style: "destructive",
                        },
                      ]
                    )
                  }
                >
                  <LinearGradient
                    colors={["#DC2626", "#991B1B"]}
                    style={styles.emergencyGradient}
                  >
                    <Text style={styles.emergencyButtonText}>
                      🚨 Call Emergency Services
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Smart Gas Detector v1.0</Text>
            <Text style={styles.footerSubtext}>
              Monitoring your safety 24/7
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 30,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1F2937",
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 18,
    color: "#6B7280",
    marginTop: 4,
    fontWeight: "600",
  },
  mainCard: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statusGradient: {
    padding: 32,
    alignItems: "center",
  },
  statusIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  statusIcon: {
    fontSize: 50,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  gasLevelContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  gasLevelValue: {
    fontSize: 64,
    fontWeight: "bold",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  gasLevelUnit: {
    fontSize: 24,
    color: "#FFFFFF",
    marginLeft: 8,
    opacity: 0.9,
  },
  statusBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoCardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  infoCardValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  infoCardSubValue: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  safetyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#10B981",
  },
  safetyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  safetyList: {
    gap: 10,
  },
  safetyItem: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
  },
  emergencyButton: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emergencyGradient: {
    padding: 18,
    alignItems: "center",
  },
  emergencyButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },
  footerSubtext: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
});
