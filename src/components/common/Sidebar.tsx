import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  CircleDollarSign,
  Package,
  Trash2,
  Zap,
  X,
  Sparkles,
} from 'lucide-react';
import { useTheme, getDashboardTokens, type DashboardTokens } from '../../providers/ThemeProvider';

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