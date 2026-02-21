import React, { useState, useEffect } from 'react';

const SpeedGraph = ({ speed }) => {
    const [history, setHistory] = useState(Array(60).fill(0));

    useEffect(() => {
        const interval = setInterval(() => {
            setHistory(prev => {
                const newArr = [...prev.slice(1), speed];
                return newArr;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [speed]);

    const maxSpeed = Math.max(...history, 50); // Minimum scale height 50
    const w = 100; // SVG viewBox width, we will stretch it
    const h = 40;  // SVG viewBox height

    const points = history.map((val, i) => {
        const x = (i / 59) * w;
        const y = h - (val / maxSpeed) * (h - 5) - 2; // leaving a small padding
        return `${x},${y}`;
    }).join(' ');

    return (
        <div style={{ marginTop: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Speed History (60s)</div>
            <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '50px', display: 'block' }}>
                {/* Background grid */}
                <line x1="0" y1={h} x2={w} y2={h} stroke="var(--border-color)" strokeWidth="1" />
                
                <polyline
                    fill="none"
                    stroke="#D98845"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    points={points}
                />
                {/* Gradient Fill under line */}
                <polygon
                    fill="rgba(217, 136, 69, 0.15)"
                    points={`${w},${h} 0,${h} ${points}`}
                />
            </svg>
        </div>
    );
};

export default SpeedGraph;
