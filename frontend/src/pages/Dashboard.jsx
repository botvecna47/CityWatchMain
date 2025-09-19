import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Link } from 'react-router-dom';
import LazyImage from '../components/LazyImage';
import CityMap from '../components/CityMap';
import Button from '../components/ui/Button';
import { API_ENDPOINTS } from '../config/api';
import { Plus, LogOut } from 'lucide-react';

const Dashboard = () => {
  const { user, logout, makeAuthenticatedRequest, loading: authLoading } = useAuth();
  const { success, error: showError } = useToast();
  
  // Data states
  const [announcements, setAnnouncements] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [trendingReports, setTrendingReports] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const handleLogout = () => {
    logout();
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setDataLoading(true);
      console.log('📊 Fetching dashboard data for user:', user.username, 'City ID:', user.cityId);

      // Check if user has a city assigned
      if (!user.cityId) {
        console.log('⚠️ User has no city assigned');
        setAnnouncements([]);
        setAlerts([]);
        setTrendingReports([]);
        return;
      }

      // Fetch announcements (using events as announcements for now)
      try {
        const announcementsResponse = await makeAuthenticatedRequest(`${API_ENDPOINTS.EVENTS}?limit=5`);
        if (announcementsResponse.ok) {
          const announcementsData = await announcementsResponse.json();
          console.log('📅 Fetched events:', announcementsData.events?.length || 0);
          setAnnouncements(announcementsData.events || []);
        } else {
          console.log('❌ Failed to fetch events:', announcementsResponse.status);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }

      // Fetch alerts
      try {
        const alertsResponse = await makeAuthenticatedRequest(`${API_ENDPOINTS.ALERTS}?limit=5`);
        if (alertsResponse.ok) {
          const alertsData = await alertsResponse.json();
          console.log('🚨 Fetched alerts:', alertsData.alerts?.length || 0);
          setAlerts(alertsData.alerts || []);
        } else {
          console.log('❌ Failed to fetch alerts:', alertsResponse.status);
        }
      } catch (error) {
        console.error('Error fetching alerts:', error);
      }

      // Fetch trending reports (most commented)
      try {
        const reportsResponse = await makeAuthenticatedRequest(`${API_ENDPOINTS.REPORTS}?limit=10`);
        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json();
          console.log('📝 Fetched reports:', reportsData.reports?.length || 0);
          // Sort by comment count (trending)
          const sortedReports = (reportsData.reports || []).sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
          setTrendingReports(sortedReports.slice(0, 7));
        } else {
          console.log('❌ Failed to fetch reports:', reportsResponse.status);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
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

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'authority':
        return 'bg-blue-100 text-blue-800';
      case 'citizen':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
    <div className="min-h-screen bg-slate-50">
      {/* Header with Create Report Button */}
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
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Welcome, {user.username}!
                </h1>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
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
                  You need to be assigned to a city to view reports, events, and alerts. Please contact an administrator or update your profile.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Announcements & Alerts */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Announcements */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Announcements</h2>
                <Link to="/events" className="text-sm text-blue-600 hover:text-blue-800">See all</Link>
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
              ) : announcements.length === 0 ? (
                <div className="text-center py-4">
                  <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500 text-sm">No events scheduled</p>
                  <p className="text-gray-400 text-xs mt-1">Check back later for updates</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="border-l-4 border-blue-500 pl-3">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {announcement.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(announcement.dateTime)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Alerts */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">City Alerts</h2>
                <Link to="/alerts" className="text-sm text-blue-600 hover:text-blue-800">See all</Link>
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
                  <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 text-sm">No alerts at this time</p>
                  <p className="text-gray-400 text-xs mt-1">All systems running smoothly</p>
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
          </div>

          {/* Right Column - Trending Reports */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Trending Reports</h2>
                <Link to="/reports" className="text-sm text-blue-600 hover:text-blue-800">See all</Link>
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
              ) : trendingReports.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No reports yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Be the first to create a report!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trendingReports.map((report) => (
                    <div key={report.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-gray-600">
                            {report.author?.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                              {report.title}
                            </h3>
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
                            <span>{report.comments?.length || 0} comments</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Section - Full Width */}
        <div className="mt-8">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">City Map</h2>
            <CityMap height="450px" showNearbyToggle={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;