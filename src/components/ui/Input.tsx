import React, { useState } from 'react';
import { useTheme, tokens } from '../../providers/ThemeProvider'; 

export const Input: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    showToggle?: boolean;
    rightLabel?: React.ReactNode;
    compact?: boolean;
  }
> = ({ label, showToggle, rightLabel, compact, style, ...props }) => {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const [visible, setVisible] = useState(false);
  const resolvedType = showToggle ? (visible ? 'text' : 'password') : props.type;

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: compact ? '3px' : '6px', padding: '0 4px',
      }}>
        <label htmlFor={props.id} style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: compact ? '10px' : '11px', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: t.onSurfaceVariant,
        }}>
          {label}
        </label>
        {rightLabel}
      </div>

      <div className="input-group" style={{ position: 'relative' }}>
        <input
          {...props}
          id={props.id}
          type={resolvedType}
          style={{
            width: '100%', height: compact ? '38px' : '44px',
            backgroundColor: t.surfaceContainerHighest,
            border: 'none', borderRadius: '10px',
            padding: showToggle ? '0 40px 0 13px' : '0 13px',
            fontSize: compact ? '12px' : '13px', fontFamily: "'Inter', sans-serif",
            color: t.onSurface, outline: 'none', boxSizing: 'border-box',
            transition: 'background-color 0.2s',
            ...style,
          }}
        />
        <div className="neon-focus-bar" />
        {showToggle && (
          <button
            type="button"
            onClick={() => setVisible(v => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            style={{
              position: 'absolute', right: '12px', top: '50%',
              transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: t.outline, display: 'flex', alignItems: 'center', padding: '2px',
            }}
          >
            {visible ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};