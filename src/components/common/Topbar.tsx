import React, { useState } from 'react';
import {
  Bell,
  Zap,
  Menu,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { useTheme, getDashboardTokens, type DashboardTokens} from '../../providers/ThemeProvider';
import logo from '../../assets/Logo.png';


interface TopbarProps {
  isMobile: boolean;
  onMenuOpen: () => void;
  onLogout: () => Promise<void>;
  isSigningOut: boolean;
  displayName: string;
  role: string;
  avatarUrl: string;
}

export const Topbar: React.FC<TopbarProps> = ({ isMobile, onMenuOpen, onLogout, isSigningOut, displayName, avatarUrl, role }) => {
  const { isDark, toggle } = useTheme();
  const C = getDashboardTokens(isDark);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50, backgroundColor: `${C.surface}cc`, backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${C.outlineVariant}1a`, display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', padding: '0 24px', height: '64px', width: '100%', transition: 'background-color 0.3s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button onClick={onMenuOpen} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.onSurfaceVariant, display: 'flex' }}><Menu size={22} /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: `1px solid ${C.outlineVariant}33`, paddingLeft: '16px' }}>
          <img 
            src={logo}
            alt="Logo"
            style={{ width: '45px', height: '45px', objectFit: 'contain' , alignItems: 'center'}} 
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: "'Acquire', sans-serif", fontSize: '18px', fontWeight: 750, letterSpacing: '2px' }}>
              <span style={{ color: isDark ? '#fff' : C.onSurface }}>BITE</span>
              <span style={{ color: C.primary }}>LOG</span>
            </span>            <span style={{ fontSize: '9px', color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer Management</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={toggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.onSurfaceVariant, display: 'flex' }}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingLeft: '16px', borderLeft: `1px solid ${C.outlineVariant}33` }}>
          <Bell size={20} style={{ color: C.onSurfaceVariant, cursor: 'pointer' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={avatarUrl}
              alt={displayName}
              onError={(e) => {
                const target = e.currentTarget;
                target.onerror = null;
                target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=834fff`;
              }}
              style={{ width: '32px', height: '32px', borderRadius: '999px', border: `2px solid ${C.primary}33`, objectFit: 'cover' }}
            />
            {!isMobile && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: isDark ? '#fff' : '#000', lineHeight: 1 }}>{displayName}</span>
                <span style={{ fontSize: '9px', color: C.primary, textTransform: 'uppercase', fontWeight: 800 }}>{role}</span>
              </div>
            )}
          </div>
          <LogoutButton isMobile={isMobile} C={C} onLogout={onLogout} isSigningOut={isSigningOut} />
        </div>
      </div>
    </header>
  );
};

import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  isMobile: boolean;
  C: DashboardTokens;
  onLogout: () => Promise<void>;
  isSigningOut: boolean;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ isMobile, C, onLogout, isSigningOut }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onLogout}
      disabled={isSigningOut}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? C.error : `${C.error}1a`,
        color: hovered ? '#fff' : C.error,
        border: 'none', borderRadius: '8px', padding: '8px 12px',
        fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
        cursor: isSigningOut ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', gap: '6px',
        transition: 'all 0.2s ease',
        opacity: isSigningOut ? 0.7 : 1,
      }}
    >
      <LogOut size={14} /> {!isMobile && (isSigningOut ? 'Signing out...' : 'Logout')}
    </button>
  );
};