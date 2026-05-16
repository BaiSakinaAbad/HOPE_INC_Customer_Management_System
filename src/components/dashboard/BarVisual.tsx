import React from 'react';

export const BarVisual: React.FC<{ value: number; max: number; color: string }> = ({ value, max, color }) => (
  <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: `${color}15`, overflow: 'hidden' }}>
    <div style={{ width: `${max > 0 ? (value / max) * 100 : 0}%`, height: '100%', borderRadius: '4px', backgroundColor: color, transition: 'width 0.6s ease' }} />
  </div>
);
