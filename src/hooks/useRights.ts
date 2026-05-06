/**
 * useRights — central permission hook.
 *
 * Derives boolean capability flags from the authenticated user's
 * database-backed permissions (sourced from AuthContext.permissions).
 *
 * Falls back to role-based checks for flags that don't have explicit
 * permission IDs in the DB (e.g. canViewDashboard).
 *
 * Permission IDs (from app_permission table):
 *   ADM_USER          → canActivateUsers
 *   ADM_VIEW          → canManageEmployees (view user list)
 *   ADM_ROLE          → canChangeRoles
 *   ADM_DEACTIVATE    → canDeactivateUsers
 *   CUST_ADD          → canAddCustomer
 *   CUST_DEL          → canSoftDelete
 *   CUST_EDIT         → canEditCustomer
 *   CUST_VIEW         → canViewCustomers
 *   CUST_VIEW_INACTIVE → canViewInactive
 *   CUST_RECOVER      → canActivate (restore soft-deleted customers)
 *   CUST_STAMP        → canViewStamp
 *   PRICE_VIEW        → canViewPriceHistory
 *   PROD_VIEW         → canViewProducts
 *   SALES_VIEW        → canViewSales
 *   SD_VIEW           → canViewSalesDetail
 */
import { useAuth } from '../providers/AuthProvider';

export interface Rights {
  // ── Customer Management ──
  canViewCustomers: boolean;
  canAddCustomer: boolean;
  canEditCustomer: boolean;
  canSoftDelete: boolean;
  canViewInactive: boolean;
  canActivate: boolean;
  canViewStamp: boolean;

  // ── Sales & Products ──
  canViewSales: boolean;
  canViewSalesDetail: boolean;
  canViewProducts: boolean;
  canViewPriceHistory: boolean;

  // ── User Administration ──
  canManageEmployees: boolean;
  canActivateUsers: boolean;
  canChangeRoles: boolean;
  canDeactivateUsers: boolean;

  // ── Derived (role-based, no DB permission) ──
  canViewDeletedNav: boolean;
  canViewLogs: boolean;
  canViewDashboard: boolean;
}

const p = (permissions: Record<string, boolean>, id: string): boolean =>
  permissions[id] === true;

export function useRights(): Rights {
  const { role, permissions } = useAuth();
  const normalizedRole = (role ?? '').toLowerCase();
  const isElevated = normalizedRole === 'admin' || normalizedRole === 'superadmin';
  const isSuperAdmin = normalizedRole === 'superadmin';

  return {
    // ── DB-backed permissions ──
    canViewCustomers:   p(permissions, 'CUST_VIEW'),
    canAddCustomer:     p(permissions, 'CUST_ADD'),
    canEditCustomer:    p(permissions, 'CUST_EDIT'),
    canSoftDelete:      p(permissions, 'CUST_DEL'),
    canViewInactive:    p(permissions, 'CUST_VIEW_INACTIVE'),
    canActivate:        p(permissions, 'CUST_RECOVER'),
    canViewStamp:       p(permissions, 'CUST_STAMP'),

    canViewSales:       p(permissions, 'SALES_VIEW'),
    canViewSalesDetail: p(permissions, 'SD_VIEW'),
    canViewProducts:    p(permissions, 'PROD_VIEW'),
    canViewPriceHistory: p(permissions, 'PRICE_VIEW'),

    canManageEmployees: p(permissions, 'ADM_VIEW'),
    canActivateUsers:   p(permissions, 'ADM_USER'),
    canChangeRoles:     p(permissions, 'ADM_ROLE'),
    canDeactivateUsers: p(permissions, 'ADM_DEACTIVATE'),

    // ── Role-derived (no matching DB permission) ──
    canViewDeletedNav:  isElevated,
    canViewLogs:        isElevated,
    canViewDashboard:   isSuperAdmin,
  };
}
