# Arduino/ESP32 Code for Smart Gas Detector

## 📢 Important Update: Firebase ESP Client is Deprecated

The original `Firebase ESP Client` library by Mobizt is now deprecated. We provide **two alternatives**:

---

## ✅ **Option 1: HTTPClient (Recommended - Built-in)**

**File:** `gas_detector_esp32_httpclient.ino`

### Advantages:

- ✅ **No external libraries needed** (HTTPClient is built-in)
- ✅ **Simpler code**
- ✅ **Direct Firebase REST API calls**
- ✅ **Well supported and maintained**

### Required Library:

- **ArduinoJson** (Install via Library Manager)
  - Sketch → Include Library → Manage Libraries
  - Search: "ArduinoJson"
  - Install by Benoit Blanchon

### Setup:

1. Open `gas_detector_esp32_httpclient.ino`
2. Update WiFi credentials (lines 19-20)
3. Install ArduinoJson library
4. Upload to ESP32

---

## 🔄 **Option 2: New FirebaseClient Library**

**File:** `gas_detector_esp32.ino` (original)

### For Users Who Want the New Version:

The deprecated library has been replaced with:

- **New Library Name:** `FirebaseClient` (by Mobizt)
- **GitHub:** https://github.com/mobizt/FirebaseClient

### Installation:

1. Remove old `Firebase ESP Client` library if installed
2. Install new library:
   - Sketch → Include Library → Manage Libraries
   - Search: "FirebaseClient"
   - Install by Mobizt

### Code Changes Required:

The new library has different syntax. You'll need to update the include statements and initialization code.

---

## 🚀 **Quick Comparison**

| Feature            | HTTPClient (Option 1) | New FirebaseClient (Option 2) |
| ------------------ | --------------------- | ----------------------------- |
| External Libraries | ArduinoJson only      | FirebaseClient + dependencies |
| Code Complexity    | Simple                | More complex                  |
| Firebase Features  | REST API only         | Full Firebase features        |
| Recommended For    | Most users            | Advanced Firebase features    |

---

## 📝 **Recommended: Use HTTPClient Version**

For this gas detector project, **Option 1 (HTTPClient)** is recommended because:

- Simpler and more reliable
- Built-in library (no deprecation risk)
- Sufficient for our use case (read/write Firebase data)
- Easier to debug

---

## 🔧 **Setup Instructions (HTTPClient Version)**

### 1. Hardware Connections

```
Gas Sensor (MQ-2/MQ-5):
├─ VCC  → 3.3V or 5V (check sensor datasheet)
├─ GND  → GND
└─ AOUT → GPIO 34 (analog input)

Solenoid Valve Relay:
├─ VCC → 5V
├─ GND → GND
└─ IN  → GPIO 25

Buzzer:
├─ Positive → GPIO 26
└─ Negative → GND

LED Indicator:
├─ Anode (+) → GPIO 27 (with 220Ω resistor)
└─ Cathode (-) → GND
```

### 2. Install Required Library

1. Open Arduino IDE
2. Go to: **Sketch → Include Library → Manage Libraries**
3. Search: **ArduinoJson**
4. Click **Install** (by Benoit Blanchon)

### 3. Configure WiFi

Open `gas_detector_esp32_httpclient.ino` and update:

```cpp
#define WIFI_SSID "Your_WiFi_Name"       // Line 19
#define WIFI_PASSWORD "Your_WiFi_Password"  // Line 20
```

### 4. Upload Code

1. Connect ESP32 via USB
2. Select board: **Tools → Board → ESP32 Dev Module**
3. Select port: **Tools → Port → COM#** (your ESP32 port)
4. Click **Upload** (→)

### 5. Monitor Status

1. Open **Tools → Serial Monitor**
2. Set baud rate: **115200**
3. You should see:
   ```
   Connecting to WiFi...
   Connected with IP: 192.168.x.x
   Smart Gas Detector Ready!
   Sending data to Firebase... Gas Level: 123 ppm
   ✓ Data sent successfully
   ```

