import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const initializeNotifications = async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
        // Request Permission for Push Notifications
        let permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive === 'granted') {
            await PushNotifications.register();

            // Listeners for Push Notifications
            PushNotifications.addListener('registration', (token) => {
                console.log('Push registration success, token: ' + token.value);
                // In a real scenario, this token is sent to the backend/Firebase DB to register the device for server-side FCM.
            });

            PushNotifications.addListener('registrationError', (error) => {
                console.error('Error on registration: ' + JSON.stringify(error));
            });

            PushNotifications.addListener('pushNotificationReceived', (notification) => {
                console.log('Push received: ' + JSON.stringify(notification));
            });
        }

        // Also ensure Local Notifications permissions
        await LocalNotifications.requestPermissions();

    } catch (e) {
        console.error("Error initializing notifications", e);
    }
};

export const sendBreachNotification = async () => {
    if (!Capacitor.isNativePlatform()) {
        alert("⚠️ GEOFENCE BREACH DETECTED\nVehicle has exited the secure zone. Immobilizer has been activated.");
        return;
    }

    try {
        await LocalNotifications.schedule({
            notifications: [
                {
                    title: "⚠️ GEOFENCE BREACH DETECTED",
                    body: "Vehicle has exited the secure zone. Immobilizer has been activated.",
                    id: new Date().getTime(),
                    schedule: { at: new Date(Date.now() + 1000) },
                    sound: null,
                    attachments: null,
                    actionTypeId: "",
                    extra: null
                }
            ]
        });
    } catch (e) {
        console.error("Error sending local notification", e);
    }
};

export const sendApproachNotification = async () => {
    if (!Capacitor.isNativePlatform()) {
        alert("⚠️ WARNING: APPROACHING BOUNDARY\nVehicle is predicted to exit the secure zone in 30 seconds.");
        return;
    }

    try {
        await LocalNotifications.schedule({
            notifications: [
                {
                    title: "⚠️ WARNING: APPROACHING BOUNDARY",
                    body: "Vehicle is predicted to exit the secure zone in 30 seconds.",
                    id: new Date().getTime() + 1,
                    schedule: { at: new Date(Date.now() + 1000) },
                    sound: null,
                    attachments: null,
                    actionTypeId: "",
                    extra: null
                }
            ]
        });
    } catch (e) {
        console.error("Error sending local notification", e);
    }
};
