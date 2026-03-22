import React, { useState, memo } from 'react';

const LiveBackground = memo(() => {
  const [particles] = useState(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDelay: Math.random() * 15,
      size: Math.random() * 3 + 2,
      color: ['#00D4FF', '#6366F1', '#10B981'][Math.floor(Math.random() * 3)]
    }));
  });

  return (
    <div className="bg-effects">
      <div className="bg-grid" />
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />
      <div className="bg-particles">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.animationDelay}s`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              boxShadow: `0 0 6px ${p.color}`
            }}
          />
        ))}
      </div>
      <div className="bg-scan-line" />
    </div>
  );
});

LiveBackground.displayName = 'LiveBackground';

export default LiveBackground;
