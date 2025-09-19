import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import LazyImage from '../components/LazyImage';
import CityMap from '../components/CityMap';
import Button from '../components/ui/Button';
import {
  FileText,
  AlertTriangle,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  MessageSquare,
  MapPin,
  LogOut
} from 'lucide-react';

const AuthorityDashboard = () => {
  const { user, logout, makeAuthenticatedRequest } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  
  // Data states
  const [reports, setReports] = useState([]);
  const [events, setEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    activeEvents: 0
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
      console.log('📊 Fetching authority dashboard data for user:', user.username);

      // Fetch reports
      try {
        const reportsResponse = await makeAuthenticatedRequest(`${API_ENDPOINTS.REPORTS}?limit=10`);
        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json();
          console.log('📋 Fetched reports:', reportsData.reports?.length || 0);
          setReports(reportsData.reports || []);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      }

      // Fetch events
      try {
        const eventsResponse = await makeAuthenticatedRequest(`${API_ENDPOINTS.EVENTS}?limit=5`);
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          console.log('📅 Fetched events:', eventsData.events?.length || 0);
          setEvents(eventsData.events || []);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }

      // Calculate stats
      const totalReports = reports.length;
      const pendingReports = reports.filter(r => r.status === 'PENDING').length;
      const resolvedReports = reports.filter(r => r.status === 'RESOLVED').length;
      const activeEvents = events.length;

      setStats({
        totalReports,
        pendingReports,
        resolvedReports,
        activeEvents
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
          <p className="text-gray-600">Loading dashboard...</p>
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
                <h1 className="text-xl font-semibold text-gray-900">Authority Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.username}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/reports/create">
                <Button
                  leftIcon={<Plus className="w-4 h-4" />}
                  size="sm"
                >
                  Create Report
                </Button>
              </Link>
              <Link
                to="/events"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Manage Events
              </Link>
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
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-warning-100 rounded-xl">
                <Clock className="w-6 h-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-success-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.resolvedReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeEvents}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
          </div>
          <div className="p-6">
            {reports.length > 0 ? (
              <div className="space-y-4">
                {reports.slice(0, 5).map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <FileText className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{report.title}</h3>
                        <p className="text-sm text-gray-500">{report.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        report.status === 'PENDING' ? 'bg-warning-100 text-warning-800' :
                        report.status === 'RESOLVED' ? 'bg-success-100 text-success-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.status}
                      </span>
                      <Link to={`/reports/${report.id}`}>
                        <Button size="sm" variant="ghost" leftIcon={<Eye className="w-4 h-4" />}>
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No reports found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorityDashboard;
