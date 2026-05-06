import React, { useState } from 'react';

export interface BarItem { label: string; value: number; color: string }

export const MiniBarChart: React.FC<{ bars: BarItem[]; isDark: boolean }> = ({ bars, isDark }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const maxVal = Math.max(...bars.map(b => b.value), 1);

  //Bar Chart
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '70px', width: '100%', position: 'relative' }}>
      {bars.map((bar, i) => {
        const heightPct = (bar.value / maxVal) * 100;
        return (
          <div
            key={i}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative' }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Tooltip */}
            {hovered === i && (
              <div style={{
                position: 'absolute', bottom: `calc(${heightPct}% + 12px)`, left: '50%', transform: 'translateX(-50%)',
                backgroundColor: isDark ? '#1e2330' : '#1a1a2e', color: '#fff',
                padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                whiteSpace: 'nowrap', zIndex: 10, pointerEvents: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}>
                {bar.label}: {bar.value.toLocaleString()}
                <div style={{
                  position: 'absolute', bottom: '-5px', left: '50%', transform: 'translateX(-50%)',
                  width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
                  borderTop: `5px solid ${isDark ? '#1e2330' : '#1a1a2e'}`,
                }} />
              </div>
            )}
            {/* Bar */}
            <div style={{
              width: '100%', maxWidth: '48px',
              height: `${Math.max(heightPct, 6)}%`,
              backgroundColor: hovered === i ? bar.color : `${bar.color}cc`,
              borderRadius: '6px 6px 2px 2px',
              transition: 'height 0.6s cubic-bezier(.4,0,.2,1), background-color 0.2s ease',
              cursor: 'pointer',
              boxShadow: hovered === i ? `0 0 12px ${bar.color}55` : 'none',
            }} />
            {/* Label */}
            <span style={{ fontSize: '10px', color: isDark ? '#8b94a5' : '#6b7280', marginTop: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {bar.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
