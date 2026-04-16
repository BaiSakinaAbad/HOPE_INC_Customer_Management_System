import React from 'react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';
import { HoverLink } from '../../components/ui/HoverLink';

export const Footer: React.FC = () => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  return (
    <footer style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${C.outlineVariant}11`, fontSize: '10px', color: `${C.onSurfaceVariant}44`, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
      <div>© 2026 BiteLog SaaSy Enterprise</div>
      <div style={{ display: 'flex', gap: '24px' }}>
        <HoverLink color="inherit" hoverColor={C.primary}>Privacy Protocol</HoverLink>
        <HoverLink color="inherit" hoverColor={C.primary}>System Status: Operational</HoverLink>
      </div>
    </footer>
  );
};