---

## 🧪 **Testing**

### Test 1: Normal Operation

- Gas sensor reads ambient air
- Solenoid valve: OPEN (LOW)
- Buzzer: OFF
- LED: OFF
- Firebase updates every 5 seconds

### Test 2: Gas Leak Simulation

- Expose sensor to lighter gas (don't ignite!)
- When gas level > 400 ppm:
  - Solenoid valve: CLOSES (HIGH)
  - Buzzer: ON
  - LED: ON
  - Firebase: `isLeakDetected: true`

---

## 🔍 **Troubleshooting**

### Upload Error: "No DFU capable USB device available"

```
No DFU capable USB device available
Failed uploading: uploading error: exit status 74
```

**Solution (Try these in order):**

1. **Install USB Driver:**

   - Most ESP32 boards use **CH340G** or **CP2102** USB-to-Serial chips
   - **CH340G Driver:** https://sparks.gogo.co.nz/ch340.html
   - **CP2102 Driver:** https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers
   - Restart computer after installing

2. **Check USB Cable:**

   - Use a **data-capable** USB cable (not charge-only)
   - Try a different cable

3. **Select Correct Port:**

   - Arduino IDE: **Tools → Port → COM#**
   - The port appears when you plug in ESP32
   - If no port appears, driver issue (see step 1)

4. **Hold BOOT Button:**

   - Press and hold **BOOT** button on ESP32
   - Click **Upload** in Arduino IDE
   - When "Connecting..." appears, release BOOT

5. **Board Settings:**

   - Tools → Board → ESP32 Arduino → **ESP32 Dev Module**
   - Tools → Upload Speed → **115200**
   - Tools → Flash Frequency → **80MHz**

6. **Try Different USB Port:**

   - Use **USB 2.0** port instead of USB 3.0
   - Try rear ports on desktop (more stable power)

7. **Close Serial Monitor:**
   - Serial Monitor locks the port
   - Close it before uploading

### WiFi Connection Issues

```
Error: Connecting to WiFi...........
```

**Solution:**

- Check SSID and password
- Ensure 2.4GHz WiFi (ESP32 doesn't support 5GHz)
- Move closer to router

### Firebase Connection Issues

```
Error code: -1
Error: connection refused
```

**Solution:**

- Check Firebase Database URL
- Ensure database rules allow writes
- Verify internet connection

### Sensor Reading Issues

```
Gas Level: 0 ppm (always)
```

**Solution:**

- Check sensor wiring
- Allow 24-48 hours for MQ sensor preheat
- Verify GPIO 34 connection

---

## 📊 **Firebase REST API Reference**

### Update Data (PATCH)

```
URL: https://[PROJECT].firebaseio.com/gasDetector/status.json?auth=[API_KEY]
Method: PATCH
Body: {"gasLevel": 123, "isLeakDetected": false}
```

### Read Data (GET)

```
URL: https://[PROJECT].firebaseio.com/gasDetector/status.json?auth=[API_KEY]
Method: GET
```

### Delete Data (DELETE)

```
URL: https://[PROJECT].firebaseio.com/gasDetector/status.json?auth=[API_KEY]
Method: DELETE
```

---

## 📚 **Additional Resources**

- [ESP32 Arduino Core](https://docs.espressif.com/projects/arduino-esp32/)
- [ArduinoJson Documentation](https://arduinojson.org/)
- [Firebase REST API](https://firebase.google.com/docs/database/rest/start)
- [MQ-2 Sensor Datasheet](https://www.pololu.com/file/0J309/MQ2.pdf)

---

## 🎯 **Summary**

**Use `gas_detector_esp32_httpclient.ino`** for a simpler, more reliable solution that uses built-in libraries and Firebase REST API.

The deprecated Firebase ESP Client library is no longer needed! 🎉
