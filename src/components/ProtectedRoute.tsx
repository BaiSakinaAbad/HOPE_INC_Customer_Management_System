/**
 * ProtectedRoute — guards routes based on authentication and role.
 *
 * Wraps child routes and enforces:
 * 1. User must be authenticated (redirects to /login otherwise).
 * 2. If `allowedRoles` is specified, only those roles may access the route.
 *    Unauthorized roles are redirected to their default landing page.
 * 3. Inactive users see the InactiveAccountModal.
 */
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { useTheme, getDashboardTokens } from '../providers/ThemeProvider';
import { InactiveAccountModal } from '../components/auth';
import LoadingSpinner from '../pages/auth/LoadingSpinnerPage';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

/** Returns the default landing path for a given role. */
export const getDefaultPathForRole = (role: string | null): string => {
  if (role === 'superadmin') return '/dashboard';
  return '/customers';
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, role, recordstatus, loading, signOut } = useAuth();
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);

  // Still loading auth state — show spinner
  if (loading) {
    return <LoadingSpinner />;
  }

  // Not authenticated — redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but inactive — show modal
  if (recordstatus === 'INACTIVE') {
    return <InactiveAccountModal isDark={isDark} C={C} onSignOut={signOut} />;
  }

  // Role-based access check
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to={getDefaultPathForRole(role)} replace />;
  }

  // All checks passed — render the child route
  return <Outlet />;
};
