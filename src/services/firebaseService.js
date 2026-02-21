import { ref, onValue, set } from "firebase/database";
import { database } from "../firebaseConfig.js";

export const useFirebaseTelemetry = (callback) => {
    const startListening = () => {
        const telemetryRef = ref(database, 'CRABS_vehicle_live');

        const unsubscribe = onValue(telemetryRef, (snapshot) => {
            const data = snapshot.val();

            if (data) {
                const immoActive = data.vehicle_commands && data.vehicle_commands.immo_active === true;
                callback({
                    voltage: data.battery_v || 0,
                    ignitionOn: data.ignition === "ON" || data.ignition === "ON ",
                    lat: data.latitude || 0,
                    lng: data.longitude || 0,
                    speed: data.speed_kmh || 0,
                    heading: data.heading || data.course || 0,
                    cellularNetwork: data.network_operator || "N/A",
                    signalStrength: data.signal_strength || 0,
                    frameNumber: data.frame_number || 0,
                    immobilizerStatus: data.immobilizer || "UNKNOWN",
                    immoActive: immoActive,
                    timestamp: new Date().toISOString()
                });
            } else {
                callback({
                    voltage: 0,
                    ignitionOn: false,
                    lat: 0,
                    lng: 0,
                    speed: 0,
                    heading: 0,
                    cellularNetwork: "N/A",
                    signalStrength: 0,
                    frameNumber: 0,
                    immobilizerStatus: "UNKNOWN",
                    immoActive: false,
                    timestamp: new Date().toISOString()
                });
            }
        }, (error) => {
            console.error("Firebase Read Error:", error);
        });

        return unsubscribe;
    };

    return { startListening };
};

export const setImmobilizerState = (isActive) => {
    const immobilizerRef = ref(database, 'CRABS_vehicle_live/vehicle_commands/immo_active');
    return set(immobilizerRef, isActive);
};
