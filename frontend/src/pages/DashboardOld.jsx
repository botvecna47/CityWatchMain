import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Link, useSearchParams } from 'react-router-dom';
import { ReportCardSkeleton, StatsCardSkeleton, ProfileSkeleton } from '../components/SkeletonLoader';
import LazyImage from '../components/LazyImage';
import FeedCard from '../components/FeedCard';
import SummaryStats from '../components/SummaryStats';
import FeedFilter from '../components/FeedFilter';

const Dashboard = () => {
  const { user, loading, logout, makeAuthenticatedRequest } = useAuth();
  const { success, error: showError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Feed data
  const [feedItems, setFeedItems] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Stats
  const [stats, setStats] = useState({ reports: 0, alerts: 0, events: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  const handleLogout = () => {
    logout();
  };

  // Initialize filter from URL params
  useEffect(() => {
    const filter = searchParams.get('filter') || 'all';
    setActiveFilter(filter);
  }, [searchParams]);

  // Fetch unified feed data
  const fetchFeedData = async (filter = 'all', page = 1) => {
    if (!user) return;

    try {
      setFeedLoading(true);
      const allItems = [];

      // Fetch reports
      if (filter === 'all' || filter === 'reports') {
        const reportsResponse = await makeAuthenticatedRequest(`http://localhost:5000/api/reports?page=${page}&limit=10`);
        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json();
          const reportsWithType = reportsData.reports.map(report => ({ ...report, type: 'report' }));
          allItems.push(...reportsWithType);
        }
      }

      // Fetch alerts
      if (filter === 'all' || filter === 'alerts') {
        const alertsResponse = await makeAuthenticatedRequest(`http://localhost:5000/api/alerts?page=${page}&limit=10`);
        if (alertsResponse.ok) {
          const alertsData = await alertsResponse.json();
          const alertsWithType = alertsData.alerts.map(alert => ({ ...alert, type: 'alert' }));
          allItems.push(...alertsWithType);
        }
      }

      // Fetch events
      if (filter === 'all' || filter === 'events') {
        const eventsResponse = await makeAuthenticatedRequest(`http://localhost:5000/api/events?page=${page}&limit=10`);
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          const eventsWithType = eventsData.events.map(event => ({ ...event, type: 'event' }));
          allItems.push(...eventsWithType);
        }
      }

      // Sort by creation date (newest first)
      allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setFeedItems(allItems);
    } catch (error) {
      console.error('Error fetching feed data:', error);
      showError('Failed to load feed data');
    } finally {
      setFeedLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    if (!user) return;

    try {
      setStatsLoading(true);
      const statsData = { reports: 0, alerts: 0, events: 0 };

      // Get reports count
      const reportsResponse = await makeAuthenticatedRequest('http://localhost:5000/api/reports?limit=1');
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        statsData.reports = reportsData.pagination?.total || 0;
      }

      // Get alerts count
      const alertsResponse = await makeAuthenticatedRequest('http://localhost:5000/api/alerts?limit=1');
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        statsData.alerts = alertsData.pagination?.total || 0;
      }

      // Get events count
      const eventsResponse = await makeAuthenticatedRequest('http://localhost:5000/api/events?limit=1');
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        statsData.events = eventsData.pagination?.total || 0;
      }

      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Load data on mount and filter change
  useEffect(() => {
    if (user) {
      fetchFeedData(activeFilter);
      fetchStats();
    }
  }, [user, activeFilter]);

  // Handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setSearchParams({ filter });
  };

  // Handle delete
  const handleDelete = async (itemId, type) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      let endpoint = '';
      switch (type) {
        case 'report':
          endpoint = `/reports/${itemId}`;
          break;
        case 'alert':
          endpoint = `/alerts/${itemId}`;
          break;
        case 'event':
          endpoint = `/events/${itemId}`;
          break;
        default:
          return;
      }

      const response = await makeAuthenticatedRequest(`http://localhost:5000/api${endpoint}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
        fetchFeedData(activeFilter); // Refresh feed
        fetchStats(); // Refresh stats
      } else {
        const errorData = await response.json();
        showError(errorData.error || `Failed to delete ${type}`);
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      showError(`Failed to delete ${type}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'authority':
        return 'bg-yellow-100 text-yellow-800';
      case 'citizen':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                {user.profilePictureUrl ? (
                  <LazyImage
                    src={`http://localhost:5000${user.profilePictureUrl}`}
                    alt="Profile"
                    className="w-full h-full"
                    placeholder={
                      <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    }
                  />
                ) : (
                  <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Dashboard
                </h1>
                <p className="text-gray-600">
                  Welcome, <span className="font-semibold">{user.username}</span>!
                </p>
                {user.bio && (
                  <p className="text-sm text-gray-500 mt-1 max-w-md">
                    {user.bio}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                  {user.city && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {user.city.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 self-start lg:self-auto"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Total Reports</h3>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{pagination.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Resolved</h3>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {reports.filter(r => r.status === 'RESOLVED').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">In Progress</h3>
                <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                  {reports.filter(r => r.status === 'IN_PROGRESS').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Section - Reports, Alerts, and Events */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Reports */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
                </div>
                <Link
                  to="/reports/create"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create Report
                </Link>
              </div>
            </div>
            <div className="p-6">
              {reportsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No reports yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.slice(0, 3).map((report) => (
                    <Link
                      key={report.id}
                      to={`/reports/${report.id}`}
                      className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                          {report.title}
                        </h3>
                        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          report.status === 'OPEN' ? 'bg-red-100 text-red-800' :
                          report.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {report.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {report.description}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <span>By {report.author.username}</span>
                        <span className="mx-1">•</span>
                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* City Alerts - Only show for citizens */}
          {user.role === 'citizen' && (
            <div className="lg:col-span-1">
              <CityAlerts />
            </div>
          )}

          {/* City Events - Only show for citizens */}
          {user.role === 'citizen' && (
            <div className="lg:col-span-1">
              <CityEvents />
            </div>
          )}

          {/* Authority/Admin view - Show alerts and events in 2 columns */}
          {(user.role === 'authority' || user.role === 'admin') && (
            <>
              <div className="lg:col-span-1">
                <CityAlerts />
              </div>
              <div className="lg:col-span-1">
                <CityEvents />
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              City Reports - {user.city?.name || 'Your City'}
            </h2>
            {user.role === 'citizen' && (
              <Link
                to="/reports/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Report
              </Link>
            )}
          </div>

          {/* Search and Filter */}
          <div className="mb-6 space-y-4">
            <div>
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedCategory === ''
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({pagination.total || 0})
              </button>
              {['GARBAGE', 'ROAD', 'WATER', 'POWER', 'OTHER'].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedCategory === category
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category} ({categoryStats[category] || 0})
                </button>
              ))}
            </div>
          </div>

          {reportsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <ReportCardSkeleton key={i} />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reports yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                {user.role === 'citizen' 
                  ? 'Get started by creating your first report.'
                  : 'No reports have been submitted in your city yet.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-3 lg:space-y-0">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0 mb-2">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900">
                          <Link 
                            to={`/reports/${report.id}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {report.title}
                          </Link>
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${getStatusColor(report.status)}`}>
                          {report.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {report.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {report.category}
                        </span>
                        <span className="flex items-center">
                          <div className="w-4 h-4 mr-1 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                            {report.author.profilePicture ? (
                              <LazyImage
                                src={`http://localhost:5000/assets/profiles/${report.author.profilePicture}`}
                                alt="Profile"
                                className="w-full h-full"
                                placeholder={
                                  <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                  </svg>
                                }
                              />
                            ) : (
                              <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="truncate">{report.author.username}</span>
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="hidden sm:inline">{formatDate(report.createdAt)}</span>
                          <span className="sm:hidden">{new Date(report.createdAt).toLocaleDateString()}</span>
                        </span>
                        {report._count && (
                          <>
                            {report._count.comments > 0 && (
                              <span className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                {report._count.comments}
                              </span>
                            )}
                            {report._count.attachments > 0 && (
                              <span className="flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                {report._count.attachments}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="lg:ml-4 lg:flex-shrink-0">
                      <Link
                        to={`/reports/${report.id}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
