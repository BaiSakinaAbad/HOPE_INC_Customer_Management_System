import React, { useState } from 'react';
import { AuthLayout } from './AuthLayout';
import { GoogleButton, AuthButton, AuthInput, AuthDivider, PasswordStrength, tokens } from './AuthComponents';
import { useTheme } from './ThemeContext';

interface RegisterProps {
  onSwitch: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitch }) => {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const getStrength = (p: string): number => {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return Math.min(s, 3);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) return;
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1800);
  };

  return (
    <AuthLayout title="Create your account" subtitle="Welcome to the Customer Management System.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <GoogleButton label="Continue with Google" />

        <AuthDivider label="or register with email" />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Name row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <AuthInput id="reg-firstname" label="First Name" placeholder="John" autoComplete="given-name" required />
            <AuthInput id="reg-lastname"  label="Last Name"  placeholder="Doe" autoComplete="family-name" required />
          </div>

          <AuthInput id="reg-username" label="Username" placeholder="johndoe123" autoComplete="username" required />

          <AuthInput id="reg-email" label="Email Address" type="email" placeholder="johndoe@gmail.com" autoComplete="email" required />

          {/* Password + strength */}
          <div>
            <AuthInput
              id="reg-password"
              label="Password"
              showToggle
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <PasswordStrength level={getStrength(password)} />
          </div>

          {/* Terms */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={e => setAgreedToTerms(e.target.checked)}
              required
              style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer', accentColor: t.primary, flexShrink: 0 }}
            />
            <label
              htmlFor="terms"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px', lineHeight: 1.55,
                color: t.onSurfaceVariant, cursor: 'pointer', userSelect: 'none',
              }}
            >
              I agree to the{' '}
              <a href="#" style={{ color: t.primary, fontWeight: 500 }}>Terms of Service</a>
              {' '}and{' '}
              <a href="#" style={{ color: t.primary, fontWeight: 500 }}>Privacy Policy</a>.
            </label>
          </div>

          <div style={{ marginTop: '4px' }}>
            <AuthButton isLoading={isLoading}>Create Account</AuthButton>
          </div>
        </form>

        <p style={{
          textAlign: 'center', margin: 0,
          fontFamily: "'Inter', sans-serif",
          fontSize: '14px', color: t.onSurfaceVariant,
        }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitch}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px', fontWeight: 600,
              color: t.tertiary,
              textDecoration: 'underline',
              textDecorationThickness: '2px',
              textUnderlineOffset: '3px',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Sign In
          </button>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;