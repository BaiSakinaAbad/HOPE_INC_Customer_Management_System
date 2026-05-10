import React from 'react';
import { useLocation } from 'react-router-dom';
import { NavigationProvider, useNavigation } from '../../providers/NavigationProvider';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { DashboardReports } from '../../components/dashboard/DashboardReports';
import { useAuth } from '../../providers/AuthProvider';
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
 */
const DashboardRouter: React.FC = () => {
  const { currentPage } = useNavigation();
  const { user } = useAuth();

  // Extract first name for the welcome screen
  const metadata = user?.user_metadata ?? {};
  const fullName = (metadata.full_name as string | undefined)
    || `${(metadata.first_name as string | undefined) ?? ''} ${(metadata.last_name as string | undefined) ?? ''}`.trim();
  const displayName = fullName || (metadata.username as string | undefined) || user?.email || 'User';
  const firstName = (metadata.first_name as string | undefined) || displayName.split(' ')[0] || 'User';

  /**
   * Switches between different dashboard sections based on the navigation state.
   */
  const renderPage = () => {
    switch (currentPage) {
      case 'customers': return <CustomerListPage />;
      case 'deleted':   return <DeletedCustomersPage />;
      case 'employees': return <EmployeeListPage />;
      case 'products':  return <ProductCataloguePage />;
      case 'sales':     return <SalesPage />;
      case 'logs':      return <LogsPage />;
      default:          return <DashboardReports firstName={firstName} />;
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
 */
const Dashboard: React.FC = () => {
  const { role } = useAuth();
  const location = useLocation();

  // Derive initial page from URL pathname so refresh preserves the current view.
  // Falls back to role-based default if the URL doesn't match a known page.
  const urlPage = pathToPageId(location.pathname);
  
  // Only superadmin gets the dashboard home; others default to customers.
  const roleDefault = role === 'superadmin' ? 'dashboard' : 'customers';
  
  // If URL maps to a valid page, use it; otherwise use role default.
  const defaultPage = urlPage || roleDefault;

  return (
    <NavigationProvider defaultPage={defaultPage}>
      <DashboardRouter />
    </NavigationProvider>
  );
};

export default Dashboard;
