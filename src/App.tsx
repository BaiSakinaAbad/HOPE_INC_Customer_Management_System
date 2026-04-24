import { useEffect, useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './providers/AuthProvider';
import Dashboard from './pages/superadmin/Dashboard';
import { ThemeProvider } from './providers/ThemeProvider';
import LoadingSpinner from './pages/auth/LoadingSpinnerPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

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
  // 1. Grab 'role' alongside 'user'
  const { user, role } = useAuth(); 
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [pendingRedirect, setPendingRedirect] = useState(hasValidPendingRedirect);

  // 2. SMART DISMISSAL: Drop the spinner the moment BOTH user and role are ready
  useEffect(() => {
    if (user && role && pendingRedirect) {
      window.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
      setPendingRedirect(false);
    }
  }, [user, role, pendingRedirect]);

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
    />
  ) : (
    <RegisterPage onSwitch={() => setAuthMode('login')} />
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
