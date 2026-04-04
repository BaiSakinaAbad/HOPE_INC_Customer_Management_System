import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  CircleDollarSign,
  Package,
  Trash2,
  Bell,
  ChevronRight,
  Network,
  Zap,
  Menu,
  X,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { getDashboardTokens, HoverLink, SidebarItem, LogoutButton } from '../elements/DashboardElements';

// ─── Sidebar ──────────────────────────────────────────────────────────────────
interface SidebarProps {
  drawerOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ drawerOpen, onClose }) => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);

  return (
    <>
      {drawerOpen && (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.2)', zIndex: 99, backdropFilter: 'blur(2px)' }} />
      )}
      <aside style={{
        position: 'fixed', left: 0, top: 0, width: '256px', height: '100vh',
        backgroundColor: C.surfaceContainerLow, display: 'flex', flexDirection: 'column',
        paddingTop: '32px', paddingBottom: '32px', zIndex: 100,
        borderRight: `1px solid ${C.outlineVariant}1a`, transition: 'transform 0.3s ease, background-color 0.3s ease',
        transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
      }}>
        <div style={{ padding: '0 24px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: isDark ? `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})` : C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isDark ? <Zap size={16} fill="#000" color="#000" /> : <Sparkles size={16} fill="#fff" color="#fff" />}
             </div>
             <h1 style={{ fontFamily: C.font.headline, fontSize: '18px', fontWeight: 700, color: C.primary, margin: 0 }}>SaaSy</h1>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.onSurfaceVariant, cursor: 'pointer' }}><X size={20}/></button>
        </div>
        <nav style={{ flex: 1 }}>
          <SidebarItem label="Admin" icon={LayoutDashboard} active={true} C={C} isDark={isDark} />
          <SidebarItem label="Customers" icon={Users} active={false} C={C} isDark={isDark} />
          <SidebarItem label="Sales" icon={CircleDollarSign} active={false} C={C} isDark={isDark} />
          <SidebarItem label="Products" icon={Package} active={false} C={C} isDark={isDark} />
          <SidebarItem label="Deleted Customers" icon={Trash2} active={false} C={C} isDark={isDark} />
        </nav>
      </aside>
    </>
  );
};

// ─── Topbar ───────────────────────────────────────────────────────────────────
interface TopbarProps {
  isMobile: boolean;
  onMenuOpen: () => void;
  onLogout: () => Promise<void>;
  isSigningOut: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ isMobile, onMenuOpen, onLogout, isSigningOut }) => {
  const { isDark, toggle } = useTheme();
  const C = getDashboardTokens(isDark);
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50, backgroundColor: `${C.surface}cc`, backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${C.outlineVariant}1a`, display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', padding: '0 24px', height: '64px', width: '100%', transition: 'background-color 0.3s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button onClick={onMenuOpen} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.onSurfaceVariant, display: 'flex' }}><Menu size={22} /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: `1px solid ${C.outlineVariant}33`, paddingLeft: '16px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: isDark ? `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})` : C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isDark ? <Zap size={16} fill="#000" color="#000" /> : <Sparkles size={16} fill="#fff" color="#fff" />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: C.font.headline, fontSize: '16px', fontWeight: 800, color: isDark ? '#fff' : C.primary, lineHeight: 1 }}>BiteLog</span>
            <span style={{ fontSize: '9px', color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer Management</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={toggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.onSurfaceVariant, display: 'flex' }}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setActiveTab('Overview')} style={{
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: C.font.body, fontSize: '14px',
            fontWeight: activeTab === 'Overview' ? 700 : 400, color: activeTab === 'Overview' ? C.primary : C.onSurfaceVariant,
            padding: '4px 0', borderBottom: activeTab === 'Overview' ? `2px solid ${C.primary}` : '2px solid transparent', transition: 'color 0.2s'
          }}>Overview</button>
          <button onClick={() => setActiveTab('Logs')} style={{
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: C.font.body, fontSize: '14px',
            fontWeight: activeTab === 'Logs' ? 700 : 400, color: activeTab === 'Logs' ? C.primary : C.onSurfaceVariant, transition: 'color 0.2s'
          }}>Logs</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingLeft: '16px', borderLeft: `1px solid ${C.outlineVariant}33` }}>
          <Bell size={20} style={{ color: C.onSurfaceVariant, cursor: 'pointer' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="User" style={{ width: '32px', height: '32px', borderRadius: '999px', border: `2px solid ${C.primary}33` }} />
            {!isMobile && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: isDark ? '#fff' : '#000', lineHeight: 1 }}>Sakiki Presidad Ola</span>
                <span style={{ fontSize: '9px', color: C.primary, textTransform: 'uppercase', fontWeight: 800 }}>Superadmin</span>
              </div>
            )}
          </div>
          <LogoutButton isMobile={isMobile} C={C} onLogout={onLogout} isSigningOut={isSigningOut} />
        </div>
      </div>
    </header>
  );
};

// ─── MainContent ──────────────────────────────────────────────────────────────
interface MainContentProps {
  isMobile: boolean;
}

export const MainContent: React.FC<MainContentProps> = ({ isMobile }) => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 24px', alignItems: 'center', position: 'relative' }}>
      <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '60px' }}>
        <HoverLink color={C.onSurfaceVariant} hoverColor={C.primary}>System</HoverLink>
        <ChevronRight size={12} style={{ opacity: 0.5 }} />
        <HoverLink color={C.primary} hoverColor={C.primary} style={{ fontWeight: 700 }}>Admin Dashboard</HoverLink>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ position: 'relative', marginBottom: '40px' }}>
          <div style={{ position: 'absolute', inset: -20, background: `${C.primary}1a`, filter: 'blur(40px)', borderRadius: '50%' }} />
          <div style={{ position: 'relative', width: '160px', height: '160px', borderRadius: '50%', background: C.surfaceContainer, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.outlineVariant}22`, transition: 'background-color 0.3s ease' }}>
             <Network size={64} style={{ color: C.primary, opacity: 0.9 }} />
             <div style={{ position: 'absolute', bottom: '5px', right: '5px', width: '48px', height: '48px', borderRadius: '12px', backgroundColor: isDark ? '#002a31' : '#fff', border: `1px solid ${C.primary}4d`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(12deg)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
               <Zap size={24} fill={isDark ? C.secondary : C.primary} color={isDark ? C.secondary : C.primary} />
             </div>
          </div>
        </div>
        <h2 style={{ fontFamily: C.font.headline, fontSize: isMobile ? '32px' : '48px', fontWeight: 900, color: isDark ? '#fff' : '#000', marginBottom: '16px' }}>Welcome back, Sakiki</h2>
        <p style={{ fontFamily: C.font.body, fontSize: '16px', color: C.onSurfaceVariant, maxWidth: '560px', lineHeight: 1.6 }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      </div>
    </div>
  );
};

// ─── Footer ───────────────────────────────────────────────────────────────────
export const DashboardFooter: React.FC = () => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  return (
    <footer style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${C.outlineVariant}11`, fontSize: '10px', color: `${C.onSurfaceVariant}44`, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
      <div>© 2026 BiteLog SaaSy Enterprise</div>
      <div style={{ display: 'flex', gap: '24px' }}>
        <HoverLink color="inherit" hoverColor={C.primary}>Privacy Protocol</HoverLink>
        <HoverLink color="inherit" hoverColor={C.primary}>System Status: Operational</HoverLink>
      </div>
    </footer>
  );
};
