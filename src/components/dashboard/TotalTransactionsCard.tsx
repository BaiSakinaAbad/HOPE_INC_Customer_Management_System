import React from 'react';
import { TrendingUp } from 'lucide-react';
import { getDashboardTokens } from '../../providers/ThemeProvider';
import type { DashboardFilter } from './types';
import { MiniLineChart } from '../ui/charts/MiniLineChart';

export const TotalTransactionsCard: React.FC<{
  totalCount: number;
  points: { label: string; value: number }[];
  isDark: boolean;
  C: ReturnType<typeof getDashboardTokens>;
  onFilter: (dateLabel: string) => void;
  currentFilter: DashboardFilter;
}> = ({ totalCount, points, isDark, C, onFilter, currentFilter }) => {
  const selectedIndex = currentFilter.type === 'DATE'
    ? points.findIndex(p => p.label === currentFilter.label)
    : null;

  return (
    <div style={{
      flex: '1 1 260px',
      backgroundColor: isDark ? 'rgb(13, 24, 52)' : '#ffffff',
      borderRadius: '16px', padding: '20px',
      border: isDark ? '1px solid rgba(255,255,255,0.03)' : `1px solid ${C.outlineVariant}33`,
      boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.02)',
      display: 'flex', flexDirection: 'column',
      minHeight: '140px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ color: C.primary }}>
          <TrendingUp size={18} />
        </div>
        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.primary }}>
          TOTAL TRANSACTIONS
        </span>
      </div>
      <span style={{ fontSize: '12px', color: isDark ? '#8b94a5' : C.onSurfaceVariant, marginBottom: '4px', fontWeight: 500 }}>
        All-time Transactions
      </span>
      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '28px', fontWeight: 700, color: isDark ? C.primary : '#1a1a2e', lineHeight: 1 }}>
        {totalCount.toLocaleString()}
      </span>
      <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
        <MiniLineChart
          isDark={isDark}
          color={C.primary}
          points={points}
          onPointClick={(i) => onFilter(points[i].label)}
          selectedIndex={selectedIndex === -1 ? null : selectedIndex}
        />
      </div>
    </div>
  );
};
