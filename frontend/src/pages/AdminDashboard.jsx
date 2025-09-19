import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import Button from '../components/ui/Button';
import AnalyticsCharts from '../components/charts/AnalyticsCharts';
import {
  Users,
  FileText,
  Shield,
  TrendingUp,
  Settings,
  LogOut,
  Plus
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout, makeAuthenticatedRequest } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  
  // Data states
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReports: 0,
    totalCities: 0,
    activeReports: 0
  });
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('📊 Fetching admin dashboard data for user:', user.username);

      // Fetch basic stats
      setStats({
        totalUsers: 150,
        totalReports: 1250,
        totalCities: 25,
        activeReports: 89
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.username}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleLogout}
                variant="secondary"
                size="sm"
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-xl">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-xl">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cities</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCities}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-warning-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Reports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeReports}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="mb-8">
          <AnalyticsCharts />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/admin/users">
                <Button variant="outline" fullWidth leftIcon={<Users className="w-4 h-4" />}>
                  Manage Users
                </Button>
              </Link>
              <Link to="/admin/reports">
                <Button variant="outline" fullWidth leftIcon={<FileText className="w-4 h-4" />}>
                  Manage Reports
                </Button>
              </Link>
              <Link to="/admin/settings">
                <Button variant="outline" fullWidth leftIcon={<Settings className="w-4 h-4" />}>
                  System Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;