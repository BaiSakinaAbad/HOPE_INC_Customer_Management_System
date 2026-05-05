import React, { useState } from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { GoogleButton } from '../../components/auth';
import { Button, Input, Divider } from '../../components/ui';
import { useTheme, tokens } from '../../providers/ThemeProvider';
import { supabase } from '../../lib/supabase';

interface LoginPageProps {
  onSwitch: () => void;
  onLoginSuccess: () => void;
}

const POST_LOGIN_REDIRECT_KEY = 'post-login-redirect-pending';

const LoginPage: React.FC<LoginPageProps> = ({ 
  onSwitch, 
  onLoginSuccess
}) => {
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

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
    } else if (data.user) {
      onLoginSuccess();
    }
  };

  return (
    <AuthLayout title="" subtitle="">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

        <GoogleButton
          variant="luminous"
          label="Continue with Google"
          testId="google-login-btn"
          onAuthStart={() => {
            window.sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, String(Date.now()));
          }}
        />

        <Divider variant="luminous" label="or email address" />

        {/* --- Error Message --- */}
        {error && (
          <div style={{ 
            padding: '8px', 
            borderRadius: '6px', 
            backgroundColor: `${t.error}15`, 
            border: `1px solid ${t.error}30`, 
            color: t.error, 
            fontSize: '12px', 
            textAlign: 'center', 
            fontFamily: "'Inter', sans-serif" 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <Input
            id="login-email"
            data-testid="login-email-input"
            label="Email Address"
            type="email"
            placeholder="johndoe@gmail.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="luminous"
            required
          />

          <Input
            id="login-password"
            data-testid="login-password-input"
            label="Password"
            showToggle
            placeholder="••••••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="luminous"
            required
          />

          {/* Remember me UI */}
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
                color: isDark ? 'rgba(208, 201, 235, 0.7)' : t.onSurfaceVariant, cursor: 'pointer', userSelect: 'none',
              }}
            >
              Remember for 30 days
            </label>
          </div>

          <div style={{ marginTop: '2px' }}>
            <Button variant="luminous" type="submit" isLoading={isLoading} data-testid="login-submit-btn">
              Sign In
            </Button>
          </div>
        </form>

        <p style={{
          textAlign: 'center', margin: '8px 0 0 0',
          fontFamily: "'Inter', sans-serif",
          fontSize: '13px', color: isDark ? 'rgba(208, 201, 235, 0.7)' : t.onSurfaceVariant,
        }}>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitch}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontFamily: "'Inter', sans-serif",
              fontSize: '13px', fontWeight: 600,
              color: isDark ? '#b89fff' : t.primary,
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