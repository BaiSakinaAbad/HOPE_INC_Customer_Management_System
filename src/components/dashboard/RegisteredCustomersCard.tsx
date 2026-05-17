import React from 'react';
import { Users } from 'lucide-react';
import { getDashboardTokens } from '../../providers/ThemeProvider';

export const RegisteredCustomersCard: React.FC<{
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  isDark: boolean;
  C: ReturnType<typeof getDashboardTokens>;
}> = ({ totalCount, activeCount, inactiveCount, isDark, C }) => {
  return (
    <div
      style={{
        flex: '1 1 260px',
        backgroundColor: isDark ? 'rgb(13, 24, 52)' : '#ffffff',
        borderRadius: '16px', padding: '20px',
        border: isDark ? '1px solid rgba(255,255,255,0.03)' : `1px solid ${C.outlineVariant}33`,
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.02)',
        display: 'flex', flexDirection: 'column',
        minHeight: '140px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ color: '#8b5cf6' }}>
          <Users size={18} />
        </div>
        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8b5cf6' }}>
          REGISTERED CUSTOMERS
        </span>
      </div>
      <span style={{ fontSize: '12px', color: isDark ? '#8b94a5' : C.onSurfaceVariant, marginBottom: '4px', fontWeight: 500 }}>
        Customer Total
      </span>
      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '28px', fontWeight: 700, color: isDark ? '#8b5cf6' : '#1a1a2e', lineHeight: 1 }}>
        {totalCount.toLocaleString()}
      </span>
      <div style={{ display: 'flex', gap: '16px', marginTop: 'auto', paddingTop: '10px' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 8px', borderRadius: '6px', marginLeft: '-8px'
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
          <span style={{ fontSize: '11px', color: isDark ? '#8b94a5' : C.onSurfaceVariant, fontWeight: 500 }}>Active</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#22c55e' }}>{activeCount}</span>
        </div>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 8px', borderRadius: '6px', marginLeft: '-4px'
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff5f74' }} />
          <span style={{ fontSize: '11px', color: isDark ? '#8b94a5' : C.onSurfaceVariant, fontWeight: 500 }}>Inactive</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#ff5f74' }}>{inactiveCount}</span>
        </div>
      </div>
    </div>
  );
};
