# Python script for Arduino/ESP32 to send notifications
# Run this on a computer/server connected to your gas detector

import requests
import json
import firebase_admin
from firebase_admin import credentials, db
import time

# Initialize Firebase Admin SDK
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://your-project-id.firebaseio.com'
})

EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

def send_push_notification(push_token, title, body, data=None):
    """
    Send push notification via Expo Push Notification Service
    """
    if data is None:
        data = {}
    
    message = {
        'to': push_token,
        'sound': 'default',
        'title': title,
        'body': body,
        'data': data,
        'priority': 'high',
        'channelId': 'default',
    }
    
    try:
        response = requests.post(
            EXPO_PUSH_URL,
            headers={
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            json=message
        )
        response.raise_for_status()
        print(f'Push notification sent: {response.json()}')
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f'Error sending push notification: {e}')
        raise

def send_gas_leak_alert(push_token, gas_level, location='Unknown'):
    """
    Send gas leak alert notification
    """
    return send_push_notification(
        push_token,
        '⚠️ GAS LEAK DETECTED!',
        f'Gas level: {gas_level}ppm at {location}. Gas supply has been shut off. Evacuate immediately!',
        {
            'type': 'gas_leak',
            'gasLevel': gas_level,
            'location': location,
            'timestamp': int(time.time() * 1000),
        }
    )

def update_firebase_status(gas_level, is_leak_detected, location='Home'):
    """
    Update Firebase Realtime Database with current gas detector status
    """
    ref = db.reference('gasDetector/status')
    ref.set({
        'gasLevel': gas_level,
        'isLeakDetected': is_leak_detected,
        'location': location,
        'timestamp': int(time.time() * 1000),
    })
    print('Gas status updated in Firebase')

def monitor_gas_leaks():
    """
    Monitor Firebase for gas leak events and send notifications
    """
    gas_ref = db.reference('gasDetector/status')
    tokens_ref = db.reference('userTokens')
    
    def on_gas_status_change(event):
        data = event.data
        if data and data.get('isLeakDetected'):
            print('Gas leak detected! Sending notifications...')
            
            # Get all user tokens
            tokens = tokens_ref.get()
            
            if tokens:
                # Send notification to all registered devices
                for token in tokens.values():
                    try:
                        send_gas_leak_alert(
                            token,
                            data.get('gasLevel', 0),
                            data.get('location', 'Unknown')
                        )
                    except Exception as e:
                        print(f'Failed to send notification to {token}: {e}')
                
                print('All notifications sent successfully')
    
    # Listen for changes
    gas_ref.listen(on_gas_status_change)
    print('Monitoring for gas leaks...')
    
    # Keep the script running
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print('Monitoring stopped')

# For serial communication with Arduino/ESP32
def read_from_serial_and_update(serial_port='/dev/ttyUSB0', baud_rate=9600):
    """
    Read gas sensor data from Arduino/ESP32 via serial and update Firebase
    Requires: pip install pyserial
    """
    import serial
    
    ser = serial.Serial(serial_port, baud_rate, timeout=1)
    print(f'Connected to {serial_port}')
    
    try:
        while True:
            if ser.in_waiting > 0:
                line = ser.readline().decode('utf-8').strip()
                
                # Expected format: "GAS_LEVEL:500,LEAK:1,LOCATION:Kitchen"
                try:
                    parts = dict(item.split(':') for item in line.split(','))
                    gas_level = int(parts.get('GAS_LEVEL', 0))
                    is_leak = bool(int(parts.get('LEAK', 0)))
                    location = parts.get('LOCATION', 'Home')
                    
                    print(f'Gas Level: {gas_level}, Leak: {is_leak}, Location: {location}')
                    
                    # Update Firebase
                    update_firebase_status(gas_level, is_leak, location)
                    
                except Exception as e:
                    print(f'Error parsing serial data: {e}')
            
            time.sleep(0.1)
            
    except KeyboardInterrupt:
        print('Serial monitoring stopped')
    finally:
        ser.close()

if __name__ == '__main__':
    # Choose one of the following:
    
    # Option 1: Monitor Firebase and send notifications
    monitor_gas_leaks()
    
    # Option 2: Read from Arduino/ESP32 serial and update Firebase
    # read_from_serial_and_update('/dev/ttyUSB0', 9600)
    
    # Option 3: Manual test
    # update_firebase_status(gas_level=450, is_leak_detected=True, location='Kitchen')
