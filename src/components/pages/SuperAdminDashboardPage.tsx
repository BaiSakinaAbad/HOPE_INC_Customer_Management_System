import React from 'react';
import { DashboardLayout } from '../shells/DashboardLayout';

/**
 * SuperAdminDashboardPage — Page
 * Entry-point page for the Super Admin Dashboard.
 * Renders the DashboardLayout shell, which composes all
 * dashboard composites and elements internally.
 */
const SuperAdminDashboardPage: React.FC = () => {
  return <DashboardLayout />;
};

export default SuperAdminDashboardPage;
