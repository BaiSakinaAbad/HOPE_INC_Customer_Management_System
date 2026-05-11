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

// ─── Auth pages wrapper ──────────────────────────────────────────────────────
// If already authenticated, redirect away from login/register.
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, role, loading } = useAuth();
  if (loading || (user && !role)) return <LoadingSpinner />;
  if (user) return <Navigate to={getDefaultPathForRole(role)} replace />;
  return <>{children}</>;
};

// ─── Main App ────────────────────────────────────────────────────────────────
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<AuthRoute><LoginPageWrapper /></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><RegisterPageWrapper /></AuthRoute>} />

      {/* Protected: Superadmin-only dashboard home */}
      <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Protected: All authenticated roles (the Dashboard component handles 
          internal page switching via NavigationProvider) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/customers" element={<Dashboard />} />
        <Route path="/sales" element={<Dashboard />} />
        <Route path="/products" element={<Dashboard />} />
        <Route path="/employees" element={<Dashboard />} />
        <Route path="/logs" element={<Dashboard />} />
        <Route path="/deleted" element={<Dashboard />} />
      </Route>

      {/* Root → role-based redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Catch-all → root */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
};

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
