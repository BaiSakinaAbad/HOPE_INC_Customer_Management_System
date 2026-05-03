import React from 'react';
import { Info } from 'lucide-react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';
import { MiniBarChart } from './charts/MiniBarChart';
import { MiniLineChart } from './charts/MiniLineChart';
import { MiniDonutChart } from './charts/MiniDonutChart';

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
  /** When false, only the active count is shown. Defaults to true. */
  showInactiveCount?: boolean;
  /** Chart type for the stats card. Defaults to 'bar'. */
  chartType?: 'bar' | 'line' | 'none';
  /** Custom data points for the line chart. If provided, overrides the default stats points. */
  linePoints?: { label: string; value: number }[];
}



/* ─── Main component ─── */
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
}) => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);

  const safeActive   = activeCount   ?? 0;
  const safeInactive = inactiveCount ?? 0;

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '28px', fontWeight: 800, color: isDark ? '#fff' : '#1a1a2e', margin: '0 0 8px', lineHeight: 1.1 }}>
            {title}
          </h2>
          <p style={{ fontSize: '14px', color: C.onSurfaceVariant, margin: 0, lineHeight: 1.5, maxWidth: '600px' }}>
            {description}
            {note && (
              <>
                <br />
                <span style={{ fontSize: '12.5px', opacity: 0.8, fontStyle: 'italic' }}>{note}</span>
              </>
            )}
          </p>
        </div>
        {actions && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            {actions}
          </div>
        )}
      </div>

      {/* Dashboard Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Stats Card - Bar Chart */}
        <div style={{
          backgroundColor: isDark ? 'rgb(13, 24, 52)' : '#ffffff',
          borderRadius: '16px', padding: '28px',
          border: isDark ? '1px solid rgba(255,255,255,0.03)' : `1px solid ${C.outlineVariant}33`,
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.02)',
          display: 'flex', flexDirection: 'column',
          minHeight: '220px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
             <div style={{ color: '#a1a9fe' }}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
             </div>
             <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7e85cc' }}>
               {statsTitle || 'LIVE ACCOUNTS'}
             </span>
          </div>
          
          <span style={{ fontSize: '13px', color: isDark ? '#8b94a5' : C.onSurfaceVariant, marginBottom: '6px', fontWeight: 500 }}>
            Total Accounts
          </span>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '42px', fontWeight: 700, color: isDark ? '#a1a9fe' : '#1a1a2e', lineHeight: 1 }}>
            {totalCount.toLocaleString()}
          </span>

          {chartType !== 'none' && (
            <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
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

        {/* Inactive Card - Pie Chart  */}
        {showInactiveCount && inactiveCount !== undefined && (
          <div style={{
            backgroundColor: isDark ? 'rgb(13, 24, 52)' : '#ffffff',
            borderRadius: '16px', padding: '28px',
            border: isDark ? '1px solid rgba(255,255,255,0.03)' : `1px solid ${C.outlineVariant}33`,
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.02)',
            display: 'flex', flexDirection: 'column',
            minHeight: '220px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
               <div style={{ color: '#ff5f74' }}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="23" y2="12"/><line x1="23" y1="8" x2="19" y2="12"/></svg>
               </div>
               <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ff5f74' }}>
                 Account Status
               </span>
            </div>
            
            <span style={{ fontSize: '13px', color: isDark ? '#8b94a5' : C.onSurfaceVariant, marginBottom: '6px', fontWeight: 500 }}>
              Inactive (Last 30 Days)
            </span>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '42px', fontWeight: 700, color: '#ff5f74', lineHeight: 1 }}>
              {inactiveCount.toLocaleString()}
            </span>
            
            {chartType !== 'none' && (
              <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
                <MiniDonutChart
                  isDark={isDark}
                  segments={[
                    { label: 'Active', value: safeActive, color: '#22c55e' },
                    { label: 'Inactive', value: safeInactive, color: '#ff5f74' },
                  ]}
                />
              </div>
            )}
          </div>
        )}

        {/* Access Policy Card — no graph */}
        <div style={{
          backgroundColor: isDark ? 'rgb(13, 24, 52)' : '#ffffff',
          borderRadius: '16px', padding: '28px',
          border: isDark ? '1px solid rgba(255,255,255,0.03)' : `1px solid ${C.outlineVariant}33`,
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.02)',
          display: 'flex', flexDirection: 'column',
          minHeight: '220px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
             <div style={{ color: '#17c3b2' }}>
               <Info size={24} />
             </div>
             <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#17c3b2' }}>
               ACCESS POLICY
             </span>
          </div>
          
          <span style={{ fontSize: '13px', color: isDark ? '#8b94a5' : C.onSurfaceVariant, marginBottom: '6px', fontWeight: 500 }}>
            Current Role Access
          </span>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '36px', fontWeight: 700, color: '#17c3b2', lineHeight: 1, marginBottom: '12px' }}>
            {roleDisplay}
          </span>
          
          <div style={{ marginTop: 'auto' }}>
            {allowedActions && allowedActions.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {allowedActions.map((action, i) => (
                  <span key={i} style={{
                    fontSize: '11px', fontWeight: 600, padding: '4px 10px',
                    backgroundColor: isDark ? 'rgba(23, 195, 178, 0.1)' : 'rgba(23, 195, 178, 0.05)',
                    color: '#17c3b2', borderRadius: '8px',
                    border: '1px solid rgba(23, 195, 178, 0.2)'
                  }}>
                    {action}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: isDark ? '#8b94a5' : C.onSurfaceVariant, margin: 0, lineHeight: 1.5 }}>
                {policyDescription}
              </p>
            )}
          </div>
        </div>

      </div>
    </>
  );
};
