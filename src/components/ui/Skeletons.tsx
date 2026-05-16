import React from 'react';
import { useTheme, getDashboardTokens, type DashboardTokens } from '../../providers/ThemeProvider';

/**
 * Basic pulsing block skeleton
 */
export const Skeleton: React.FC<{ 
  width?: string | number; 
  height?: string | number; 
  borderRadius?: string | number;
  style?: React.CSSProperties;
  isDark?: boolean;
}> = ({ width = '100%', height = '20px', borderRadius = '4px', style, isDark }) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)',
        animation: 'skeleton-pulse 1.8s ease-in-out infinite',
        ...style,
      }}
    />
  );
};

/**
 * Skeleton for stat cards on the dashboard
 */
export const CardSkeleton: React.FC<{ isDark: boolean; C: DashboardTokens; height?: string }> = ({ isDark, C, height = '140px' }) => (
  <div style={{
    backgroundColor: isDark ? '#0d1834' : '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    border: isDark ? '1px solid rgba(255,255,255,0.03)' : `1px solid ${C.outlineVariant}33`,
    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.02)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minHeight: height,
    width: '100%'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Skeleton width="36px" height="36px" borderRadius="10px" isDark={isDark} />
      <Skeleton width="40%" height="14px" isDark={isDark} />
    </div>
    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Skeleton width="30%" height="12px" isDark={isDark} />
      <Skeleton width="60%" height="28px" isDark={isDark} />
    </div>
  </div>
);

/**
 * Skeleton for data tables
 */
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  
  return (
    <div style={{ 
      padding: '24px', 
      backgroundColor: isDark ? '#0d1834' : '#ffffff', 
      borderRadius: '16px', 
      border: isDark ? '1px solid rgba(255,255,255,0.03)' : `1px solid ${C.outlineVariant}33`,
      boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.02)',
      width: '100%'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Skeleton width="180px" height="24px" isDark={isDark} />
        <div style={{ display: 'flex', gap: '12px' }}>
          <Skeleton width="80px" height="32px" borderRadius="8px" isDark={isDark} />
          <Skeleton width="80px" height="32px" borderRadius="8px" isDark={isDark} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : `${C.outlineVariant}22`, borderRadius: '8px', overflow: 'hidden' }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', backgroundColor: isDark ? '#0d1834' : '#ffffff' }}>
            <Skeleton width="40px" height="40px" borderRadius="10px" isDark={isDark} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Skeleton width="40%" height="16px" isDark={isDark} />
              <Skeleton width="20%" height="12px" isDark={isDark} />
            </div>
            <Skeleton width="100px" height="20px" isDark={isDark} />
            <Skeleton width="80px" height="32px" borderRadius="8px" isDark={isDark} />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Full dashboard grid skeleton — Matches the 1:1:2 grid in DashboardReports
 */
export const DashboardSkeleton: React.FC = () => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 4-col stat grid matching DashboardReports.tsx line 276 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gridTemplateRows: 'auto auto', gap: '16px' }}>
        {/* Col 1 */}
        <div style={{ gridColumn: '1', gridRow: '1' }}>
          <CardSkeleton isDark={isDark} C={C} />
        </div>
        <div style={{ gridColumn: '1', gridRow: '2' }}>
          <CardSkeleton isDark={isDark} C={C} />
        </div>
        
        {/* Col 2 */}
        <div style={{ gridColumn: '2', gridRow: '1 / 3' }}>
          <CardSkeleton isDark={isDark} C={C} height="100%" />
        </div>
        
        {/* Col 3 */}
        <div style={{ gridColumn: '3', gridRow: '1 / 3' }}>
          <CardSkeleton isDark={isDark} C={C} height="100%" />
        </div>
      </div>

      {/* Main Report Section Skeletons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <div style={{ backgroundColor: isDark ? '#0d1834' : '#ffffff', borderRadius: '16px', border: isDark ? '1px solid rgba(255,255,255,0.03)' : `1px solid ${C.outlineVariant}33`, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : `1px solid ${C.outlineVariant}22` }}>
            <Skeleton width="140px" height="18px" isDark={isDark} />
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Skeleton width="60%" height="14px" isDark={isDark} />
                <Skeleton width="20%" height="14px" isDark={isDark} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: isDark ? '#0d1834' : '#ffffff', borderRadius: '16px', border: isDark ? '1px solid rgba(255,255,255,0.03)' : `1px solid ${C.outlineVariant}33`, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : `1px solid ${C.outlineVariant}22` }}>
            <Skeleton width="140px" height="18px" isDark={isDark} />
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Skeleton width="40%" height="12px" isDark={isDark} />
                  <Skeleton width="20%" height="12px" isDark={isDark} />
                </div>
                <Skeleton width="100%" height="8px" borderRadius="4px" isDark={isDark} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add animation to index.css or inject via style tag
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('skeleton-animation');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'skeleton-animation';
    style.innerHTML = `
      @keyframes skeleton-pulse {
        0% { opacity: 0.5; }
        50% { opacity: 1; }
        100% { opacity: 0.5; }
      }
    `;
    document.head.appendChild(style);
  }
}
