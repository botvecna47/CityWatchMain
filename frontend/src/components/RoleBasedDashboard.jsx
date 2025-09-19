import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from '../pages/Dashboard';
import AuthorityDashboard from '../pages/AuthorityDashboard';
import AdminDashboard from '../pages/AdminDashboard';

const RoleBasedDashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'authority':
      return <AuthorityDashboard />;
    case 'citizen':
    default:
      return <Dashboard />;
  }
};

export default RoleBasedDashboard;
