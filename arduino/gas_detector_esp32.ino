/*
 * Smart Gas Detector with Firebase Integration
 * Hardware: ESP32/ESP8266 + MQ-2/MQ-5 Gas Sensor + Solenoid Valve
 * 
 * This code reads gas sensor data, sends it to Firebase Realtime Database,
 * and controls a solenoid valve to shut off gas supply when leak is detected.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Install required libraries in Arduino IDE:
 *    - Firebase ESP Client by Mobizt
 *    - WiFi library (built-in for ESP32/ESP8266)
 * 2. Update WiFi credentials below (WIFI_SSID and WIFI_PASSWORD)
 * 3. Firebase credentials are already configured
 * 4. Upload to ESP32/ESP8266
 * 5. Open Serial Monitor (115200 baud) to see status
 */

#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// WiFi credentials
#define WIFI_SSID "Your_WiFi_SSID"  // TODO: Replace with your WiFi SSID
#define WIFI_PASSWORD "Your_WiFi_Password"  // TODO: Replace with your WiFi password

// Firebase credentials - From your firebaseConfig.ts
#define API_KEY "AIzaSyBCkgUksQoOaZA5IbryXZvAdlnffm2NI4U"
#define DATABASE_URL "https://smart-gas-detector-98d0c-default-rtdb.firebaseio.com/"

// Pin definitions
#define GAS_SENSOR_PIN 34       // Analog pin for gas sensor (MQ-2/MQ-5)
#define SOLENOID_VALVE_PIN 25   // Digital pin for solenoid valve relay
#define BUZZER_PIN 26           // Digital pin for buzzer
#define LED_PIN 27              // Digital pin for LED indicator

// Gas detection threshold (adjust based on your sensor calibration)
#define GAS_THRESHOLD 400       // ppm

// Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// Variables
unsigned long sendDataPrevMillis = 0;
bool signupOK = false;
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
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  
  // Configure Firebase
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  
  // Sign up anonymously
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Firebase sign up successful");
    signupOK = true;
  } else {
    Serial.printf("Sign up error: %s\n", config.signer.signupError.message.c_str());
  }
  
  config.token_status_callback = tokenStatusCallback;
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
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
  if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > 5000 || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();
    
    // Create JSON object
    FirebaseJson json;
    json.set("gasLevel", gasLevel);
    json.set("isLeakDetected", isLeakDetected);
    json.set("location", location);
    json.set("timestamp", (unsigned long)time(NULL) * 1000);
    
    // Send to Firebase
    Serial.printf("Sending data to Firebase... Gas Level: %d ppm\n", gasLevel);
    
    if (Firebase.RTDB.setJSON(&fbdo, "gasDetector/status", &json)) {
      Serial.println("Data sent successfully");
    } else {
      Serial.println("Failed to send data");
      Serial.println("Reason: " + fbdo.errorReason());
    }
    
    // Also send historical data
    String path = "gasDetector/history/" + String(millis());
    if (Firebase.RTDB.setJSON(&fbdo, path.c_str(), &json)) {
      Serial.println("Historical data logged");
    }
  }
  
  delay(1000); // Read sensor every second
}

/**
 * Read gas sensor and convert to ppm
 * Calibration required based on your specific sensor
 */
int readGasSensor() {
  int sensorValue = analogRead(GAS_SENSOR_PIN);
  
  // Convert analog reading to ppm (this is a simplified conversion)
  // You should calibrate this based on your sensor's datasheet
  // For MQ-2: Rs/R0 ratio to ppm conversion
  int ppm = map(sensorValue, 0, 4095, 0, 1000);
  
  return ppm;
}

/**
 * Alternative: Send data via HTTP POST to your server
 */
void sendDataViaHTTP() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    http.begin("http://your-server.com/api/gas-status");
    http.addHeader("Content-Type", "application/json");
    
    // Create JSON payload
    String jsonPayload = "{";
    jsonPayload += "\"gasLevel\":" + String(gasLevel) + ",";
    jsonPayload += "\"isLeakDetected\":" + String(isLeakDetected ? "true" : "false") + ",";
    jsonPayload += "\"location\":\"" + location + "\",";
    jsonPayload += "\"timestamp\":" + String(millis());
    jsonPayload += "}";
    
    int httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode > 0) {
      Serial.printf("HTTP Response code: %d\n", httpResponseCode);
      String response = http.getString();
      Serial.println(response);
    } else {
      Serial.printf("HTTP Error: %s\n", http.errorToString(httpResponseCode).c_str());
    }
    
    http.end();
  }
}
