import React from 'react';
import { getDashboardTokens } from '../../providers/ThemeProvider';

export const ReportSection: React.FC<{
  title: string; icon: React.ReactNode; children: React.ReactNode;
  C: ReturnType<typeof getDashboardTokens>; isDark: boolean;
}> = ({ title, icon, children, C, isDark }) => (
  <div style={{ borderRadius: '16px', backgroundColor: isDark ? C.surfaceContainerHigh : '#fff', border: `1px solid ${C.outlineVariant}44`, overflow: 'hidden' }}>
    <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.outlineVariant}33`, display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: `${C.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: C.onSurface }}>{title}</h3>
    </div>
    <div>{children}</div>
  </div>
);
