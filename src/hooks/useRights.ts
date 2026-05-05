/**
 * useRights — central permission hook.
 *
 * Derives boolean capability flags from the authenticated user's role
 * (sourced from AuthContext). All role comparisons are case-insensitive
 * so 'ADMIN', 'admin', and 'Admin' are treated identically.
 *
 * Role → Capabilities matrix:
 *   employee/user : canSoftDelete only
 *   admin         : + canViewInactive, canActivate, canViewStamp, canViewDeletedNav
 *   superadmin    : same as admin + canViewDashboard
 */
import { useAuth } from '../providers/AuthProvider';

export interface Rights {
  /** Can see INACTIVE customers (admin / superadmin only). */
  canViewInactive: boolean;
  /** Can restore soft-deleted customers (admin / superadmin only). */
  canActivate: boolean;
  /** Can soft-delete any customer (all roles). */
  canSoftDelete: boolean;
  /** Can see the `stamp` audit column (admin / superadmin only). */
  canViewStamp: boolean;
  /** Can see the "Deleted Customers" sidebar link (admin / superadmin only). */
  canViewDeletedNav: boolean;

  canManageEmployees: boolean;
  canViewLogs: boolean;
  /** Can see the Dashboard home page (superadmin only). */
  canViewDashboard: boolean;
}

const ELEVATED_ROLES = ['admin', 'superadmin'] as const;

export function useRights(): Rights {
  const { role } = useAuth();
  const normalizedRole = (role ?? '').toLowerCase();
  const isElevated = (ELEVATED_ROLES as readonly string[]).includes(normalizedRole);
  const isSuperAdmin = normalizedRole === 'superadmin';

  return {
    canViewInactive:    isElevated,
    canActivate:        isElevated,
    canSoftDelete:      true,        // all authenticated roles
    canViewStamp:       isElevated,
    canViewDeletedNav:  isElevated,
    canManageEmployees: isElevated,
    canViewLogs:        isElevated,
    canViewDashboard:   isSuperAdmin,
  };
}
