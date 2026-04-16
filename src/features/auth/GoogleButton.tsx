import React, { useState } from 'react';
import { useTheme, tokens } from '../../providers/ThemeProvider';
import { supabase } from '../../lib/supabase';

interface GoogleButtonProps {
  label: string;
  compact?: boolean;
  onAuthStart?: () => void;
  testId?: string;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({ label, compact, onAuthStart, testId }) => {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const [hovered, setHovered] = useState(false);

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
        backgroundColor: hovered ? t.surfaceContainerHigh : t.surfaceContainer,
        border: `1px solid ${t.outlineVariant}`,
        borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px',
        cursor: 'pointer',
        fontFamily: "'Inter', sans-serif", fontSize: compact ? '12px' : '13px', fontWeight: 500,
        color: t.onSurface,
        transition: 'background-color 0.2s ease',
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