// App.tsx — Main entry point with authentication, role-based routing, and theme management.
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './providers/AuthProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { ProtectedRoute, getDefaultPathForRole } from './components/ProtectedRoute';
import LoadingSpinner from './pages/auth/LoadingSpinnerPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Dashboard from './pages/superadmin/Dashboard';

// ─── Auth-aware root redirect ────────────────────────────────────────────────
// Redirects "/" to the correct landing page based on role, or to /login if unauthenticated.
const RootRedirect = () => {
  const { user, role, loading } = useAuth();
  if (loading || (user && !role)) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getDefaultPathForRole(role)} replace />;
};

const AppContent = () => {
  // 1. Grab 'role', 'recordstatus', and 'loading' alongside 'user'
  const { user, role, recordstatus, loading, signOut } = useAuth(); 
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [pendingRedirect, setPendingRedirect] = useState(hasValidPendingRedirect);
  // Check if user is inactive
  const isInactive = recordstatus === 'INACTIVE';

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

  if (user && (pendingRedirect || loading)) {
    return <LoadingSpinner />;
  }

// ─── Wrappers for auth pages (handle navigation callbacks) ───────────────────
import { useNavigate } from 'react-router-dom';

const LoginPageWrapper = () => {
  const navigate = useNavigate();
  return (
    <LoginPage
      onSwitch={() => navigate('/register')}
      onLoginSuccess={() => {
        // The AuthProvider will detect the session change.
        // The AuthRoute wrapper will redirect once user+role are loaded.
      }}
    />
  );
};

const RegisterPageWrapper = () => {
  const navigate = useNavigate();
  return (
    <RegisterPage
      onSwitch={() => navigate('/login')}
    />
  );
};

// ─── Root component ──────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <main className="min-h-screen">
            <AppRoutes />
          </main>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
