import { useEffect, useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './providers/AuthProvider';
import SuperAdminDashboard from './pages/superadmin/Dashboard';
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
  const { user } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [pendingRedirect, setPendingRedirect] = useState(hasValidPendingRedirect);

  useEffect(() => {
    setPendingRedirect(hasValidPendingRedirect());
  }, [user]);

  useEffect(() => {
    if (!user || !pendingRedirect) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
      setPendingRedirect(false);
    }, 10000);

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
    return <SuperAdminDashboard />;
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
