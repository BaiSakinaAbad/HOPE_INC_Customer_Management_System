import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { tokens } from '../elements/AuthElements';

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

/** Calculates 0–3 strength from raw password string. */
const calcStrength = (password: string): number => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8)                          score++; // minimum length
  if (password.length >= 12)                         score++; // good length
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++; // mixed case
  if (/[0-9]/.test(password))                        score++; // contains digit
  if (/[^A-Za-z0-9]/.test(password))                 score++; // special character
  // Map score 0-5 → level 0-3
  if (score === 0)       return 0; // empty / no criteria met
  if (score <= 1)        return 1; // Weak
  if (score <= 3)        return 2; // Fair
  return 3;                        // Strong
};

export const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const level = calcStrength(password);
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
      }}
    >
      {isDark ? 'Light mode' : 'Dark mode'}
    </button>
  );
};