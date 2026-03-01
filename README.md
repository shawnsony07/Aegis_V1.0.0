# Project AEGIS

**Advanced Embedded Gateway for Integrated Smart-Telematics**

Project AEGIS is a comprehensive, multi-processor telematics system designed for real-time vehicle monitoring, data acquisition, cloud synchronization, and remote immobilization. Evolving from a hardware prototype to a full-stack IoT solution, it integrates distributed hardware nodes, a secure MQTT-Firebase bridge, and a cross-platform mobile/web application.

## 🚀 Overview

The system simulates an Electric Vehicle (EV) telematics unit. It acquires hardware signals (analog and digital, representing battery voltage, ignition status, speed, and steering), packages them into a proprietary protocol, and transmits the data via MQTT. A Python backend bridge syncs this live data to a Firebase Realtime Database, which powers a modern React-based mobile application acting as the command center.

## 🏗️ System Architecture

AEGIS is built on a robust three-tier architecture:

### 1. Hardware Nodes (Vajra)
The physical data acquisition and control units:
* **Sender Node (XIAO ESP32-S3) - `vajra_sender_code_v3.2.ino`**: 
  * Acts as the main MCU for data acquisition.
  * Interfaces with physical inputs (Ignition, Potentiometers/Joysticks for Speed/Steering).
  * Implements deep sleep modes triggered by ignition status for power optimization.
  * Communicates serially with the Receiver Node.
* **Receiver Node (XIAO ESP32-S3 Plus) - `vajra_receiver_code_v3.2.ino`**: 
  * Acts as the IoT Gateway and Communication Module.
  * Handles Wi-Fi connectivity and communicates with a secure MQTT broker.
  * Transmits telemetry and listens for remote commands (Immobilization, Update Rate, Geofence mapping).

### 2. Backend Bridge (CRABS Python Backend)
The `firebase-python-test.py` script acts as the bi-directional middleware:
* **Telemetry Sync**: Listens to the live MQTT stream (`crabs/telematics/live`) and parses the proprietary packet structure to update Firebase Realtime Database.
* **Command Dispatch**: Listens to Firebase triggers (from the mobile app) and publishes actionable MQTT commands (`LOCK`/`UNLOCK`, Polygons, Update rates) down to the hardware.
* **Alert Handling**: Monitors geofence breaches and synchronizes hardware override statuses.

### 3. Smart Telematics Application
A cross-platform dashboard built with **React** and **Vite**, packaged for Android using **Capacitor**:
* **Live Dashboard**: Displays real-time speed, battery voltage, ignition state, and geolocation.
* **Two-Way Control**: Toggle motor immobilization and tweak telemetry polling rates directly from the UI.
* **Tech Stack**: React 18, Vite, Firebase SDK, and `@capacitor/android`.

## 📋 Key Features

* **Real-Time Telemetry Tracking:** Live monitoring of Voltage, Ignition, Speed, and Steering.
* **Bi-Directional Remote Control:** Remote motor immobilization executed via the cloud and pushed to the physical hardware relay.
* **Dynamic Update Rates:** Adjust the polling rate from the app depending on usage needs.
* **Power Optimization:** Logic-based deep sleep modes enabled when ignition is off.
* **Geofencing capability:** Support for polygon-based coordinate boundaries and "breach" alerts.
* **Cross-Platform App:** Native Android experience via Capacitor and web deployment out-of-the-box.

## 💻 Tech Stack & Dependencies

* **Hardware**: C++ / Arduino IDE (Seeed Studio XIAO ESP32-S3 & XIAO ESP32-S3 Plus). Libraries: `Wire.h`, `WiFi.h`, MQTT clients.
* **Backend**: Python 3, `paho-mqtt`, `firebase-admin`.
* **Frontend/App**: React, Vite, Lucide React (Icons), Firebase JS SDK, Capacitor (Core, Android, Push Notifications).

## 🛠️ Installation & Setup

### 1. Hardware Flashing
* Install the **ESP32** board package in your Arduino IDE.
* Flash `vajra_sender_code_v3.2.ino` to the **XIAO ESP32-S3**.
* Flash `vajra_receiver_code_v3.2.ino` to the **XIAO ESP32-S3 Plus**.
* *Note: Ensure network credentials and MQTT endpoints are properly configured in the code.*

### 2. Backend Setup
```bash
# Install Python dependencies
pip install paho-mqtt firebase-admin

# Run the backend bridge (Ensure serviceAccountKey.json is present)
python firebase-python-test.py
```

### 3. Application Setup
```bash
# Install dependencies
npm install

# Run the local Vite dev server
npm run dev

# Build for web
npm run build

# Sync and open in Android Studio for native deployment
npx cap sync android
npx cap open android
```

## 📊 Data Packet Structure (Example)
The hardware nodes use a specific comma-separated payload structure that is unpacked by the backend, ensuring lightweight MQTT payloads over constrained networks.
Example payload fields translated:
`FrameNo, NetStrength, Voltage, Ignition, Lat, Long, Timestamp, ... *CRC`

---
*Created for robust telemetry, real-time control, and seamless IoT monitoring.*
