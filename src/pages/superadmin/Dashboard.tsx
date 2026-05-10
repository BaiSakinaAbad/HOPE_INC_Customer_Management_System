import React from 'react';
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
 * based on the user's role.
 *
 * IMPORTANT: We must wait for `role` to be loaded before rendering NavigationProvider,
 * because NavigationProvider's useState initializer only runs ONCE. If role is null
 * on first render, defaultPage would be 'customers' even for superadmins, and it
 * would never update.
 */
const Dashboard: React.FC = () => {
  const { role, loading } = useAuth();
  const { canViewDashboard } = useRights();

  // Don't render until role is known — otherwise NavigationProvider
  // initializes with the wrong defaultPage and never corrects it.
  if (!role && loading) return null;

  // Users with dashboard access land on dashboard; everyone else lands on customers.
  const defaultPage = canViewDashboard ? 'dashboard' : 'customers';
  return (
    <NavigationProvider defaultPage={defaultPage}>
      <DashboardRouter />
    </NavigationProvider>
  );
};

export default Dashboard;
