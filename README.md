### Project AEGIS 

**Advanced Embedded Gateway for Integrated Smart-Telematics**

Project AEGIS is a multi-processor telematics system designed for real-time vehicle monitoring, data acquisition, and remote immobilization. Developed for a 16-hour hardware hackathon, it features a distributed architecture that separates physical sensor data acquisition from cloud communication logic.

## 🚀 Overview

The system simulates an Electric Vehicle (EV) telematics unit. It acquires analog voltage (battery simulation) and digital signals (ignition status), packages them into a proprietary protocol, and transmits the data via MQTT to a live web dashboard.

## 🏗️ System Architecture

The project is divided into three primary hardware stages:

1. **Data Acquisition (Arduino Uno):**
* Reads physical inputs (Potentiometer for AI, Push Button for DI).
* Interfaces with the Immobilizer relay (DO).
* Sends raw sensor strings to the MCU via UART (level-shifted).


2. **Core Logic & Protocol (XIAO ESP32-C6):**
* Acts as the **MCU Master**.
* Implements the **Table 5.1 Packet Structure**.
* Calculates the **8-bit XOR CRC** for data integrity.
* Manages hard-coded GPS coordinates and GSM network information.


3. **Communication Gateway (XIAO ESP32-S3):**
* Acts as the **I2C Slave** bridge.
* Handles **Wi-Fi Connectivity** and **MQTT Publishing**.
* Receives remote "Immobilize" commands from the server and pushes them back down the chain.



## 📋 Features

* **Real-time Monitoring:** Tracking of Analog Voltage (0V-5V) and Ignition status.
* **Two-Way Control:** Remote motor immobilization via digital output.
* **Custom Protocol:** Implementation of a specific packet structure ($Header...Data...*CRC).
* **Power Optimization:** Logic-based low power modes triggered by ignition status.
* **Geo-fencing:** Polygon-based coordinate validation (Phase 6).

## 🔧 Hardware Requirements

* 1x Arduino Uno
* 1x Seeed Studio XIAO ESP32-C6 (MCU)
* 1x Seeed Studio XIAO ESP32-S3 (Communication)
* 1x 10k Potentiometer (Analog Input)
* 1x Push Button (Digital Input)
* 1x Logic Level Shifter (5V to 3.3V)
* 1x 5V Relay Module (Immobilizer simulation)

## 💻 Software & Libraries

* **Framework:** Arduino IDE / PlatformIO
* **Libraries:**
* `Wire.h` (I2C Communication)
* `PubSubClient.h` (MQTT Protocol)
* `WiFi.h` (Wireless Connectivity)



## 🛠️ Installation & Setup

1. **Clone the repository:**
```bash
git clone https://github.com/Sryshnav/Aegis_V1.0.0.git

```


2. **Board Manager:** Ensure you have the **ESP32 by Espressif** board package installed in your Arduino IDE.
3. **Flash Order:**
* Upload `Arduino_Sensing.ino` to the Uno.
* Upload `MCU_Logic_C6.ino` to the XIAO C6.
* Upload `Comm_Gateway_S3.ino` to the XIAO S3.


4. **Configuration:** Update your Wi-Fi credentials and MQTT Broker IP in the `Comm_Gateway_S3.ino` file.

## 📊 Data Packet Structure (Table 5.1)

The system transmits data in the following format:
`$IMEI,PacketStatus,FrameNo,NetStrength,Voltage,Ignition,Lat,Long,Timestamp*CRC`


---
