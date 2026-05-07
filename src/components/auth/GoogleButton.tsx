import React, { useState } from 'react';
import { useTheme, tokens } from '../../providers/ThemeProvider';
import { supabase } from '../../lib/supabase';

interface GoogleButtonProps {
  label: string;
  compact?: boolean;
  onAuthStart?: () => void;
  testId?: string;
  variant?: 'default' | 'luminous';
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({ label, compact, onAuthStart, testId, variant = 'default' }) => {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const [hovered, setHovered] = useState(false);
  const isLuminous = variant === 'luminous';

  const handleGoogleLogin = async () => {
    onAuthStart?.();

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  return (
    <button
      type="button"
      data-testid={testId}
      onClick={handleGoogleLogin}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', height: compact ? '38px' : '44px',
        backgroundColor: isLuminous
          ? hovered
            ? (isDark ? 'rgba(53, 46, 92, 0.96)' : 'rgba(244, 239, 255, 0.96)')
            : (isDark ? 'rgba(43, 38, 77, 0.92)' : 'rgba(237, 232, 249, 0.92)')
          : hovered ? t.surfaceContainerHigh : t.surfaceContainer,
        border: `1px solid ${
          isLuminous
            ? (isDark ? 'rgba(166, 147, 248, 0.16)' : 'rgba(131, 79, 255, 0.14)')
            : t.outlineVariant
        }`,
        borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px',
        cursor: 'pointer',
        fontFamily: "'Inter', sans-serif", fontSize: compact ? '12px' : '13px', fontWeight: 500,
        color: t.onSurface,
        transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: isLuminous ? 'inset 0 1px 0 rgba(255,255,255,0.04)' : undefined,
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
