import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';
import { getDashboardTokens, useWindowWidth, BP } from '../elements/DashboardElements';
import { Sidebar, Topbar, MainContent, DashboardFooter } from '../composites/DashboardComposites';

/**
 * DashboardLayout — Shell
 * Wires together the sidebar drawer state, logout logic, and responsive
 * layout frame. Compose page-level content by replacing <MainContent />
 * or wrapping additional children as the feature grows.
 */
export const DashboardLayout: React.FC = () => {
  const { signOut } = useAuth();
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  const width = useWindowWidth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: C.surface, color: C.onSurface, fontFamily: C.font.body, transition: 'background-color 0.3s ease, color 0.3s ease' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&family=Inter:wght@400;600;700&display=swap');`}</style>
      <Sidebar drawerOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar
          isMobile={width < BP.mobile}
          onMenuOpen={() => setDrawerOpen(true)}
          onLogout={handleLogout}
          isSigningOut={isSigningOut}
        />
        <MainContent isMobile={width < BP.mobile} />
        <DashboardFooter />
      </main>
    </div>
  );
};
