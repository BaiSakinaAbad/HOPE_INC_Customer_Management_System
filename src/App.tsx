import { useEffect, useState } from 'react';
import './App.css';
import { AuthProvider, useAuth, BLOCKED_USER_KEY } from './providers/AuthProvider';
import Dashboard from './pages/superadmin/Dashboard';
import { ThemeProvider, useTheme, getDashboardTokens } from './providers/ThemeProvider';
import LoadingSpinner from './pages/auth/LoadingSpinnerPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import { InactiveAccountModal } from './components/auth';

const POST_LOGIN_REDIRECT_KEY = 'post-login-redirect-pending';
const POST_LOGIN_REDIRECT_TTL_MS = 60_000;

const hasValidPendingRedirect = () => {
  const rawValue = window.sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY);

  if (!rawValue) {
    return false;
  }

  const timestamp = Number(rawValue);
  if (!Number.isFinite(timestamp)) {
    window.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
    return false;
  }

  const isFresh = Date.now() - timestamp < POST_LOGIN_REDIRECT_TTL_MS;
  if (!isFresh) {
    window.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
  }

  return isFresh;
};

const AppContent = () => {
  // 1. Grab 'role' and 'recordstatus' alongside 'user'
  const { user, role, recordstatus, signOut } = useAuth(); 
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [pendingRedirect, setPendingRedirect] = useState(hasValidPendingRedirect);
  const [showBlockedAlert, setShowBlockedAlert] = useState(false);

  // Check if user is inactive
  const isInactive = recordstatus === 'INACTIVE';

  // Check for blocked user on initial load and whenever user changes
  useEffect(() => {
    const blockedUserEmail = window.sessionStorage.getItem(BLOCKED_USER_KEY);
    if (blockedUserEmail) {
      setShowBlockedAlert(true);
      window.sessionStorage.removeItem(BLOCKED_USER_KEY);
    }
  }, [user]);

  // 2. SMART DISMISSAL: Drop the spinner the moment BOTH user and role are ready
  useEffect(() => {
    if (user && role && pendingRedirect && !isInactive) {
      window.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
      setPendingRedirect(false);
    }
  }, [user, role, pendingRedirect, isInactive]);

  // 3. FALLBACK SAFETY NET: If role fetching fails or takes too long, 
  // don't leave them stranded. Release them after 3 seconds, not 10.
  useEffect(() => {
    if (!user || !pendingRedirect) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
      setPendingRedirect(false);
    }, 3000); // Changed from 10000ms to 3000ms

    return () => window.clearTimeout(timer);
  }, [user, pendingRedirect]);

  const queuePostLoginRedirect = () => {
    window.sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, String(Date.now()));
    setPendingRedirect(true);
  };

  // Show inactive modal if user is inactive
  if (user && isInactive) {
    return <InactiveAccountModal isDark={isDark} C={C} onSignOut={signOut} />;
  }

  if (user && pendingRedirect) {
    return <LoadingSpinner />;
  }

  if (user) {
    // Note: Assuming you've already updated this to point to the new Dashboard routing!
    return <Dashboard />; 
  }

  return authMode === 'login' ? (
    <LoginPage
      onSwitch={() => setAuthMode('register')}
      onLoginSuccess={queuePostLoginRedirect}
      showBlockedAlert={showBlockedAlert}
      onDismissBlockedAlert={() => setShowBlockedAlert(false)}
    />
  ) : (
    <RegisterPage 
      onSwitch={() => setAuthMode('login')}
      showBlockedAlert={showBlockedAlert}
      onDismissBlockedAlert={() => setShowBlockedAlert(false)}
    />
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <main className="min-h-screen">
          <AppContent />
        </main>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
