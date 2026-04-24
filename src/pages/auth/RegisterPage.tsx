import React, { useState } from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { GoogleButton, PasswordStrength } from '../../components/auth';
import { Button, Input, Divider } from '../../components/ui';
import { useTheme, tokens } from '../../providers/ThemeProvider';
import { supabase } from '../../lib/supabase';

interface RegisterPageProps {
  onSwitch: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitch }) => {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  
  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) return;
    
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    // Call Supabase to create the user
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          username: username,
        }
      }
    });

    if (authError) {
      setError(authError.message);
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      // Supabase workaround: If identities is empty, the email is already taken
      setError('An account with this email already exists.');
    } else {
      setSuccessMsg('Registration successful! Please check your email to verify your account.');
      
      // Optional: Clear the form
      setFirstName('');
      setLastName('');
      setUsername('');
      setEmail('');
      setPassword('');
      setAgreedToTerms(false);
    }
    
    setIsLoading(false);
  };

  return (
    <AuthLayout compact title="Create your account" subtitle="Welcome to BiteLog.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

        <GoogleButton 
          compact 
          label="Continue with Google" 
          testId="google-register-btn"
        />

        <Divider label="or register with email" />

        {/* --- Error / Success Messages --- */}
        {error && (
          <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: `${t.error}15`, border: `1px solid ${t.error}30`, color: t.error, fontSize: '12px', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
            {error}
          </div>
        )}
        {successMsg && (
          <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: `${t.tertiary}15`, border: `1px solid ${t.tertiary}30`, color: t.tertiaryDim, fontSize: '12px', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

          {/* Name row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <Input 
              compact 
              id="reg-firstname" 
              label="First Name" 
              placeholder="John" 
              autoComplete="given-name" 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required 
            />
            <Input 
              compact 
              id="reg-lastname"  
              label="Last Name"  
              placeholder="Doe"  
              autoComplete="family-name" 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required 
            />
          </div>

          <Input 
            compact 
            id="reg-username" 
            label="Username" 
            placeholder="johndoe123" 
            autoComplete="username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required 
          />

          <Input 
            compact 
            id="reg-email" 
            label="Email Address" 
            type="email" 
            placeholder="johndoe@gmail.com" 
            autoComplete="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />

          {/* Password + strength */}
          <div>
            <Input
              compact
              id="reg-password"
              label="Password"
              showToggle
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <PasswordStrength password={password} />
          </div>

          {/* Terms */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={e => setAgreedToTerms(e.target.checked)}
              required
              style={{ width: '14px', height: '14px', marginTop: '2px', cursor: 'pointer', accentColor: t.primary, flexShrink: 0 }}
            />
            <label
              htmlFor="terms"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px', lineHeight: 1.45,
                color: t.onSurfaceVariant, cursor: 'pointer', userSelect: 'none',
              }}
            >
              I agree to the{' '}
              <a href="#" style={{ color: t.primary, fontWeight: 500 }}>Terms of Service</a>
              {' '}and{' '}
              <a href="#" style={{ color: t.primary, fontWeight: 500 }}>Privacy Policy</a>.
            </label>
          </div>

          <Button type="submit" isLoading={isLoading} data-testid="register-submit-btn">
            Create Account
          </Button>
        </form>

        <p style={{
          textAlign: 'center', margin: 0,
          fontFamily: "'Inter', sans-serif",
          fontSize: '12px', color: t.onSurfaceVariant,
        }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitch}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px', fontWeight: 600,
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

export default RegisterPage;

