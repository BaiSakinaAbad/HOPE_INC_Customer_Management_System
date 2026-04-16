import React, { useState } from 'react';
import { useTheme, tokens } from '../../providers/ThemeProvider'; 

export const Divider: React.FC<{ label: string }> = ({ label }) => {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ flex: 1, height: '1px', backgroundColor: `${t.outlineVariant}50` }} />
      <span style={{
        fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: 500,
        textTransform: 'uppercase', letterSpacing: '0.1em',
        color: t.outline, whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', backgroundColor: `${t.outlineVariant}50` }} />
    </div>
  );
};