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
  const [alerts, setAlerts] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    openReports: 0,
    inProgressReports: 0,
    resolvedReports: 0,
    totalAlerts: 0,
    totalEvents: 0
  });
  const [dataLoading, setDataLoading] = useState(true);

  const handleLogout = () => {
    logout();
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setDataLoading(true);
      console.log('📊 Fetching authority dashboard data for user:', user.username, 'City ID:', user.cityId);

      // Check if user has a city assigned
      if (!user.cityId) {
        console.log('⚠️ User has no city assigned');
        setReports([]);
        setAlerts([]);
        setEvents([]);
        return;
      }

      // Fetch reports for authority management
      try {
        const reportsResponse = await makeAuthenticatedRequest(`${API_ENDPOINTS.REPORTS}?limit=10`);
        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json();
          console.log('📝 Fetched reports:', reportsData.reports?.length || 0);
          setReports(reportsData.reports || []);
          
          // Calculate stats
          const totalReports = reportsData.reports?.length || 0;
          const openReports = reportsData.reports?.filter(r => r.status === 'OPEN').length || 0;
          const inProgressReports = reportsData.reports?.filter(r => r.status === 'IN_PROGRESS').length || 0;
          const resolvedReports = reportsData.reports?.filter(r => r.status === 'RESOLVED').length || 0;
          
          setStats(prev => ({
            ...prev,
            totalReports,
            openReports,
            inProgressReports,
            resolvedReports
          }));
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      }

      // Fetch alerts
      try {
        const alertsResponse = await makeAuthenticatedRequest(`${API_ENDPOINTS.ALERTS}?limit=5`);
        if (alertsResponse.ok) {
          const alertsData = await alertsResponse.json();
          console.log('🚨 Fetched alerts:', alertsData.alerts?.length || 0);
          setAlerts(alertsData.alerts || []);
          setStats(prev => ({ ...prev, totalAlerts: alertsData.alerts?.length || 0 }));
        }
      } catch (error) {
        console.error('Error fetching alerts:', error);
      }

      // Fetch events
      try {
        const eventsResponse = await makeAuthenticatedRequest(`${API_ENDPOINTS.EVENTS}?limit=5`);
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          console.log('📅 Fetched events:', eventsData.events?.length || 0);
          setEvents(eventsData.events || []);
          setStats(prev => ({ ...prev, totalEvents: eventsData.events?.length || 0 }));
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showError('Failed to load dashboard data');
    } finally {
      setDataLoading(false);
    }
  };

  // Load data when user changes
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'GARBAGE':
        return 'bg-green-100 text-green-800';
      case 'ROAD':
        return 'bg-orange-100 text-orange-800';
      case 'WATER':
        return 'bg-blue-100 text-blue-800';
      case 'POWER':
        return 'bg-yellow-100 text-yellow-800';
      case 'OTHER':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              {user.profilePictureUrl ? (
                <LazyImage
                  src={user.profilePictureUrl}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Authority Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome, {user.username} • {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/alerts"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Manage Alerts
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* No City Assigned Warning */}
        {!user.cityId && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  City Assignment Required
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You need to be assigned to a city to manage reports, events, and alerts. Please contact an administrator.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open Reports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.openReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgressReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.resolvedReports}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Recent Reports */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
                <Link to="/reports" className="text-sm text-blue-600 hover:text-blue-800">View all</Link>
              </div>
              
              {dataLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse border-b border-gray-200 pb-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="flex space-x-2">
                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                            <div className="h-6 bg-gray-200 rounded w-20"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-sm font-medium text-gray-900 mb-2">No reports yet</h3>
                  <p className="text-sm text-gray-500">Reports from citizens will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-gray-600">
                            {report.author?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <Link 
                              to={`/reports/${report.id}`}
                              className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
                            >
                              {report.title}
                            </Link>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                              {report.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {report.description}
                          </p>
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(report.category)}`}>
                              {report.category}
                            </span>
                            <span>{formatDate(report.createdAt)}</span>
                            <span className="flex items-center">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              {report.comments?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Alerts & Events */}
          <div className="space-y-6">
            
            {/* Alerts */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">City Alerts</h2>
                <Link to="/alerts" className="text-sm text-blue-600 hover:text-blue-800">Manage</Link>
              </div>
              
              {dataLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : alerts.length === 0 ? (
                <div className="text-center py-4">
                  <AlertTriangle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">No alerts posted</p>
                  <p className="text-gray-400 text-xs mt-1">Create alerts to inform citizens</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="border-l-4 border-red-500 pl-3">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {alert.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(alert.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Events */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
                <Link to="/events" className="text-sm text-blue-600 hover:text-blue-800">Manage</Link>
              </div>
              
              {dataLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-4">
                  <Calendar className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">No events scheduled</p>
                  <p className="text-gray-400 text-xs mt-1">Create events for the community</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.id} className="border-l-4 border-green-500 pl-3">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(event.dateTime)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Section - Full Width */}
        <div className="mt-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">City Map</h2>
            <CityMap height="450px" showNearbyToggle={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorityDashboard;
