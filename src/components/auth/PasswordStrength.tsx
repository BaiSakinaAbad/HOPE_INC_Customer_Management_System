import React from 'react';
import { useTheme, tokens } from '../../providers/ThemeProvider';

const calcStrength = (password: string): number => {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8)                          score++; // minimum length
  if (password.length >= 12)                         score++; // good length
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++; // mixed case
  if (/[0-9]/.test(password))                        score++; // contains digit
  if (/[^A-Za-z0-9]/.test(password))                 score++; // special character
  
  if (score === 0)       return 0; // empty / no criteria met
  if (score <= 1)        return 1; // Weak
  if (score <= 3)        return 2; // Fair
  return 3;              // Strong
};

export const PasswordStrength: React.FC<{ password: string; variant?: 'default' | 'luminous' }> = ({ password, variant = 'default' }) => {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const level = calcStrength(password);
  const isLuminous = variant === 'luminous';
  const activeColors = ['', '#ff6e84', t.primary, t.tertiaryDim];
  const labels = ['', 'Weak', 'Fair', 'Strong'];

  return (
    <div style={{ marginTop: '4px' }}>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{
            flex: 1, height: '3px', borderRadius: '99px',
            backgroundColor: level >= s
              ? activeColors[level]
              : isLuminous ? 'rgba(255,255,255,0.12)' : `${t.outlineVariant}60`,
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
