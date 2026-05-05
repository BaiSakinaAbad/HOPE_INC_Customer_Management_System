import React from 'react';
import { useTheme, tokens } from '../../providers/ThemeProvider'; 

export const Button: React.FC<{
  children: React.ReactNode;
  isLoading?: boolean;
  compact?: boolean;
  'data-testid'?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
}> = ({ children, isLoading, compact, 'data-testid': dataTestId, onClick, type = 'button', style }) => {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;

  return (
    <button
      type={type}
      disabled={isLoading}
      data-testid={dataTestId}
      onClick={onClick}
      className="primary-gradient"
      style={{
        width: '100%', height: compact ? '38px' : '44px',
        border: 'none', borderRadius: '10px',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: compact ? '13px' : '14px', fontWeight: 700,
        color: t.onPrimary,
        cursor: isLoading ? 'not-allowed' : 'pointer',
        opacity: isLoading ? 0.6 : 1,
        boxShadow: '0 6px 20px rgba(131,79,255,0.28)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...style
      }}
    >
      {isLoading ? (
        <div style={{
          width: '20px', height: '20px',
          border: `2px solid ${t.onPrimary}40`, borderTopColor: t.onPrimary,
          borderRadius: '50%', animation: 'spin 0.7s linear infinite',
        }} />
      ) : children}
    </button>
  );
};