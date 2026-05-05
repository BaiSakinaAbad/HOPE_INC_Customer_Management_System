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
import React, { useState } from 'react';
import { useTheme, getDashboardTokens } from '../providers/ThemeProvider';
import { useAuth } from '../providers/AuthProvider';
import { useWindowWidth, BP } from '../hooks/useWindowWidth';
import { Sidebar, Topbar, Footer } from '../components/common';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { signOut, user, role } = useAuth();
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  const width = useWindowWidth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

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
        />
        
        {/* Inject the active page here */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
        
        <Footer />
      </main>
    </div>
  );
};