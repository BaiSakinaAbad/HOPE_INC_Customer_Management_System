import React from 'react';
import { DashboardLayout } from '../../layouts/SuperAdminLayout';

/**
 * SuperAdminDashboardPage — Page
 * Entry-point page for the Super Admin Dashboard.
 * Renders the DashboardLayout shell, which composes all
 * dashboard composites and elements internally.
 */
const SuperAdminDashboard: React.FC = () => {
  return <DashboardLayout />;
};

export default SuperAdminDashboard;
