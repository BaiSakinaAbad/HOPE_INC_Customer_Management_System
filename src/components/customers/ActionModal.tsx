import React from 'react';
import { type DashboardTokens } from '../../providers/ThemeProvider';

interface ActionModalProps {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  icon: React.ReactNode;
  iconBg: string;
  confirmText: string;
  confirmColor: string;
  loading: boolean;
  error: string | null;
  C: DashboardTokens;
  isDark: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  isOpen, title, description, icon, iconBg, confirmText, confirmColor,
  loading, error, C, isDark, onConfirm, onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      }}
      onClick={e => { if (e.target === e.currentTarget && !loading) onCancel(); }}
    >
      <div style={{
        backgroundColor: isDark ? C.surfaceContainerHigh : '#ffffff',
        borderRadius: '18px', padding: '32px',
        maxWidth: '440px', width: '100%',
        border: `1px solid ${C.outlineVariant}33`,
        boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
        animation: 'authFadeIn 0.2s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '14px',
          backgroundColor: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '20px',
        }}>
          {icon}
        </div>

        <h3 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '20px', fontWeight: 800,
          color: isDark ? '#fff' : '#1a1a2e',
          margin: '0 0 10px',
        }}>
          {title}
        </h3>

        <div style={{
          fontFamily: 'Inter, sans-serif', fontSize: '14px',
          color: C.onSurfaceVariant, margin: '0 0 6px', lineHeight: 1.65,
        }}>
          {description}
        </div>

        {error && (
          <div style={{
            marginTop: '12px', padding: '10px 14px', borderRadius: '8px',
            backgroundColor: `${C.error}18`, border: `1px solid ${C.error}33`,
            color: C.error, fontSize: '12px', fontFamily: 'Inter, sans-serif',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1, height: '42px', borderRadius: '10px',
              border: `1px solid ${C.outlineVariant}66`,
              backgroundColor: 'transparent', color: C.onSurface,
              fontSize: '14px', fontFamily: 'Inter, sans-serif', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1, height: '42px', borderRadius: '10px',
              backgroundColor: confirmColor, color: '#fff', border: 'none',
              fontSize: '14px', fontFamily: 'Inter, sans-serif', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {loading
              ? <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};