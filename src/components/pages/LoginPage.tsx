import React, { useState } from 'react';
import { AuthLayout } from '../shells/AuthLayout';
import { GoogleButton } from '../composites/AuthComposites';
import { AuthButton, AuthInput, AuthDivider, tokens } from '../elements/AuthElements';
import { useTheme } from '../ThemeContext';
import { supabase } from '../../lib/supabase';

interface LoginPageProps {
  onSwitch: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSwitch }) => {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
    } 
    // If successful, the AuthProvider session listener will catch the state change 
    // and automatically render the logged-in view.

    setIsLoading(false);
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Enter your credentials.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

        <GoogleButton label="Continue with Google" />

        <AuthDivider label="or email address" />

        {/* --- Error Message --- */}
        {error && (
          <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: `${t.error}15`, border: `1px solid ${t.error}30`, color: t.error, fontSize: '12px', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <AuthInput
            id="login-email"
            label="Email Address"
            type="email"
            placeholder="johndoe@gmail.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <AuthInput
            id="login-password"
            label="Password"
            showToggle
            placeholder="••••••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
                Forgot password?
              </button>
            }
          />

          {/* Remember me (Note: Supabase handles session persistence via local storage automatically, but this keeps your UI intact) */}
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