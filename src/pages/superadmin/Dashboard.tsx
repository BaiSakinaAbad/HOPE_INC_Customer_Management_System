import React from 'react';
import { NavigationProvider, useNavigation } from '../../providers/NavigationProvider';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { DashboardReports } from '../../components/dashboard/DashboardReports';
import { useAuth } from '../../providers/AuthProvider';
import { EmployeeListPage } from '../employees/EmployeeListPage';

import { CustomerListPage, DeletedCustomersPage } from '../customers';
import { ProductCataloguePage } from '../products/ProductCataloguePage';
import { SalesPage } from '../sales/SalesPage';
import { LogsPage } from '../audits/LogsPage';

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
 * based on the user's role.
 */
const Dashboard: React.FC = () => {
  const { role } = useAuth();
  // Only superadmin gets the dashboard home; admin and employee/user land on customers.
  const defaultPage = role === 'superadmin' ? 'dashboard' : 'customers';
  return (
    <NavigationProvider defaultPage={defaultPage}>
      <DashboardRouter />
    </NavigationProvider>
  );
};

export default Dashboard;
