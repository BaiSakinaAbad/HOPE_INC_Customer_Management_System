// RegisterPage — New account registration form with name, username, email, and
// password fields. Includes password strength indicator and Google OAuth option.
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AuthLayout } from '../../layouts/AuthLayout';
import { GoogleButton, PasswordStrength } from '../../components/auth';
import { Button, Input, Divider } from '../../components/ui';
import { useTheme, tokens } from '../../providers/ThemeProvider';
import { supabase } from '../../lib/supabase';

interface RegisterPageProps {
  onSwitch: () => void;
}

// Discriminator type used to toggle between legal document contexts
type PolicyType = 'terms' | 'privacy';

// Static legal content dictionary mapped by document type identifier
const policyContent: Record<PolicyType, { title: string; intro: string; items: string[] }> = {
  terms: {
    title: 'Terms of Service',
    intro: 'These terms explain how BiteLog helps teams manage customer records, sales activity, and employee access responsibly.',
    items: [
      'Use the system only for legitimate customer management and business operations.',
      'Keep account credentials private and assign access based on each team member role.',
      'Customer, product, and sales records should be accurate, respectful, and work-related.',
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    intro: 'This privacy notice summarizes how a customer management system may protect operational data.',
    items: [
      'We store profile details, customer records, sales logs, and audit activity needed to run the workspace.',
      'Role-based permissions limit who can view, create, update, or delete sensitive business records.',
      'Audit logs may be used to review account activity, improve security, and support compliance checks.',
    ],
  },
};

const RegisterPage: React.FC<RegisterPageProps> = ({ 
  onSwitch
}) => {
  // Theme context retrieval to determine color design token applications
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  
  // Controlled form inputs tracking registration credentials
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // App UI/UX state workflow tracking flags
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activePolicy, setActivePolicy] = useState<PolicyType | null>(null);

  // Higher-order click handler function to safely intercept link events and pop open legal overlays
  const openPolicy = (policy: PolicyType) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setActivePolicy(policy);
  };

  // Form submission coordinator orchestrating validations and remote data insertion
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) return; // Prevent submission if legal checkbox isn't checked
    
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    // Call Supabase Authentication API to register a new user
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

    // Handle authentication responses and handle duplicate profile conditions
    if (authError) {
      setError(authError.message);
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError('An account with this email already exists.');
    } else {
      // Clear forms and signal submission completion to UI state trackers
      setSuccessMsg('Registration successful! Please check your email to verify your account.');
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
    <AuthLayout compact title="" subtitle="">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {/* Third-party authentication route */}
        <GoogleButton 
          compact 
          variant="luminous"
          label="Continue with Google" 
          testId="google-register-btn"
        />

        <Divider variant="luminous" label="or register with email" />

        {/* Dynamic warning banner rendering state-driven input validation faults */}
        {error && (
          <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: `${t.error}15`, border: `1px solid ${t.error}30`, color: t.error, fontSize: '12px', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
            {error}
          </div>
        )}
        
        {/* Success confirmation banners signaling email notification dispatches */}
        {successMsg && (
          <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: `${t.tertiary}15`, border: `1px solid ${t.tertiary}30`, color: t.tertiaryDim, fontSize: '12px', textAlign: 'center', fontFamily: "'Inter', sans-serif" }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

          {/* User profile details grid row container */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <Input 
              compact 
              id="reg-firstname" 
              label="First Name" 
              placeholder="John" 
              autoComplete="given-name" 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              variant="luminous"
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
              variant="luminous"
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
            variant="luminous"
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
            variant="luminous"
            required 
          />

          {/* Core password field equipped with reactive entropy scoring bars */}
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
              variant="luminous"
              required
            />
            <PasswordStrength password={password} variant="luminous" />
          </div>

          {/* Required checkbox component capturing mandatory compliance acknowledgment */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '4px 0' }}>
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
                color: isDark ? 'rgba(208, 201, 235, 0.7)' : t.onSurfaceVariant, cursor: 'pointer', userSelect: 'none',
              }}
            >
              I agree to the{' '}
              <a href="#" onClick={openPolicy('terms')} style={{ color: isDark ? '#b89fff' : t.primary, fontWeight: 500 }}>Terms of Service</a>
              {' '}and{' '}
              <a href="#" onClick={openPolicy('privacy')} style={{ color: isDark ? '#b89fff' : t.primary, fontWeight: 500 }}>Privacy Policy</a>.
            </label>
          </div>

          <Button variant="luminous" type="submit" isLoading={isLoading} data-testid="register-submit-btn">
            Create Account
          </Button>
        </form>

        {/* View switching panel navigation to route active users back towards SignIn cards */}
        <p style={{
          textAlign: 'center', margin: '8px 0 0 0',
          fontFamily: "'Inter', sans-serif",
          fontSize: '12px', color: isDark ? 'rgba(208, 201, 235, 0.7)' : t.onSurfaceVariant,
        }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitch}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px', fontWeight: 600,
              color: isDark ? '#b89fff' : t.primary,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Sign In
          </button>
        </p>
      </div>

      {/* DOM Portal Injection: Renders modals outside the parent styling tree to avoid CSS clipping bugs */}
      {activePolicy && createPortal(
        <div
          className="policy-modal-backdrop"
          role="presentation"
          onMouseDown={() => setActivePolicy(null)}
        >
          <section
            className="policy-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="policy-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
            style={{
              background: isDark
                ? 'linear-gradient(180deg, rgba(34, 30, 64, 0.98), rgba(22, 19, 43, 0.98))'
                : 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(246,242,255,0.98))',
              border: `1px solid ${isDark ? 'rgba(184, 159, 255, 0.22)' : 'rgba(131, 79, 255, 0.16)'}`,
              color: t.onSurface,
              boxShadow: isDark
                ? '0 24px 70px rgba(3, 2, 14, 0.62)'
                : '0 24px 70px rgba(83, 62, 150, 0.18)',
            }}
          >
            <header className="policy-modal-header">
              <div>
                {/* Evaluates state to apply appropriate header subtitle context text strings */}
                <p style={{ color: isDark ? 'rgba(208, 201, 235, 0.68)' : t.onSurfaceVariant }}>
                  BiteLog {activePolicy === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                </p>
                <h3 id="policy-modal-title">{policyContent[activePolicy].title}</h3>
              </div>
              <button
                type="button"
                aria-label="Close policy"
                onClick={() => setActivePolicy(null)}
                style={{ color: isDark ? 'rgba(238,232,255,0.82)' : t.onSurfaceVariant }}
              >
                x
              </button>
            </header>

            {/* Dynamic legal paragraph rendering */}
            <p className="policy-modal-intro" style={{ color: isDark ? 'rgba(224, 218, 246, 0.76)' : t.onSurfaceVariant }}>
              {policyContent[activePolicy].intro}
            </p>

            {/* Maps array item collections out onto structural bullet lists dynamically */}
            <ul className="policy-modal-list">
              {policyContent[activePolicy].items.map((item) => (
                <li key={item} style={{ color: isDark ? 'rgba(238, 232, 255, 0.86)' : t.onSurface }}>
                  {item}
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="policy-modal-action"
              onClick={() => setActivePolicy(null)}
            >
              Got it
            </button>
          </section>
        </div>,
        document.body // Injects layout child branch append node into root runtime container window target
      )}
    </AuthLayout>
  );
};

export default RegisterPage;