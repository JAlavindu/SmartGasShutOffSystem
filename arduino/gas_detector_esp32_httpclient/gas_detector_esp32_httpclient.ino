/*
 * Smart Gas Detector with Firebase Integration (HTTPClient Version)
 * Hardware: ESP32/ESP8266 + MQ-2/MQ-5 Gas Sensor + Solenoid Valve
 * 
 * This version uses HTTPClient for Firebase REST API calls instead of deprecated Firebase ESP Client
 * 
 * SETUP INSTRUCTIONS:
 * 1. No additional libraries needed! HTTPClient is built-in for ESP32
 * 2. Update WiFi credentials below (WIFI_SSID and WIFI_PASSWORD)
 * 3. Firebase credentials are already configured
 * 4. Upload to ESP32/ESP8266
 * 5. Open Serial Monitor (115200 baud) to see status
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>  // Install this: Sketch -> Include Library -> Manage Libraries -> ArduinoJson

// WiFi credentials
// WiFi credentials moved to external, git-ignored file for local development
// Create `credentials.h` next to this sketch and add your credentials there.
#include "credentials.h"  // See arduino/gas_detector_esp32_httpclient/credentials.h (gitignored)

// Firebase credentials - From your firebaseConfig.ts
#define API_KEY "AIzaSyBCkgUksQoOaZA5IbryXZvAdlnffm2NI4U"
#define DATABASE_URL "https://smart-gas-detector-98d0c-default-rtdb.firebaseio.com"

// Firebase REST API paths
String firebasePath = "/gasDetector/status.json";
String firebaseFullURL = String(DATABASE_URL) + firebasePath;

// Pin definitions
#define GAS_SENSOR_PIN 34       // Analog pin for gas sensor (MQ-2/MQ-5)
#define SOLENOID_VALVE_PIN 25   // Digital pin for solenoid valve relay
#define BUZZER_PIN 26           // Digital pin for buzzer
#define LED_PIN 27              // Digital pin for LED indicator

// Gas detection threshold (adjust based on your sensor calibration)
#define GAS_THRESHOLD 300       // ppm

// Variables
unsigned long sendDataPrevMillis = 0;
int gasLevel = 0;
bool isLeakDetected = false;
String location = "Kitchen";  // Change based on sensor location

void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(GAS_SENSOR_PIN, INPUT);
  pinMode(SOLENOID_VALVE_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  
  // Initial state: valve open, buzzer off
  digitalWrite(SOLENOID_VALVE_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(LED_PIN, LOW);
  
  // Connect to WiFi
  Serial.println("\n=== WiFi Connection Debug ===");
  Serial.print("Attempting to connect to SSID: ");
  Serial.println(WIFI_SSID);
  Serial.print("Password length: ");
  Serial.println(strlen(WIFI_PASSWORD));
  
  // Password length printed as a debug; empty means credentials.h not filled
  if (strlen(WIFI_SSID) == 0 || strlen(WIFI_PASSWORD) == 0) {
    Serial.println("\n✗ WIFI_SSID and/or WIFI_PASSWORD are empty.\nPlease create 'credentials.h' and set your WiFi credentials before proceeding.\nDevice will halt.");
    while (true) {
      delay(1000);
    }
  }

  WiFi.mode(WIFI_STA);  // Set to Station mode
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  Serial.print("Connecting to WiFi");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {  // 40 attempts = 12 seconds
    Serial.print(".");
    delay(300);
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi Connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal Strength (RSSI): ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    Serial.println("Smart Gas Detector Ready!");
  } else {
    Serial.println("\n✗ WiFi Connection FAILED!");
    Serial.print("Status code: ");
    Serial.println(WiFi.status());
    Serial.println("\nPossible issues:");
    Serial.println("1. Wrong SSID or password");
    Serial.println("2. 5GHz network (ESP32 needs 2.4GHz)");
    Serial.println("3. Weak signal - move closer to router");
    Serial.println("4. Router firewall blocking ESP32");
    Serial.println("\nDevice will restart in 5 seconds...");
    delay(5000);
    ESP.restart();
  }
}

void loop() {
  // Read gas sensor value
  gasLevel = readGasSensor();
  
  // Check for gas leak
  isLeakDetected = (gasLevel > GAS_THRESHOLD);
  
  // Control solenoid valve and alarm
  if (isLeakDetected) {
    // Close valve (shut off gas supply)
    digitalWrite(SOLENOID_VALVE_PIN, HIGH);
    
    // Activate alarm
    digitalWrite(BUZZER_PIN, HIGH);
    digitalWrite(LED_PIN, HIGH);
    
    Serial.println("⚠️ GAS LEAK DETECTED!");
  } else {
    // Open valve (normal operation)
    digitalWrite(SOLENOID_VALVE_PIN, LOW);
    
    // Deactivate alarm
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(LED_PIN, LOW);
  }
  
  // Send data to Firebase every 5 seconds
  if (millis() - sendDataPrevMillis > 5000 || sendDataPrevMillis == 0) {
    sendDataPrevMillis = millis();
    
    if (WiFi.status() == WL_CONNECTED) {
      sendDataToFirebase();
    } else {
      Serial.println("WiFi Disconnected. Reconnecting...");
      WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    }
  }
  
  delay(1000); // Read sensor every second
}

/**
 * Send data to Firebase using REST API
 */
void sendDataToFirebase() {
  HTTPClient http;
  
  // Add API key to URL
  String url = firebaseFullURL + "?auth=" + API_KEY;
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["gasLevel"] = gasLevel;
  doc["isLeakDetected"] = isLeakDetected;
  doc["location"] = location;
  doc["timestamp"] = millis();
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.printf("Sending data to Firebase... Gas Level: %d ppm\n", gasLevel);
  
  // Send PATCH request (updates specific fields)
  int httpResponseCode = http.PATCH(jsonString);
  
  if (httpResponseCode > 0) {
    Serial.println("✓ Data sent successfully");
    Serial.printf("Response code: %d\n", httpResponseCode);
    String response = http.getString();
    Serial.println("Response: " + response);
  } else {
    Serial.println("✗ Error sending data");
    Serial.printf("Error code: %d\n", httpResponseCode);
    Serial.println("Error: " + http.errorToString(httpResponseCode));
  }
  
  http.end();
}

/**
 * Read gas sensor and convert to ppm
 * Calibration required based on your specific sensor
 */
int readGasSensor() {
  int sensorValue = analogRead(GAS_SENSOR_PIN);
  
  // Convert analog reading to ppm (simplified conversion)
  // Calibrate this based on your sensor's datasheet
  // ESP32 ADC: 0-4095 (12-bit)
  int ppm = map(sensorValue, 0, 4095, 0, 1000);
  
  return ppm;
}

/**
 * Alternative: GET request to read current Firebase data
 */
void readFromFirebase() {
  HTTPClient http;
  
  String url = firebaseFullURL + "?auth=" + API_KEY;
  http.begin(url);
  
  int httpResponseCode = http.GET();
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("Firebase Data: " + response);
    
    // Parse JSON response
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, response);
    
    if (!error) {
      int storedGasLevel = doc["gasLevel"];
      bool storedLeakStatus = doc["isLeakDetected"];
      Serial.printf("Stored Gas Level: %d ppm, Leak: %s\n", 
                    storedGasLevel, 
                    storedLeakStatus ? "Yes" : "No");
    }
  } else {
    Serial.printf("Error reading from Firebase: %d\n", httpResponseCode);
  }
  
  http.end();
}
