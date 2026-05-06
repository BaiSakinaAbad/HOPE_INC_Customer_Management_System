import React from 'react';
import { Info } from 'lucide-react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';
import { MiniBarChart } from './charts/MiniBarChart';
import { MiniLineChart } from './charts/MiniLineChart';
import { MiniDonutChart } from './charts/MiniDonutChart';

/**Fixed Merge Conflicts */

export interface DashboardHeaderProps {
  title: string;
  description: React.ReactNode;
  note?: React.ReactNode;
  actions?: React.ReactNode;
  statsTitle: string;
  totalCount: number;
  activeCount?: number;
  inactiveCount?: number;
  roleDisplay: string;
  policyDescription: React.ReactNode;
  allowedActions?: string[];
  /** When false, only the active count is shown (no inactive dot). Defaults to true. */
  showInactiveCount?: boolean;
  /** Chart type for the stats card. Defaults to 'bar'. */
  chartType?: 'bar' | 'line' | 'none';
  /** Custom data points for the line chart. If provided, overrides the default stats points. */
  linePoints?: { label: string; value: number }[];
  /** When false, the entire stats card is hidden. Defaults to true. */
  showStatsCard?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  description,
  note,
  actions,
  statsTitle,
  totalCount,
  activeCount,
  inactiveCount,
  roleDisplay,
  policyDescription,
  allowedActions,
  showInactiveCount = true,
  chartType = 'bar',
  linePoints,
  showStatsCard = true,
}) => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);

  // Safety checks for numeric values
  const safeActive = activeCount ?? 0;
  const safeInactive = inactiveCount ?? 0;

  return (
    <>
      {/* Header Row: Title, Description and Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px', marginBottom: '24px' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '28px', fontWeight: 800, color: isDark ? '#fff' : '#1a1a2e', margin: '0 0 6px', lineHeight: 1.1 }}>
            {title}
          </h2>
          {description && (
            <p style={{ fontSize: '14px', color: C.onSurfaceVariant, margin: '0 0 6px', lineHeight: 1.5, maxWidth: '600px' }}>
              {description}
            </p>
          )}
          {note && (
            <p style={{ fontSize: '12.5px', color: C.onSurfaceVariant, margin: 0, opacity: 0.8, fontStyle: 'italic', lineHeight: 1.5, maxWidth: '600px' }}>
              {note}
            </p>
          )}
        </div>
        {actions && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            {actions}
          </div>
        )}
      </div>

      {/* Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Access Policy Card */}
        <div style={{
          backgroundColor: isDark ? 'rgb(13, 24, 52)' : '#ffffff',
          borderRadius: '16px', padding: '24px',
          border: isDark ? '1px solid rgba(255,255,255,0.03)' : `1px solid ${C.outlineVariant}33`,
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.02)',
          display: 'flex', alignItems: 'flex-start', gap: '20px',
        }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
            backgroundColor: isDark ? 'rgba(23, 195, 178, 0.15)' : 'rgba(23, 195, 178, 0.08)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Info size={24} style={{ color: '#17c3b2' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '18px', fontWeight: 700, color: '#17c3b2', margin: '0 0 6px' }}>
              Access Policy
            </h3>
            <p style={{ fontSize: '13px', color: C.onSurfaceVariant, margin: '0 0 8px', lineHeight: 1.5 }}>
              You are currently operating under <strong style={{ color: isDark ? '#fff' : '#1a1a2e' }}>{roleDisplay} Access</strong>.
            </p>
            {allowedActions && allowedActions.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                {allowedActions.map((action, i) => (
                  <span key={i} style={{
                    fontSize: '11px', fontWeight: 600, padding: '4px 8px',
                    backgroundColor: isDark ? 'rgba(23, 195, 178, 0.1)' : 'rgba(23, 195, 178, 0.05)',
                    color: '#17c3b2', borderRadius: '8px',
                    border: '1px solid rgba(23, 195, 178, 0.2)'
                  }}>
                    {action}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Card */}
        {showStatsCard && (
          <div style={{
            backgroundColor: isDark ? 'rgb(13, 24, 52)' : '#ffffff',
            borderRadius: '16px', padding: '20px',
            border: isDark ? '1px solid rgba(255,255,255,0.03)' : `1px solid ${C.outlineVariant}33`,
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.02)',
            display: 'flex', flexDirection: 'column',
            minHeight: '140px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
               <div style={{ color: '#a1a9fe' }}>
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
               </div>
               <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7e85cc' }}>
                 {statsTitle || 'LIVE ACCOUNTS'}
               </span>
            </div>
            
            <span style={{ fontSize: '12px', color: isDark ? '#8b94a5' : C.onSurfaceVariant, marginBottom: '4px', fontWeight: 500 }}>
              Total Count
            </span>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '28px', fontWeight: 700, color: isDark ? '#a1a9fe' : '#1a1a2e', lineHeight: 1 }}>
              {totalCount.toLocaleString()}
            </span>

            {chartType !== 'none' && (
              <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                {chartType === 'line' ? (
                  <MiniLineChart
                    isDark={isDark}
                    color="rgb(161, 169, 254)"
                    points={linePoints || [
                      { label: 'Total', value: totalCount },
                      ...(activeCount !== undefined ? [{ label: 'Active', value: safeActive }] : []),
                      ...(showInactiveCount && inactiveCount !== undefined ? [{ label: 'Inactive', value: safeInactive }] : []),
                    ]}
                  />
                ) : (
                  <MiniBarChart
                    isDark={isDark}
                    bars={[
                      { label: 'Total', value: totalCount, color: '#a1a9fe' },
                      ...(activeCount !== undefined ? [{ label: 'Active', value: safeActive, color: '#22c55e' }] : []),
                      ...(showInactiveCount && inactiveCount !== undefined ? [{ label: 'Inactive', value: safeInactive, color: '#ff5f74' }] : []),
                    ]}
                  />
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
};