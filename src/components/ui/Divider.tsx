import React from 'react';
import { useTheme, tokens } from '../../providers/ThemeProvider'; 

export const Divider: React.FC<{ label: string; variant?: 'default' | 'luminous' }> = ({ label, variant = 'default' }) => {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const isLuminous = variant === 'luminous';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ flex: 1, height: '1px', backgroundColor: isLuminous ? 'rgba(255,255,255,0.08)' : `${t.outlineVariant}50` }} />
      <span style={{
        fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: 500,
        textTransform: 'uppercase', letterSpacing: '0.1em',
        color: isLuminous ? (isDark ? 'rgba(181, 176, 206, 0.46)' : 'rgba(92, 91, 113, 0.72)') : t.outline,
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', backgroundColor: isLuminous ? 'rgba(255,255,255,0.08)' : `${t.outlineVariant}50` }} />
    </div>
  );
};
