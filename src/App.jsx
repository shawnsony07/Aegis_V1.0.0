import React, { useState, useEffect } from 'react';
import { Activity, Moon, Sun } from 'lucide-react';
import LocationCard from './components/LocationCard';
import TelemetryCard from './components/TelemetryCard';
import ControlCard from './components/ControlCard';
import GeofenceMap from './components/GeofenceMap';
import LiveMap from './components/LiveMap';
import { useFirebaseTelemetry, setImmobilizerState } from './services/firebaseService';
import { initializeNotifications, sendBreachNotification, sendApproachNotification } from './services/notificationService';

function App() {
    const [telemetry, setTelemetry] = useState(null);
    const [connected, setConnected] = useState(false);
    const [immobilizerActive, setImmobilizerActive] = useState(false);
    const [hasNotifiedApproach, setHasNotifiedApproach] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // Apply / remove dark theme on the root element
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    useEffect(() => {
        initializeNotifications();
    }, []);

    // Initialize Firebase connection
    useEffect(() => {
        const { startListening } = useFirebaseTelemetry((newData) => {
            setTelemetry(newData);
            setConnected(true);
            if (newData && typeof newData.immoActive !== 'undefined') {
                setImmobilizerActive(newData.immoActive);
            }
        });
        const unsubscribe = startListening();
        return () => { if (unsubscribe) unsubscribe(); };
    }, []);

    const handleImmobilizerToggle = (newState) => {
        setImmobilizerActive(newState);
        setImmobilizerState(newState)
            .then(() => console.log(`Immobilizer ${newState ? 'ON' : 'OFF'}`))
            .catch((err) => console.error("Firebase error:", err));
    };

    if (!telemetry) {
        return (
            <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
                <p className="text-muted">Initializing Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="dashboard-title">
                    <Activity size={28} style={{ color: 'var(--accent-blue)' }} />
                    Aegis
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={() => setDarkMode(d => !d)}
                        title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            border: '1.5px solid var(--border-color)',
                            background: 'var(--bg-card)',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            transition: 'all 0.3s ease',
                            flexShrink: 0,
                        }}
                    >
                        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {/* Connection Pill */}
                    <div className={`connection-status ${!connected ? 'offline' : ''}`}>
                        <div className="status-dot pulse"></div>
                        {connected ? 'System Connected' : 'System Offline'}
                    </div>
                </div>
            </header>

            {/* Main Grid */}
            <div className="grid-layout">
                <LocationCard data={telemetry} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <TelemetryCard
                        voltage={telemetry.voltage}
                        ignitionOn={telemetry.ignitionOn}
                    />
                    <ControlCard
                        immobilizerActive={immobilizerActive}
                        onToggle={handleImmobilizerToggle}
                    />
                </div>

                {/* Full-width Live Map with real Geofencing */}
                <LiveMap
                    currentLat={telemetry.lat}
                    currentLng={telemetry.lng}
                    speed={telemetry.speed}
                    heading={telemetry.heading}
                    isImmobilized={immobilizerActive}
                    onGeofenceBreach={async (shouldImmobilize) => {
                        if (shouldImmobilize && !immobilizerActive) {
                            handleImmobilizerToggle(true);
                            await sendBreachNotification();
                            setHasNotifiedApproach(false);
                        }
                    }}
                    onPredictiveBreach={async (isPredicting) => {
                        if (isPredicting && !hasNotifiedApproach) {
                            setHasNotifiedApproach(true);
                            await sendApproachNotification();
                        } else if (!isPredicting && hasNotifiedApproach) {
                            setHasNotifiedApproach(false);
                        }
                    }}
                />
            </div>
        </div>
    );
}

export default App;
