/**
 * SuperAdminLayout — Dashboard shell.
 *
 * Changes from original:
 *  - Wrapped in NavigationProvider so all children can call useNavigation().
 *  - <MainContent> replaced by renderPage() which switches between views
 *    based on currentPage from NavigationContext.
 *  - Logic extracted into DashboardLayoutInner so it can consume the context.
 */
// src/layouts/DashboardLayout.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTheme, getDashboardTokens } from '../providers/ThemeProvider';
import { useAuth } from '../providers/AuthProvider';
import { useWindowWidth, BP } from '../hooks/useWindowWidth';
import { Sidebar, Topbar, Footer } from '../components/common';
import { getEmployees } from '../services/employeeService';
import { AlertCircle, UserCheck } from 'lucide-react';
import type { Employee } from '../types/employee';

interface PendingAccount {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { signOut, user, role, permissions } = useAuth();
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  const width = useWindowWidth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Pending activation state
  const [pendingAccounts, setPendingAccounts] = useState<PendingAccount[]>([]);
  const [pendingOverlayOpen, setPendingOverlayOpen] = useState(false);

  const canManageUsers = role === 'superadmin' || role === 'admin' || (permissions && permissions['ADM_USER'] === true);

  const loadPending = useCallback(async () => {
    if (!canManageUsers) return;
    const { data } = await getEmployees(permissions);
    const inactive = (data ?? [])
      .filter((e: Employee) => e.recordstatus === 'INACTIVE')
      .map((e: Employee) => ({ id: e.id, username: e.username ?? '', email: e.email ?? '', role: e.role }));
    setPendingAccounts(inactive);
  }, [canManageUsers, permissions]);

  useEffect(() => { void loadPending(); }, [loadPending]);

  // Safely extract user metadata
  const metadata = user?.user_metadata ?? {};
  const fullName = (metadata.full_name as string | undefined)
    || `${(metadata.first_name as string | undefined) ?? ''} ${(metadata.last_name as string | undefined) ?? ''}`.trim();
  const displayName = fullName || (metadata.username as string | undefined) || user?.email || 'Unknown User';
  const avatarUrl = (metadata.avatar_url as string | undefined)
    || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}&backgroundColor=834fff`;

  const handleLogout = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      backgroundColor: C.surface, color: C.onSurface,
      fontFamily: C.font.body,
      transition: 'background-color 0.3s ease, color 0.3s ease',
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&family=Inter:wght@400;600;700&display=swap');`}</style>
      
      {/* Sidebar relies on NavigationProvider, which will wrap this layout */}
      <Sidebar drawerOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar
          isMobile={width < BP.mobile}
          onMenuOpen={() => setDrawerOpen(true)}
          onLogout={handleLogout}
          isSigningOut={isSigningOut}
          role={role || 'LOADING...'}
          displayName={displayName}
          avatarUrl={avatarUrl}
          pendingCount={canManageUsers ? pendingAccounts.length : 0}
          onBellClick={canManageUsers && pendingAccounts.length > 0 ? () => setPendingOverlayOpen(true) : undefined}
        />
        
        {/* Inject the active page here */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
        
        <Footer />
      </main>

      {/* ── Pending Activation Overlay (triggered from bell icon) ── */}
      {pendingOverlayOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
          }}
          onClick={() => setPendingOverlayOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '480px', maxHeight: '80vh',
              backgroundColor: isDark ? C.surfaceContainerHigh : '#ffffff',
              borderRadius: '20px',
              border: `1px solid ${C.outlineVariant}33`,
              boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.1)',
              overflow: 'hidden', display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px 16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: `1px solid ${C.outlineVariant}33`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  backgroundColor: '#f59e0b18',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <UserCheck size={18} style={{ color: '#f59e0b' }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: C.onSurface }}>
                    Pending Activation
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: C.onSurfaceVariant }}>
                    {pendingAccounts.length} account{pendingAccounts.length !== 1 ? 's' : ''} awaiting activation
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPendingOverlayOpen(false)}
                style={{
                  background: 'none', border: 'none', color: C.onSurfaceVariant,
                  cursor: 'pointer', padding: '4px', fontSize: '20px', lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {/* Account list */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '16px 20px',
              display: 'flex', flexDirection: 'column', gap: '10px',
            }}>
              {pendingAccounts.map(acc => (
                <div key={acc.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', borderRadius: '12px',
                  backgroundColor: isDark ? C.surfaceContainer : '#fef9ee',
                  border: `1px solid ${isDark ? C.outlineVariant : '#fde68a'}44`,
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    backgroundColor: '#f59e0b18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <AlertCircle size={16} style={{ color: '#f59e0b' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '13px', fontWeight: 700, color: C.onSurface,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {acc.username || acc.email}
                    </div>
                    <div style={{
                      fontSize: '11px', color: C.onSurfaceVariant,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {acc.email}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                    padding: '4px 10px', borderRadius: '6px',
                    backgroundColor: isDark ? '#f59e0b22' : '#fef3c7',
                    color: '#d97706', flexShrink: 0,
                  }}>
                    {acc.role} · Inactive
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};