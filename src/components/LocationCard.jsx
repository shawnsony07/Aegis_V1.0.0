import React from 'react';
import { MapPin, Signal, Database } from 'lucide-react';
import Speedometer from './Speedometer';
import SpeedGraph from './SpeedGraph';
import SignalBars from './SignalBars';

const LocationCard = ({ data }) => {
  return (
    <div className="card">
      <div className="card-header">
        <MapPin className="card-icon" size={18} />
        Location &amp; Speed
      </div>

      {/* Speedometer */}
      <Speedometer speed={data.speed || 0} maxSpeed={200} />

      {/* Speed History Graph */}
      <SpeedGraph speed={data.speed || 0} />

      {/* Coordinates row */}
      <div className="data-row" style={{ marginTop: '1rem' }}>
        <span className="data-label">Coordinates</span>
        <span className="data-value font-mono">{data.lat}, {data.lng}</span>
      </div>

      <div className="card-header" style={{ marginTop: '1.5rem' }}>
        <Signal className="card-icon" size={18} />
        Cellular Info
      </div>
      <div className="data-row">
        <span className="data-label">Network</span>
        <span className="data-value">{data.cellularNetwork}</span>
      </div>
      <div className="data-row">
        <span className="data-label">Signal Strength</span>
        <span className="data-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SignalBars signal={data.signalStrength} maxSignal={31} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{data.signalStrength}/31</span>
        </span>
      </div>

      <div className="card-header" style={{ marginTop: '1.5rem' }}>
        <Database className="card-icon" size={18} />
        Packet Info
      </div>
      <div className="data-row">
        <span className="data-label">Timestamp (UTC)</span>
        <span className="data-value text-xs">{data.timestamp}</span>
      </div>
    </div>
  );
};

export default LocationCard;
