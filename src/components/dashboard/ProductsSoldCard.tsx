import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { getDashboardTokens } from '../../providers/ThemeProvider';
import type { DashboardFilter } from './types';

export const ProductsSoldCard: React.FC<{
  totalCount: number;
  topProducts: { productCode: string; description: string; totalQuantity: number }[];
  isDark: boolean;
  C: ReturnType<typeof getDashboardTokens>;
  onFilter: (code: string, name: string) => void;
  currentFilter: DashboardFilter;
}> = ({ totalCount, topProducts, isDark, C, onFilter, currentFilter }) => {
  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#ec4899'];
  const maxQty = Math.max(...topProducts.map(p => p.totalQuantity), 1);

  return (
    <div style={{
      backgroundColor: isDark ? 'rgb(13, 24, 52)' : '#ffffff',
      borderRadius: '16px', padding: '20px',
      border: isDark ? '1px solid rgba(255,255,255,0.03)' : `1px solid ${C.outlineVariant}33`,
      boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.02)',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ color: '#f59e0b' }}><ShoppingBag size={18} /></div>
        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f59e0b' }}>PRODUCTS SOLD</span>
      </div>
      <span style={{ fontSize: '12px', color: isDark ? '#8b94a5' : C.onSurfaceVariant, marginBottom: '4px', fontWeight: 500 }}>Unique Products Total</span>
      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '28px', fontWeight: 700, color: isDark ? '#fbbf24' : '#1a1a2e', lineHeight: 1, marginBottom: '12px' }}>{totalCount.toLocaleString()}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
        {topProducts.map((p, i) => {
          const isSelected = currentFilter.type === 'PRODUCT' && currentFilter.code === p.productCode;
          return (
            <div
              key={p.description}
              onClick={(e) => { e.stopPropagation(); onFilter(p.productCode, p.description); }}
              style={{
                cursor: 'pointer', transition: 'all 0.2s',
                opacity: (currentFilter.type === 'PRODUCT' && !isSelected) ? 0.4 : 0.9,
                padding: '8px', borderRadius: '8px',
                backgroundColor: isSelected ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)') : 'transparent'
              }}
              onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.opacity = '1'; e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'; }}
              onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.opacity = (currentFilter.type === 'PRODUCT') ? '0.4' : '0.9'; e.currentTarget.style.backgroundColor = 'transparent'; } }}
            >
              <div style={{ fontSize: '10px', fontWeight: 600, color: isDark ? '#8b94a5' : C.onSurfaceVariant, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.description.length > 25 ? p.description.substring(0, 25) + '...' : p.description}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, height: '18px', borderRadius: '9px', backgroundColor: `${colors[i % colors.length]}15`, overflow: 'hidden' }}>
                  <div style={{ width: `${(p.totalQuantity / maxQty) * 100}%`, height: '100%', borderRadius: '4px', backgroundColor: colors[i % colors.length], transition: 'width 0.6s ease' }} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: colors[i % colors.length], minWidth: '28px', textAlign: 'right' }}>{p.totalQuantity}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
