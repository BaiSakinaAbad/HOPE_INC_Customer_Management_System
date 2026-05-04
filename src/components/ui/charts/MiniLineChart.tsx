import React, { useState } from 'react';

export interface LinePoint { label: string; value: number }

export const MiniLineChart: React.FC<{ points: LinePoint[]; color: string; isDark: boolean }> = ({ points, color, isDark }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  if (points.length === 0) return null;

  const maxVal = Math.max(...points.map(p => p.value), 1) * 1.15; // 15% headroom
  const height = 140; // Increased height for better visibility
  
  // Calculate coordinates in percentages (0 to 100)
  const coords = points.map((p, i) => ({
    x: points.length > 1 ? (i / (points.length - 1)) * 100 : 50,
    y: 100 - (p.value / maxVal) * 100, 
  }));

  // Build a very smooth cubic bezier curve path
  let linePath = `M${coords[0].x},${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const cur = coords[i];
    const cpx1 = prev.x + (cur.x - prev.x) * 0.4;
    const cpx2 = prev.x + (cur.x - prev.x) * 0.6;
    linePath += ` C${cpx1},${prev.y} ${cpx2},${cur.y} ${cur.x},${cur.y}`;
  }

  const fillPath = `${linePath} L100,100 L0,100 Z`;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
      <div style={{ display: 'flex', width: '100%', height: `${height}px`, position: 'relative' }}>
        
        {/* Y-axis labels */}
        <div style={{ 
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between', 
          paddingRight: '16px', color: isDark ? '#6b7280' : '#9ca3af', 
          fontSize: '11px', fontWeight: 600, fontFamily: "'Inter', sans-serif" 
        }}>
          <span>${Math.round(maxVal).toLocaleString()}</span>
          <span>${Math.round(maxVal / 2).toLocaleString()}</span>
          <span>$0</span>
        </div>

        {/* Chart Area */}
        <div style={{ flex: 1, position: 'relative' }}>
          
          {/* Subtle Horizontal Grid Lines */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }} />

          {/* SVG Line & Fill */}
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible', position: 'absolute', top: 0, left: 0 }}>
            <defs>
              <filter id={`glow-${color.replace(/[^a-zA-Z0-9]/g, '')}`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            
            {/* Glowing Line */}
            <path 
              d={linePath} 
              fill="none" 
              stroke={color} 
              strokeWidth="3.5" 
              vectorEffect="non-scaling-stroke" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              filter={`url(#glow-${color.replace(/[^a-zA-Z0-9]/g, '')})`} 
            />
          </svg>

          {/* Vertical grid lines & invisible hover zones */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'space-between' }}>
            {coords.map((c, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${c.x}%`,
                  top: 0, bottom: 0,
                  width: '20px',
                  transform: 'translateX(-50%)',
                  cursor: 'pointer',
                  zIndex: 10,
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Vertical dash line on hover */}
                {hovered === i && (
                  <div style={{ 
                    position: 'absolute', left: '50%', top: 0, bottom: 0, 
                    borderLeft: `1px dashed ${color}88`, transform: 'translateX(-50%)' 
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* Data Points (Dots) */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {coords.map((c, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${c.x}%`,
                  top: `${c.y}%`,
                  width: '10px', height: '10px',
                  transform: 'translate(-50%, -50%)',
                  borderRadius: '50%',
                  backgroundColor: isDark ? '#0d1834' : '#fff', // Match card background
                  border: `2px solid ${color}`,
                  zIndex: 10,
                  transition: 'all 0.2s',
                  boxShadow: hovered === i ? `0 0 15px ${color}` : 'none',
                  ...(hovered === i ? { transform: 'translate(-50%, -50%) scale(1.5)', backgroundColor: color } : {})
                }}
              />
            ))}
          </div>

          {/* Tooltip */}
          {hovered !== null && coords[hovered] && (
            <div style={{
              position: 'absolute',
              left: `${coords[hovered].x}%`,
              top: `calc(${coords[hovered].y}% - 35px)`,
              transform: 'translateX(-50%)',
              backgroundColor: isDark ? '#1e2330' : '#1a1a2e', color: '#fff',
              padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
              whiteSpace: 'nowrap', zIndex: 20, pointerEvents: 'none',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}>
              ${points[hovered].value.toLocaleString()}
              <div style={{
                position: 'absolute', bottom: '-5px', left: '50%', transform: 'translateX(-50%)',
                width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
                borderTop: `6px solid ${isDark ? '#1e2330' : '#1a1a2e'}`,
              }} />
            </div>
          )}
        </div>
      </div>

       {/* X-axis labels */}
      <div style={{ display: 'flex', width: '100%', paddingLeft: '48px' /* Align with chart area approx */ }}>
        <div style={{ flex: 1, position: 'relative', height: '16px' }}>
           {coords.map((c, i) => (
             <span key={i} style={{ 
               position: 'absolute', left: `${c.x}%`, transform: 'translateX(-50%)',
               fontSize: '12px', color: color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' 
             }}>
               {points[i].label}
             </span>
           ))}
        </div>
      </div>
    </div>
  );
};
