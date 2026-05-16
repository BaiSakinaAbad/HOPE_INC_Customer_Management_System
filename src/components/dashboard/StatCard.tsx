import React from 'react';
import { getDashboardTokens } from '../../providers/ThemeProvider';

export const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: string;
  isDark: boolean;
  C: ReturnType<typeof getDashboardTokens>;
}> = ({ icon, label, value, accent, isDark, C }) => (
  <div style={{
    backgroundColor: isDark ? 'rgb(13, 24, 52)' : '#ffffff',
    borderRadius: '16px', padding: '20px',
    border: isDark ? '1px solid rgba(255,255,255,0.03)' : `1px solid ${C.outlineVariant}33`,
    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.02)',
    display: 'flex', flexDirection: 'column',
    minHeight: '140px',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
      <div style={{ color: accent }}>{icon}</div>
      <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: accent }}>
        {label}
      </span>
    </div>
    <span style={{ fontSize: '12px', color: isDark ? '#8b94a5' : C.onSurfaceVariant, marginBottom: '4px', fontWeight: 500 }}>
      All-time Total
    </span>
    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '28px', fontWeight: 700, color: isDark ? accent : '#1a1a2e', lineHeight: 1 }}>
      {value}
    </span>
  </div>
);
