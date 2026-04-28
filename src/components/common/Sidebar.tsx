/**
 * Sidebar — role-aware navigation drawer.
 *
 * Changes from original:
 *  - Nav items are now <button> elements calling useNavigation().navigate()
 *    instead of dead <a href="#"> links.
 *  - Active page is highlighted via currentPage from NavigationContext.
 *  - "Deleted Customers" item is conditionally rendered based on useRights().
 *  - Closing the drawer on nav item click improves mobile UX.
 */
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
  UserCog, // <-- Added new icon for Employees
} from 'lucide-react';
import { useTheme, getDashboardTokens, type DashboardTokens } from '../../providers/ThemeProvider';
import { useNavigation, type PageId } from '../../providers/NavigationProvider';
import { useRights } from '../../hooks/useRights';

interface SidebarProps {
  drawerOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ drawerOpen, onClose }) => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  const { currentPage, navigate } = useNavigation();
  
  // Extract both capability flags
  const { canViewDeletedNav, canManageEmployees } = useRights();

  const handleNav = (page: PageId) => {
    navigate(page);
    onClose();
  };

  const navItems: { page: PageId; label: string; icon: React.ElementType }[] = [
    { page: 'dashboard', label: 'Dashboard',     icon: LayoutDashboard },
    { page: 'customers', label: 'Customers',     icon: Users },
    { page: 'sales',     label: 'Sales',         icon: CircleDollarSign },
    { page: 'products',  label: 'Products',      icon: Package },
  ];

  return (
    <>
      {/* Mobile overlay backdrop */}
      {drawerOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.2)',
            zIndex: 99, backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <aside style={{
        position: 'fixed', left: 0, top: 0, width: '256px', height: '100vh',
        backgroundColor: C.surfaceContainerLow,
        display: 'flex', flexDirection: 'column',
        paddingTop: '32px', paddingBottom: '32px', zIndex: 100,
        borderRight: `1px solid ${C.outlineVariant}1a`,
        transition: 'transform 0.3s ease, background-color 0.3s ease',
        transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
      }}>

        {/* Brand / close row */}
        <div style={{
          padding: '0 24px', marginBottom: '40px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: isDark ? `linear-gradient(135deg, ${C.primary}, ${C.primaryContainer})` : C.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isDark
                ? <Zap size={16} fill="#000" color="#000" />
                : <Sparkles size={16} fill="#fff" color="#fff" />}
            </div>
            <span style={{
              fontFamily: C.font.headline, fontSize: '16px', fontWeight: 700, color: C.primary,
            }}>
              Hope, Inc.
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: C.onSurfaceVariant, cursor: 'pointer', display: 'flex' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1 }}>
          {navItems.map(item => (
            <SidebarItem
              key={item.page}
              label={item.label}
              icon={item.icon}
              active={currentPage === item.page}
              onClick={() => handleNav(item.page)}
              C={C}
              isDark={isDark}
            />
          ))}
          
          {/* Role-gated: only admin / superadmin */}
          {canManageEmployees && (
            <SidebarItem
              label="Users"
              icon={UserCog}
              active={currentPage === 'employees'}
              onClick={() => handleNav('employees')}
              C={C}
              isDark={isDark}
            />
          )}

          {/* Role-gated: only admin / superadmin */}
          {canViewDeletedNav && (
            <SidebarItem
              label="Deleted Customers"
              icon={Trash2}
              active={currentPage === 'deleted'}
              onClick={() => handleNav('deleted')}
              C={C}
              isDark={isDark}
            />
          )}
        </nav>
      </aside>
    </>
  );
};

// ── SidebarItem ───────────────────────────────────────────────────────────────
interface SidebarItemProps {
  label: string;
  icon: React.ElementType;
  active: boolean;
  C: DashboardTokens;
  isDark: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ label, icon: Icon, active, C, isDark, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 24px', width: '100%',
        fontFamily: C.font.body, fontSize: '14px', fontWeight: active ? 600 : 400,
        color: active
          ? C.primary
          : hovered ? (isDark ? '#fff' : C.primary) : C.onSurfaceVariant,
        backgroundColor: active
          ? `${C.primary}1a`
          : hovered ? (isDark ? C.surfaceContainerHigh : '#eeeef5') : 'transparent',
        border: 'none',
        borderLeft: active ? `3px solid ${C.primary}` : '3px solid transparent',
        paddingLeft: '21px',      // compensate for 3px border
        cursor: 'pointer', textAlign: 'left',
        transition: 'all 0.2s ease',
      }}
    >
      <Icon size={18} />
      {label}
    </button>
  );
};