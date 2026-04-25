import React from 'react';
import { Info } from 'lucide-react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';

export interface DashboardHeaderProps {
  title: string;
  description: React.ReactNode;
  note?: React.ReactNode;
  actions?: React.ReactNode;
  statsTitle: string;
  totalCount: number;
  activeCount?: number;
  inactiveCount?: number;
  blockedCount?: number;
  roleDisplay: string;
  policyDescription: React.ReactNode;
  allowedActions?: string[];
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
  blockedCount,
  roleDisplay,
  policyDescription,
  allowedActions,
}) => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Total Customers Card */}
        <div style={{
          backgroundColor: isDark ? C.surfaceContainerHigh : '#ffffff',
          borderRadius: '16px', padding: '24px',
          border: `1px solid ${C.outlineVariant}33`,
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 10px rgba(0,0,0,0.02)',
          display: 'flex', flexDirection: 'column',
        }}>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.onSurfaceVariant, marginBottom: '8px' }}>
            {statsTitle}
          </span>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '42px', fontWeight: 800, color: isDark ? '#fff' : '#1a1a2e', lineHeight: 1 }}>
            {totalCount.toLocaleString()}
          </span>
          {(activeCount !== undefined && inactiveCount !== undefined) && (
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                <span style={{ fontSize: '13px', color: C.onSurfaceVariant, fontWeight: 600 }}>Active: <span style={{ color: C.onSurface }}>{activeCount}</span></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                <span style={{ fontSize: '13px', color: C.onSurfaceVariant, fontWeight: 600 }}>Inactive: <span style={{ color: C.onSurface }}>{inactiveCount}</span></span>
              </div>
              {blockedCount !== undefined && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: C.error }} />
                  <span style={{ fontSize: '13px', color: C.onSurfaceVariant, fontWeight: 600 }}>Blocked: <span style={{ color: C.onSurface }}>{blockedCount}</span></span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Access Policy Card */}
        <div style={{
          backgroundColor: isDark ? C.surfaceContainerHigh : '#ffffff',
          borderRadius: '16px', padding: '24px',
          border: `1px solid ${C.outlineVariant}33`,
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 10px rgba(0,0,0,0.02)',
          display: 'flex', alignItems: 'flex-start', gap: '20px',
        }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
            backgroundColor: isDark ? 'rgba(131, 79, 255, 0.15)' : 'rgba(131, 79, 255, 0.08)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Info size={24} style={{ color: C.primary }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '18px', fontWeight: 700, color: C.primary, margin: '0 0 6px' }}>
              Access Policy
            </h3>
            <p style={{ fontSize: '13px', color: C.onSurfaceVariant, margin: '0 0 8px', lineHeight: 1.5 }}>
              You are currently operating under <strong style={{ color: C.onSurface }}>{roleDisplay} Access</strong>. 
              {' '}{policyDescription}
            </p>
            {allowedActions && allowedActions.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                {allowedActions.map((action, i) => (
                  <span key={i} style={{
                    fontSize: '11px', fontWeight: 600, padding: '4px 8px',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                    color: C.onSurfaceVariant, borderRadius: '6px',
                    border: `1px solid ${C.outlineVariant}40`
                  }}>
                    {action}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
};
