import React, { useState } from 'react';
import { AuthLayout } from '../shells/AuthLayout';
import { GoogleButton } from '../composites/AuthComposites';
import { AuthButton, AuthInput, AuthDivider, tokens } from '../elements/AuthElements';
import { useTheme } from '../ThemeContext';

interface LoginPageProps {
  onSwitch: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSwitch }) => {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const [isLoading, setIsLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1800);
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Enter your credentials.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

        <GoogleButton label="Continue with Google" />

        <AuthDivider label="or email address" />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <AuthInput
            id="login-email"
            label="Email Address"
            type="email"
            placeholder="johndoe@gmail.com"
            autoComplete="email"
            required
          />

          <AuthInput
            id="login-password"
            label="Password"
            showToggle
            placeholder="••••••••••••"
            autoComplete="current-password"
            required
            rightLabel={
              <button
                type="button"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '11px', fontWeight: 500,
                  color: t.primary, transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
              </button>
            }
          />

          {/* Remember me */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px' }}>
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: t.primary, flexShrink: 0 }}
            />
            <label
              htmlFor="remember"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px', fontWeight: 500,
                color: t.onSurfaceVariant, cursor: 'pointer', userSelect: 'none',
              }}
            >
              Remember for 30 days
            </label>
          </div>

          <div style={{ marginTop: '2px' }}>
            <AuthButton isLoading={isLoading}>Sign In</AuthButton>
          </div>
        </form>

        <p style={{
          textAlign: 'center', margin: 0,
          fontFamily: "'Inter', sans-serif",
          fontSize: '13px', color: t.onSurfaceVariant,
        }}>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitch}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontFamily: "'Inter', sans-serif",
              fontSize: '13px', fontWeight: 600,
              color: t.primary,
              textDecoration: 'underline',
              textDecorationThickness: '2px',
              textUnderlineOffset: '3px',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Create Account
          </button>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;