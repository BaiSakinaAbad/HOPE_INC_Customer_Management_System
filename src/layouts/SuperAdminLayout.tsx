import React, { useState } from 'react';
import { useTheme, getDashboardTokens } from '../providers/ThemeProvider';
import { useAuth } from '../providers/AuthProvider';
import { useWindowWidth, BP } from '../hooks/useWindowWidth';
import { Sidebar } from '../components/common/Sidebar'
import { Topbar } from '../components/common/Topbar'
import { MainContent } from '../components/common/MainContent'
import { Footer } from '../components/common/Footer';

/**
 * DashboardLayout — Shell
 * Wires together the sidebar drawer state, logout logic, and responsive
 * layout frame. Compose page-level content by replacing <MainContent />
 * or wrapping additional children as the feature grows.
 */
export const DashboardLayout: React.FC = () => {
  const { signOut, user } = useAuth();
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  const width = useWindowWidth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const metadata = user?.user_metadata || {};

  const fullName = metadata.full_name || `${metadata.first_name || ''} ${metadata.last_name || ''}`.trim();
  const displayName = fullName || metadata.username || user?.email || 'Unknown User';
  const firstName = metadata.first_name || displayName.split(' ')[0];

  const avatarUrl = metadata.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${metadata.username || displayName}&backgroundColor=834fff`;

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
          displayName={displayName} 
          avatarUrl={avatarUrl}
        />
        <MainContent 
          isMobile={width < BP.mobile}
          firstName={firstName}
        />
        <Footer />
      </main>
    </div>
  );
};