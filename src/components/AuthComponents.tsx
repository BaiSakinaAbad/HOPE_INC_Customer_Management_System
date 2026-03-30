import React, { useState } from 'react';
import { useTheme } from './ThemeContext';

// ─── Design tokens ────────────────────────────────────────────────────────────
export const tokens = {
  dark: {
    surface:                 '#0c0c1f',
    surfaceContainer:        '#17172e',
    surfaceContainerHigh:    '#1d1d36',
    surfaceContainerHighest: '#23233f',
    surfaceContainerLow:     '#111126',
    onSurface:               '#e5e3fe',
    onSurfaceVariant:        '#aaa8c2',
    outline:                 '#74738b',
    outlineVariant:          '#46465c',
    primary:                 '#b89fff',
    primaryDim:              '#834fff',
    secondary:               '#bc87fe',
    tertiary:                '#a0fff0',
    tertiaryDim:             '#2de7d2',
    tertiaryFixed:           '#33e9d5',
    error:                   '#ff6e84',
    glassCard:               'rgba(35,35,63,0.6)',
    glassBorderTop:          'rgba(184,159,255,0.15)',
    heroBg:                  '#111126',
    onPrimary:               '#37008e',
  },
  light: {
    surface:                 '#ffffff',
    surfaceContainer:        '#f8f7ff',
    surfaceContainerHigh:    '#f1f0f7',
    surfaceContainerHighest: '#e5e4f2',
    surfaceContainerLow:     '#faf9ff',
    onSurface:               '#1a1a2e',
    onSurfaceVariant:        '#5c5b71',
    outline:                 '#74738b',
    outlineVariant:          '#e1e0f0',
    primary:                 '#834fff',
    primaryDim:              '#6d23f9',
    secondary:               '#834fff',
    tertiary:                '#006a60',
    tertiaryDim:             '#2de7d2',
    tertiaryFixed:           '#33e9d5',
    error:                   '#d73357',
    glassCard:               'rgba(255,255,255,0.7)',
    glassBorderTop:          'rgba(255,255,255,0.8)',
    heroBg:                  'linear-gradient(135deg,#faf9ff 0%,#f1f0f7 100%)',
    onPrimary:               '#ffffff',
  },
} as const;

// ─── AuthInput ────────────────────────────────────────────────────────────────
export const AuthInput: React.FC<
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
            onMouseEnter={e => (e.currentTarget.style.color = t.primary)}
            onMouseLeave={e => (e.currentTarget.style.color = t.outline)}
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

// ─── GoogleButton ─────────────────────────────────────────────────────────────
export const GoogleButton: React.FC<{ label: string; compact?: boolean }> = ({ label, compact }) => {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', height: compact ? '38px' : '44px',
        backgroundColor: hovered ? t.surfaceContainerHigh : t.surfaceContainer,
        border: `1px solid ${t.outlineVariant}`,
        borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px',
        cursor: 'pointer',
        fontFamily: "'Inter', sans-serif", fontSize: compact ? '12px' : '13px', fontWeight: 500,
        color: t.onSurface,
      }}
    >
      <img 
        src="https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png" 
        alt="Google Logo" 
        style={{ width: '25px', height: '25px' }} 
      />
      {label}
    </button>
  );
};

// ─── AuthButton ───────────────────────────────────────────────────────────────
export const AuthButton: React.FC<{ children: React.ReactNode; isLoading?: boolean; compact?: boolean }> = ({ children, isLoading, compact }) => {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;

  return (
    <button
      type="submit"
      disabled={isLoading}
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
      }}
      onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.01)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
      onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)'; }}
      onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
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

// ─── AuthDivider ──────────────────────────────────────────────────────────────
export const AuthDivider: React.FC<{ label: string }> = ({ label }) => {
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

// ─── PasswordStrength ─────────────────────────────────────────────────────────
export const PasswordStrength: React.FC<{ level: number }> = ({ level }) => {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const activeColors = ['', '#ff6e84', t.primary, t.tertiaryDim];
  const labels = ['', 'Weak', 'Fair', 'Strong'];

  return (
    <div style={{ marginTop: '4px' }}>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{
            flex: 1, height: '3px', borderRadius: '99px',
            backgroundColor: level >= s ? activeColors[level] : `${t.outlineVariant}60`,
            transition: 'background-color 0.3s',
          }} />
        ))}
      </div>
      {level > 0 && (
        <p style={{
          fontSize: '10px', fontFamily: "'Inter', sans-serif", fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: activeColors[level], margin: 0,
        }}>
          {labels[level]} password
        </p>
      )}
    </div>
  );
};

// ─── ThemeToggle ──────────────────────────────────────────────────────────────
export const ThemeToggle: React.FC = () => {
  const { isDark, toggle } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '7px',
        padding: '8px 14px', borderRadius: '10px',
        backgroundColor: hovered ? t.surfaceContainerHigh : t.surfaceContainer,
        border: `1px solid ${t.outlineVariant}60`,
        color: t.onSurfaceVariant, cursor: 'pointer',
        fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
    >
      {isDark ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
      {isDark ? 'Light mode' : 'Dark mode'}
    </button>
  );
};