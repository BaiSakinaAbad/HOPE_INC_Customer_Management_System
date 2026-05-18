// src/pages/superadmin/Dashboard.tsx
// Root dashboard for superadmins and admins, hosting the main application navigation,
// role-gated page routing, and a welcome screen with personalized greeting.
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NavigationProvider, useNavigation } from '../../providers/NavigationProvider';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { DashboardReports } from '../../components/dashboard/DashboardReports';
import { useAuth } from '../../providers/AuthProvider';
import { useRights } from '../../hooks/useRights';
import { AccessDenied } from '../../components/common';
import { EmployeeListPage } from '../employees/EmployeeListPage';

import { CustomerListPage, DeletedCustomersPage } from '../customers';
import { ProductCataloguePage } from '../products/ProductCataloguePage';
import { SalesPage } from '../sales/SalesPage';
import { LogsPage } from '../audits/LogsPage';
import type { PageId } from '../../providers/NavigationProvider';

/**
 * Maps the current URL pathname to the internal PageId used by NavigationProvider.
 */
const pathToPageId = (pathname: string): PageId => {
  const segment = pathname.replace(/^\//, '').split('/')[0]?.toLowerCase() || '';
  const map: Record<string, PageId> = {
    dashboard: 'dashboard',
    customers: 'customers',
    deleted: 'deleted',
    sales: 'sales',
    products: 'products',
    employees: 'employees',
    logs: 'logs',
  };
  return map[segment] || 'dashboard';
};

/**
 * DashboardRouter handles the conditional rendering of pages based on the current navigation state.
 * Each page is gated by its corresponding permission from useRights().
 */
const DashboardRouter: React.FC = () => {
  const { currentPage } = useNavigation();
  const { user } = useAuth();
  const {
    canViewCustomers,
    canViewSales,
    canViewProducts,
    canViewInactive,
    canManageEmployees,
    canViewLogs,
    canViewDashboard,
  } = useRights();

  // Extract first name for the welcome screen
  const metadata = user?.user_metadata ?? {};
  const fullName = (metadata.full_name as string | undefined)
    || `${(metadata.first_name as string | undefined) ?? ''} ${(metadata.last_name as string | undefined) ?? ''}`.trim();
  const displayName = fullName || (metadata.username as string | undefined) || user?.email || 'User';
  const firstName = (metadata.first_name as string | undefined) || displayName.split(' ')[0] || 'User';

  const reactNavigate = useNavigate();

  React.useEffect(() => {
    const pageNames: Record<PageId, string> = {
      dashboard: 'Dashboard',
      customers: 'Customers',
      deleted: 'Deleted Customers',
      sales: 'Sales',
      products: 'Products',
      employees: 'Employees',
      logs: 'Audit Logs'
    };
    document.title = `BiteLog | ${pageNames[currentPage] || 'Dashboard'}`;
    reactNavigate(`/${currentPage}`, { replace: true });
  }, [currentPage, reactNavigate]);

  /**
   * Switches between different dashboard sections based on the navigation state.
   * Each route is guarded by its DB-backed permission flag.
   */
  const renderPage = () => {
    switch (currentPage) {
      case 'customers':
        if (!canViewCustomers) return <AccessDenied message="You do not have permission to view customers." />;
        return <CustomerListPage />;
      case 'deleted':
        if (!canViewInactive) return <AccessDenied message="Viewing deleted records requires the appropriate permission." />;
        return <DeletedCustomersPage />;
      case 'employees':
        if (!canManageEmployees) return <AccessDenied message="User management requires Admin or SuperAdmin privileges." />;
        return <EmployeeListPage />;
      case 'products':
        if (!canViewProducts) return <AccessDenied message="You do not have permission to view products." />;
        return <ProductCataloguePage />;
      case 'sales':
        if (!canViewSales) return <AccessDenied message="You do not have permission to view sales." />;
        return <SalesPage />;
      case 'logs':
        if (!canViewLogs) return <AccessDenied message="Audit logs require Admin or SuperAdmin privileges." />;
        return <LogsPage />;
      default:
        if (!canViewDashboard) return <AccessDenied message="Dashboard access requires SuperAdmin privileges." />;
        return <DashboardReports firstName={firstName} />;
    }
  };

  return (
    <DashboardLayout>
      {renderPage()}
    </DashboardLayout>
  );
};

// Wrap the router in the Navigation Provider
/**
 * Root Dashboard component that initializes the navigation context with a default page
 * based on the user's role and current URL.
 *
 * IMPORTANT: We must wait for `role` to be loaded before rendering NavigationProvider,
 * because NavigationProvider's useState initializer only runs ONCE. If role is null
 * on first render, defaultPage would be 'customers' even for superadmins, and it
 * would never update.
 */
const Dashboard: React.FC = () => {
  const { role, loading } = useAuth();
  const { canViewDashboard } = useRights();
  const location = useLocation();

  // Don't render until role is known — otherwise NavigationProvider
  // initializes with the wrong defaultPage and never corrects it.
  if (!role) return null;

  // Derive initial page from URL pathname so refresh preserves the current view.
  // Falls back to role-based default if the URL doesn't match a known page.
  // We only use the URL if it's not the root path (/) which should just route to default
  const urlPage = location.pathname !== '/' && location.pathname !== '' ? pathToPageId(location.pathname) : null;
  
  // Users with dashboard access land on dashboard; everyone else lands on customers.
  const roleDefault = canViewDashboard ? 'dashboard' : 'customers';
  
  // If URL maps to a valid page, use it; otherwise use role default.
  const defaultPage = urlPage || roleDefault;

  return (
    <NavigationProvider defaultPage={defaultPage}>
      <DashboardRouter />
    </NavigationProvider>
  );
};

export default Dashboard;
