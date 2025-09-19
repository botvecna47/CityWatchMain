import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../../contexts/AuthContext';
import { API_ENDPOINTS } from '../../config/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsCharts = () => {
  const { makeAuthenticatedRequest, user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user has admin role
  if (!user || user.role !== 'admin') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="h-64 bg-red-50 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">🚫</div>
              <p className="text-red-600">Access denied. Admin privileges required.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all analytics data in parallel
      const [dashboardRes, usersRes, reportsRes, eventsRes, alertsRes] = await Promise.all([
        makeAuthenticatedRequest(API_ENDPOINTS.ANALYTICS_DASHBOARD),
        makeAuthenticatedRequest(API_ENDPOINTS.ANALYTICS_USERS),
        makeAuthenticatedRequest(API_ENDPOINTS.ANALYTICS_REPORTS),
        makeAuthenticatedRequest(API_ENDPOINTS.ANALYTICS_EVENTS),
        makeAuthenticatedRequest(API_ENDPOINTS.ANALYTICS_ALERTS)
      ]);

      // Check each response individually and log specific errors
      const responses = [
        { name: 'Dashboard', res: dashboardRes },
        { name: 'Users', res: usersRes },
        { name: 'Reports', res: reportsRes },
        { name: 'Events', res: eventsRes },
        { name: 'Alerts', res: alertsRes }
      ];

      const failedResponses = responses.filter(r => !r.res.ok);
      if (failedResponses.length > 0) {
        console.error('Failed analytics endpoints:', failedResponses.map(r => ({
          name: r.name,
          status: r.res.status,
          statusText: r.res.statusText
        })));
        
        // Try to get error details from failed responses
        const errorDetails = await Promise.all(
          failedResponses.map(async (r) => {
            try {
              const errorData = await r.res.json();
              return { name: r.name, error: errorData };
            } catch {
              return { name: r.name, error: 'Could not parse error response' };
            }
          })
        );
        
        console.error('Error details:', errorDetails);
        
        // If all endpoints failed, throw an error
        if (failedResponses.length === responses.length) {
          throw new Error(`Failed to fetch all analytics data: ${failedResponses.map(r => r.name).join(', ')}`);
        }
        
        // If only some endpoints failed, continue with available data
        console.warn(`Some analytics endpoints failed, continuing with available data`);
      }

      // Parse successful responses only
      const successfulResponses = responses.filter(r => r.res.ok);
      const parsedData = await Promise.all(
        successfulResponses.map(async (r) => {
          const data = await r.res.json();
          return { name: r.name, data: data.data };
        })
      );

      // Build analytics data object with available data
      const analyticsDataObj = {};
      parsedData.forEach(({ name, data }) => {
        switch (name) {
          case 'Dashboard':
            analyticsDataObj.overview = data;
            break;
          case 'Users':
            analyticsDataObj.users = data;
            break;
          case 'Reports':
            analyticsDataObj.reports = data;
            break;
          case 'Events':
            analyticsDataObj.events = data;
            break;
          case 'Alerts':
            analyticsDataObj.alerts = data;
            break;
        }
      });

      setAnalyticsData(analyticsDataObj);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError(`Failed to load analytics data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="h-64 bg-red-50 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchAnalyticsData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return null;
  }

  // Check if we have any data at all
  const hasAnyData = Object.keys(analyticsData).length > 0;
  if (!hasAnyData) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="h-64 bg-yellow-50 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="text-yellow-500 text-4xl mb-4">📊</div>
              <p className="text-yellow-600 mb-4">No analytics data available</p>
              <button
                onClick={fetchAnalyticsData}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check for missing data sections and show warning
  const missingSections = [];
  if (!analyticsData.overview) missingSections.push('Overview');
  if (!analyticsData.users) missingSections.push('Users');
  if (!analyticsData.reports) missingSections.push('Reports');
  if (!analyticsData.events) missingSections.push('Events');
  if (!analyticsData.alerts) missingSections.push('Alerts');

  // Chart configurations with defensive programming
  const reportsByStatusConfig = {
    type: 'doughnut',
    data: {
      labels: analyticsData.reports?.byStatus ? Object.keys(analyticsData.reports.byStatus) : [],
      datasets: [{
        data: analyticsData.reports?.byStatus ? Object.values(analyticsData.reports.byStatus) : [],
        backgroundColor: [
          '#EF4444', // Red for OPEN
          '#F59E0B', // Amber for IN_PROGRESS
          '#10B981', // Green for RESOLVED
          '#6B7280'  // Gray for CLOSED
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        title: {
          display: true,
          text: 'Reports by Status'
        }
      }
    }
  };

  const reportsByCategoryConfig = {
    type: 'bar',
    data: {
      labels: analyticsData.reports?.byCategory ? Object.keys(analyticsData.reports.byCategory) : [],
      datasets: [{
        label: 'Number of Reports',
        data: analyticsData.reports?.byCategory ? Object.values(analyticsData.reports.byCategory) : [],
        backgroundColor: '#3B82F6',
        borderColor: '#1D4ED8',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Reports by Category'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };

  const usersByRoleConfig = {
    type: 'doughnut',
    data: {
      labels: analyticsData.users?.byRole ? Object.keys(analyticsData.users.byRole) : [],
      datasets: [{
        data: analyticsData.users?.byRole ? Object.values(analyticsData.users.byRole) : [],
        backgroundColor: [
          '#8B5CF6', // Purple for CITIZEN
          '#F59E0B', // Amber for AUTHORITY
          '#EF4444'  // Red for ADMIN
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        title: {
          display: true,
          text: 'Users by Role'
        }
      }
    }
  };

  const reportsOverTimeConfig = {
    type: 'line',
    data: {
      labels: analyticsData.reports?.overTime ? analyticsData.reports.overTime.map(item => 
        new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      ) : [],
      datasets: [{
        label: 'Reports Created',
        data: analyticsData.reports?.overTime ? analyticsData.reports.overTime.map(item => item.count) : [],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Reports Created Over Time (Last 30 Days)'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };

  const usersOverTimeConfig = {
    type: 'line',
    data: {
      labels: analyticsData.users?.overTime ? analyticsData.users.overTime.map(item => 
        new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      ) : [],
      datasets: [{
        label: 'New Users',
        data: analyticsData.users?.overTime ? analyticsData.users.overTime.map(item => item.count) : [],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'New Users Over Time (Last 30 Days)'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };

  const reportsByCityConfig = {
    type: 'bar',
    data: {
      labels: analyticsData.reports?.byCity ? Object.keys(analyticsData.reports.byCity) : [],
      datasets: [{
        label: 'Number of Reports',
        data: analyticsData.reports?.byCity ? Object.values(analyticsData.reports.byCity) : [],
        backgroundColor: '#F59E0B',
        borderColor: '#D97706',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Reports by City'
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'reports', label: 'Reports', icon: '📋' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'trends', label: 'Trends', icon: '📈' }
  ];

  return (
    <div className="space-y-6">
      {/* Warning for missing data sections */}
      {missingSections.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
        >
          <div className="flex items-center">
            <div className="text-yellow-500 text-xl mr-3">⚠️</div>
            <div>
              <p className="text-yellow-800 font-medium">Partial Data Available</p>
              <p className="text-yellow-700 text-sm">
                Some analytics sections are unavailable: {missingSections.join(', ')}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
      >
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80">
              <Doughnut {...reportsByStatusConfig} />
            </div>
            <div className="h-80">
              <Doughnut {...usersByRoleConfig} />
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="h-80">
              <Bar {...reportsByCategoryConfig} />
            </div>
            <div className="h-80">
              <Bar {...reportsByCityConfig} />
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="h-80">
              <Doughnut {...usersByRoleConfig} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {analyticsData.users?.verified || 0}
                </div>
                <div className="text-sm text-blue-600">Verified Users</div>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-red-600">
                  {analyticsData.users?.banned || 0}
                </div>
                <div className="text-sm text-red-600">Banned Users</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600">
                  {analyticsData.overview?.totalUsers > 0 
                    ? Math.round(((analyticsData.users?.verified || 0) / analyticsData.overview.totalUsers) * 100)
                    : 0}%
                </div>
                <div className="text-sm text-green-600">Verification Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="h-80">
              <Line {...reportsOverTimeConfig} />
            </div>
            <div className="h-80">
              <Line {...usersOverTimeConfig} />
            </div>
          </div>
        )}
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="text-2xl font-bold">{analyticsData.overview?.avgResolutionTime || 0}</div>
            <div className="text-sm opacity-90">Avg Resolution Time (Days)</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
            <div className="text-2xl font-bold">
              {analyticsData.overview?.totalReports > 0 
                ? Math.round(((analyticsData.overview?.resolvedReports || 0) / analyticsData.overview.totalReports) * 100)
                : 0}%
            </div>
            <div className="text-sm opacity-90">Resolution Rate</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="text-2xl font-bold">{analyticsData.overview?.totalEvents || 0}</div>
            <div className="text-sm opacity-90">Total Events</div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
            <div className="text-2xl font-bold">{analyticsData.overview?.totalAlerts || 0}</div>
            <div className="text-sm opacity-90">Active Alerts</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsCharts;
