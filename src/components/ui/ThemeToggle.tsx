import React, { useState } from 'react';
import { useTheme, tokens } from '../../providers/ThemeProvider'; 

export const ThemeToggle: React.FC = () => {
  const { isDark, toggle } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;

  return (
    <button
      type="button"
      onClick={toggle}
      style={{
        display: 'flex', alignItems: 'center', gap: '7px',
        padding: '8px 14px', borderRadius: '10px',
        backgroundColor: t.surfaceContainer,
        border: `1px solid ${t.outlineVariant}60`,
        color: t.onSurfaceVariant, cursor: 'pointer',
        fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 500,
        transition: 'all 0.2s ease',
      }}
    >
      {isDark ? 'Light mode' : 'Dark mode'}
    </button>
  );
};