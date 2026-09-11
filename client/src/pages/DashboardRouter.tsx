import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { AdminDashboard } from './AdminDashboard';
import { ManagerDashboard } from './ManagerDashboard';
import { DeveloperDashboard } from './DeveloperDashboard';

export const DashboardRouter: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === 'ADMIN') {
    return <AdminDashboard />;
  }

  if (user.role === 'PROJECT_MANAGER') {
    return <ManagerDashboard />;
  }

  return <DeveloperDashboard />;
};
