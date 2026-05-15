/**
 * AccessDenied — reusable component shown when a user navigates
 * to a page they lack permission for.
 */
import React from 'react';
import { ShieldOff } from 'lucide-react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';

interface AccessDeniedProps {
  message?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  message = 'You do not have permission to access this page.',
}) => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px', gap: '16px',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        width: '72px', height: '72px', borderRadius: '20px',
        backgroundColor: `${C.error}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <ShieldOff size={36} style={{ color: C.error }} />
      </div>
      <h2 style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '24px', fontWeight: 800,
        color: isDark ? '#fff' : '#1a1a2e', margin: 0,
      }}>
        Access Denied
      </h2>
      <p style={{
        fontSize: '14px', color: C.onSurfaceVariant,
        maxWidth: '360px', textAlign: 'center', lineHeight: 1.6,
      }}>
        {message}
      </p>
    </div>
  );
};
