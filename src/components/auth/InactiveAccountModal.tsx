import React from 'react';
import { type DashboardTokens } from '../../providers/ThemeProvider';

interface InactiveAccountModalProps {
  isDark: boolean;
  C: DashboardTokens;
  onSignOut: () => Promise<void>;
}

export const InactiveAccountModal: React.FC<InactiveAccountModalProps> = ({
  isDark,
  C,
  onSignOut,
}) => {
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await onSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
      setIsSigningOut(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        // Prevent closing by clicking outside
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="inactive-title"
      aria-describedby="inactive-description"
    >
      <div
        style={{
          backgroundColor: isDark ? C.surfaceContainerHigh : '#ffffff',
          borderRadius: '18px',
          padding: '32px',
          maxWidth: '440px',
          width: '100%',
          border: `1px solid ${C.outlineVariant}33`,
          boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
          animation: 'authFadeIn 0.2s cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        {/* Warning Icon */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            backgroundColor: `${C.error}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke={C.error}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h2
          id="inactive-title"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '22px',
            fontWeight: 800,
            color: isDark ? '#fff' : '#1a1a2e',
            margin: '0 0 12px',
          }}
        >
          Account Inactive
        </h2>

        <p
          id="inactive-description"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            color: C.onSurfaceVariant,
            margin: '0 0 24px',
            lineHeight: 1.65,
          }}
        >
          Your account is currently inactive. Please contact the administrators to reactivate your account and regain access to the system.
        </p>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: C.primary,
            color: '#ffffff',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            cursor: isSigningOut ? 'not-allowed' : 'pointer',
            opacity: isSigningOut ? 0.6 : 1,
            transition: 'opacity 0.2s ease-in-out',
          }}
        >
          {isSigningOut ? 'Signing Out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
};
