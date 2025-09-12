import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Link, useSearchParams } from 'react-router-dom';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              {user.profilePictureUrl ? (
                <LazyImage
                  src={user.profilePictureUrl}
                  alt={user.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 font-medium text-lg">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome, {user.username}!
                </h1>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                  {user.bio && (
                    <span className="text-sm text-gray-600 max-w-xs truncate">
                      {user.bio}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <SummaryStats stats={stats} loading={statsLoading} />

        {/* Filter Buttons */}
        <FeedFilter activeFilter={activeFilter} onFilterChange={handleFilterChange} />

        {/* Feed */}
        <div className="space-y-4">
          {feedLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          ) : feedItems.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeFilter === 'all' 
                  ? 'No reports, alerts, or events yet.' 
                  : `No ${activeFilter} found.`}
              </p>
              <div className="mt-6">
                {activeFilter === 'reports' || activeFilter === 'all' ? (
                  <Link
                    to="/reports/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Report
                  </Link>
                ) : activeFilter === 'events' || activeFilter === 'all' ? (
                  <Link
                    to="/events"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Event
                  </Link>
                ) : null}
              </div>
            </div>
          ) : (
            feedItems.map((item) => (
              <FeedCard
                key={`${item.type}-${item.id}`}
                item={item}
                type={item.type}
                user={user}
                onDelete={(id) => handleDelete(id, item.type)}
              />
            ))
          )}
        </div>

        {/* Load More Button */}
        {pagination.pages > 1 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => fetchFeedData(activeFilter, pagination.page + 1)}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
