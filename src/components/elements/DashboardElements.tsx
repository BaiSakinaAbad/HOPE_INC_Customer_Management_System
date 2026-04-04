import { useState, useEffect } from 'react';

// ─── Design tokens (Unified for both modes) ──────────────────────────────────
export const getDashboardTokens = (isDark: boolean) => ({
  surface:              isDark ? '#060d21' : '#fbf8ff',
  surfaceContainer:     isDark ? '#0d1834' : '#f0edf5',
  surfaceContainerLow:  isDark ? '#09122a' : '#f7f8ff',
  surfaceContainerHigh: isDark ? '#111e3f' : '#ebe7ef',
  primary:              isDark ? '#9990ff' : '#5749d2',
  primaryContainer:     isDark ? '#7f73fd' : '#e3dfff',
  secondary:            isDark ? '#28d9f3' : '#006972',
  secondaryContainer:   isDark ? '#002a31' : '#9eefff',
  onSurface:            isDark ? '#dfe4ff' : '#1b1b1f',
  onSurfaceVariant:     isDark ? '#9caad7' : '#46464f',
  outlineVariant:       isDark ? '#39476e' : '#c6c6d0',
  error:                isDark ? '#fd6f85' : '#ba1a1a',
  font: {
    headline: "'Plus Jakarta Sans', sans-serif",
    body:     "'Inter', sans-serif",
  },
});

export type DashboardTokens = ReturnType<typeof getDashboardTokens>;

// ─── Responsive width hook ────────────────────────────────────────────────────
export const BP = { mobile: 640, tablet: 1024 } as const;

export function useWindowWidth(): number {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

// ─── HoverLink ────────────────────────────────────────────────────────────────
interface HoverLinkProps {
  children: React.ReactNode;
  color: string;
  hoverColor: string;
  style?: React.CSSProperties;
}

export const HoverLink: React.FC<HoverLinkProps> = ({ children, color, hoverColor, style }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...style,
        color: hovered ? hoverColor : color,
        cursor: 'pointer',
        transition: 'color 0.2s ease',
      }}
    >
      {children}
    </span>
  );
};

// ─── SidebarItem ─────────────────────────────────────────────────────────────
interface SidebarItemProps {
  label: string;
  icon: React.ElementType;
  active: boolean;
  C: DashboardTokens;
  isDark: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ label, icon: Icon, active, C, isDark }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href="#"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px',
        fontSize: '14px', fontFamily: C.font.body, fontWeight: active ? 600 : 400,
        color: active ? C.primary : (hovered ? (isDark ? '#fff' : C.primary) : C.onSurfaceVariant),
        backgroundColor: active ? `${C.primary}1a` : (hovered ? (isDark ? C.surfaceContainerHigh : '#eeeef5') : 'transparent'),
        borderLeft: active ? `2px solid ${C.primary}` : '2px solid transparent',
        textDecoration: 'none', transition: 'all 0.2s ease',
      }}
    >
      <Icon size={18} /> {label}
    </a>
  );
};

// ─── LogoutButton ─────────────────────────────────────────────────────────────
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
