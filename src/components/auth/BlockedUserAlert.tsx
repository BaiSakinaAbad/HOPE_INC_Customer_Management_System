import React from 'react';
import { type DashboardTokens } from '../../providers/ThemeProvider';

interface BlockedUserAlertProps {
  isDark: boolean;
  C: DashboardTokens;
  onDismiss: () => void;
}

export const BlockedUserAlert: React.FC<BlockedUserAlertProps> = ({
  isDark,
  C,
  onDismiss,
}) => {
  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: '10px',
        backgroundColor: `${C.error}15`,
        border: `1px solid ${C.error}40`,
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        marginBottom: '16px',
      }}
      role="alert"
    >
      {/* Error Icon */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke={C.error}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0, marginTop: '2px' }}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>

      {/* Message */}
      <div style={{ flex: 1 }}>
        <p
          style={{
            margin: '0 0 4px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            fontWeight: 600,
            color: C.error,
          }}
        >
          Account Blocked
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            color: C.error,
            opacity: 0.85,
            lineHeight: 1.4,
          }}
        >
          Your account has been blocked. Please contact administrators for assistance.
        </p>
      </div>

      {/* Close Button */}
      <button
        onClick={onDismiss}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: C.error,
          flexShrink: 0,
        }}
        aria-label="Dismiss alert"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};
