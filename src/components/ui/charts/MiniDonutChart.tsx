import React, { useState } from 'react';

export interface DonutSegment { label: string; value: number; color: string }

export const MiniDonutChart: React.FC<{ segments: DonutSegment[]; size?: number; isDark: boolean }> = ({ segments, size = 80, isDark }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  let cumulativeOffset = 0;
  //Pie Chart
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '16px' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
        {/* Background circle */}
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke={isDark ? '#1a1f2e' : '#f3f4f6'} strokeWidth={strokeWidth} />
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dashLen = pct * circumference;
          const gapLen = circumference - dashLen;
          const offset = cumulativeOffset;
          cumulativeOffset += dashLen;
          return (
            <circle
              key={i}
              cx={cx} cy={cy} r={radius}
              fill="none"
              stroke={hovered === i ? seg.color : `${seg.color}cc`}
              strokeWidth={hovered === i ? strokeWidth + 3 : strokeWidth}
              strokeDasharray={`${dashLen} ${gapLen}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-width 0.2s ease, stroke 0.2s ease', cursor: 'pointer' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
        {/* Center text */}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
          style={{ transform: 'rotate(90deg)', transformOrigin: `${cx}px ${cy}px`, fontSize: '14px', fontWeight: 700, fill: isDark ? '#fff' : '#1a1a2e' }}>
          {total.toLocaleString()}
        </text>
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {segments.map((seg, i) => (
          <div
            key={i}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', position: 'relative' }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: isDark ? '#8b94a5' : '#6b7280', fontWeight: 500 }}>
              {seg.label}: <strong style={{ color: hovered === i ? seg.color : (isDark ? '#d1d5db' : '#374151') }}>{seg.value.toLocaleString()}</strong>
            </span>
            {/* Hover tooltip with percentage */}
            {hovered === i && (
              <span style={{
                position: 'absolute', left: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)',
                backgroundColor: isDark ? '#1e2330' : '#1a1a2e', color: '#fff',
                padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                whiteSpace: 'nowrap', zIndex: 10, pointerEvents: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}>
                {((seg.value / total) * 100).toFixed(1)}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
