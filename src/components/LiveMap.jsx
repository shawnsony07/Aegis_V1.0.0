import React, { useEffect, useRef, useState } from 'react';
import { Map as MapIcon } from 'lucide-react';

const GEOFENCE_CENTER = [10.06, 76.62];
const GEOFENCE_RADIUS_M = 500;

const distMetres = (lat1, lng1, lat2, lng2) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2
        + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
        * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const calcPredictedLocation = (lat, lng, speed, heading, seconds) => {
    if (!lat || !lng || !speed) return [lat, lng];
    const R = 6371000;
    const d = (speed * 1000 / 3600) * seconds; // Distance in meters
    const brng = heading * Math.PI / 180;
    const lat1 = lat * Math.PI / 180;
    const lng1 = lng * Math.PI / 180;

    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d / R) + Math.cos(lat1) * Math.sin(d / R) * Math.cos(brng));
    const lng2 = lng1 + Math.atan2(Math.sin(brng) * Math.sin(d / R) * Math.cos(lat1), Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat2));

    return [lat2 * 180 / Math.PI, lng2 * 180 / Math.PI];
};

const vehicleIcon = (L, color) => L.divIcon({
    html: `<div style="width:16px;height:16px;background:${color};border:3px solid #fff;border-radius:50%;box-shadow:0 0 10px ${color}aa;"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    className: '',
});

const LiveMap = ({ currentLat, currentLng, speed = 0, heading = 0, isImmobilized, onGeofenceBreach, onPredictiveBreach }) => {
    const mapContainerRef = useRef(null);
    const mapInstance = useRef(null);
    const markerRef = useRef(null);
    const circleRef = useRef(null);
    const predictionLineRef = useRef(null);
    const [mapError, setMapError] = useState(false);

    useEffect(() => {
        const L = window.L;
        if (!L) {
            setMapError(true);
            return;
        }
        if (mapInstance.current) return;

        try {
            mapInstance.current = L.map(mapContainerRef.current, {
                center: GEOFENCE_CENTER,
                zoom: 16,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
            }).addTo(mapInstance.current);

            circleRef.current = L.circle(GEOFENCE_CENTER, {
                radius: GEOFENCE_RADIUS_M,
                color: '#50805F',
                fillColor: '#50805F',
                fillOpacity: 0.08,
                weight: 2,
                dashArray: '6 4',
            }).addTo(mapInstance.current);

            L.circleMarker(GEOFENCE_CENTER, {
                radius: 5, color: '#7A6356', fillColor: '#7A6356', fillOpacity: 1,
            }).addTo(mapInstance.current).bindTooltip('HQ Centre');

            markerRef.current = L.marker(
                [currentLat || GEOFENCE_CENTER[0], currentLng || GEOFENCE_CENTER[1]],
                { icon: vehicleIcon(L, '#C66E43') }
            ).addTo(mapInstance.current).bindPopup('🚗 Vehicle');

        } catch (e) {
            console.error('Map init error:', e);
            setMapError(true);
        }

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const L = window.L;
        if (!L || !mapInstance.current || !markerRef.current || !currentLat || !currentLng) return;

        markerRef.current.setLatLng([currentLat, currentLng]);

        const dist = distMetres(GEOFENCE_CENTER[0], GEOFENCE_CENTER[1], currentLat, currentLng);
        const breached = dist > GEOFENCE_RADIUS_M;

        let markerColor = '#C66E43'; // Default Amber
        if (breached) markerColor = '#BD4C45'; // Red

        const fenceColor = breached ? '#BD4C45' : '#50805F';
        circleRef.current.setStyle({ color: fenceColor, fillColor: fenceColor });
        markerRef.current.setIcon(vehicleIcon(L, markerColor));

        if (breached && !isImmobilized) onGeofenceBreach(true);

        // Predictive line drawing
        if (predictionLineRef.current) {
            mapInstance.current.removeLayer(predictionLineRef.current);
        }
        if (speed > 5) {
            const [predLat, predLng] = calcPredictedLocation(currentLat, currentLng, speed, heading, 30);
            predictionLineRef.current = L.polyline([
                [currentLat, currentLng],
                [predLat, predLng]
            ], {
                color: '#D98845',
                weight: 2,
                dashArray: '4 4'
            }).addTo(mapInstance.current);
        }

    }, [currentLat, currentLng, speed, heading, isImmobilized]);

    const dist = (currentLat && currentLng)
        ? distMetres(GEOFENCE_CENTER[0], GEOFENCE_CENTER[1], currentLat, currentLng)
        : 0;
    const isBreached = dist > GEOFENCE_RADIUS_M;

    const [predLat, predLng] = calcPredictedLocation(currentLat, currentLng, speed, heading, 30);
    const predDist = (predLat && predLng)
        ? distMetres(GEOFENCE_CENTER[0], GEOFENCE_CENTER[1], predLat, predLng)
        : 0;
    const isPredictiveBreach = !isBreached && (predDist > GEOFENCE_RADIUS_M) && speed > 5;

    useEffect(() => {
        if (onPredictiveBreach) {
            onPredictiveBreach(isPredictiveBreach);
        }
    }, [isPredictiveBreach, onPredictiveBreach]);

    let statusText = '✅ SECURE — INSIDE ZONE';
    let statusColor = 'var(--status-ok)';
    if (isBreached) {
        statusText = '⚠️ BREACHED — VEHICLE IMMOBILIZED';
        statusColor = 'var(--status-danger)';
    } else if (isPredictiveBreach) {
        statusText = '⚠️ WARNING: APPROACHING BOUNDARY (30s PREDICTION)';
        statusColor = '#D98845'; // Amber
    }

    return (
        <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-header" style={{ marginBottom: '0.75rem' }}>
                <MapIcon className="card-icon" size={18} />
                Live Map &amp; Geofencing
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: statusColor, textShadow: isPredictiveBreach ? '0px 0px 8px rgba(217, 136, 69, 0.4)' : 'none' }}>
                    {statusText}
                </span>
                <span className="data-label" style={{ fontSize: '0.8rem' }}>
                    {dist.toFixed(0)} m from centre · Fence: {GEOFENCE_RADIUS_M} m
                </span>
            </div>

            {mapError ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-dark)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    ⚠️ Map could not load. Please check your internet connection.
                </div>
            ) : (
                <div
                    ref={mapContainerRef}
                    style={{
                        width: '100%',
                        height: '380px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '1px solid var(--border-color)',
                        zIndex: 0,
                    }}
                />
            )}
        </div>
    );
};

export default LiveMap;
