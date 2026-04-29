import React from 'react';
import { NavigationProvider, useNavigation } from '../../providers/NavigationProvider';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { MainContent } from '../../components/common/MainContent';
import { useWindowWidth, BP } from '../../hooks/useWindowWidth';
import { useAuth } from '../../providers/AuthProvider';
import { EmployeeListPage } from '../employees/EmployeeListPage';

import { CustomerListPage, DeletedCustomersPage } from '../customers';
import { ProductCataloguePage } from '../products/ProductCataloguePage';
import { SalesPage } from '../sales/SalesPage';
import { LogsPage } from '../logs/LogsPage';

const DashboardRouter: React.FC = () => {
  const { currentPage } = useNavigation();
  const { user } = useAuth();
  const width = useWindowWidth();

  // Extract first name for the welcome screen
  const metadata = user?.user_metadata ?? {};
  const fullName = (metadata.full_name as string | undefined)
    || `${(metadata.first_name as string | undefined) ?? ''} ${(metadata.last_name as string | undefined) ?? ''}`.trim();
  const displayName = fullName || (metadata.username as string | undefined) || user?.email || 'User';
  const firstName = (metadata.first_name as string | undefined) || displayName.split(' ')[0] || 'User';

  const renderPage = () => {
    switch (currentPage) {
      case 'customers': return <CustomerListPage />;
      case 'deleted':   return <DeletedCustomersPage />;
      case 'employees': return <EmployeeListPage />;
      case 'products':  return <ProductCataloguePage />;
      case 'sales':     return <SalesPage />;
      case 'logs':      return <LogsPage />;
      default:          return <MainContent isMobile={width < BP.mobile} firstName={firstName} />;
    }
  };

  return (
    <DashboardLayout>
      {renderPage()}
    </DashboardLayout>
  );
};

// Wrap the router in the Navigation Provider
const Dashboard: React.FC = () => {
  return (
    <NavigationProvider>
      <DashboardRouter />
    </NavigationProvider>
  );
};

export default Dashboard;