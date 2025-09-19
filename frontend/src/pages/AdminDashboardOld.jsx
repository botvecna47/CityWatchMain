import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Users,
  FileText,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  MapPin,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Brain,
  Lightbulb,
  Shield,
  Zap
} from 'lucide-react';
import {
  KPICards,
  ReportsOverTimeChart,
  CategoryDistributionChart,
  StatusDistributionChart,
  ResponseTimeChart,
  UserActivityChart,
  PerformanceMetricsChart
} from '../components/charts/AnalyticsCharts';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ username: '', email: '', password: '', cityId: '' });
  const [dateRange, setDateRange] = useState('7d');
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, makeAuthenticatedRequest } = useAuth();

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      const response = await makeAuthenticatedRequest('http://localhost:5000/api/admin/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Fetch AI insights
  const fetchAIInsights = async () => {
    try {
      const response = await makeAuthenticatedRequest('http://localhost:5000/api/admin/ai-insights');
      if (response.ok) {
        const data = await response.json();
        setAiInsights(data.insights);
      }
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await makeAuthenticatedRequest('http://localhost:5000/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch reports
  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await makeAuthenticatedRequest('http://localhost:5000/api/admin/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports);
      }
    } catch (error) {
      setError('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const response = await makeAuthenticatedRequest('http://localhost:5000/api/admin/audit');
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.auditLogs);
      }
    } catch (error) {
      setError('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  // Update user role
  const updateUserRole = async (userId, newRole) => {
    try {
      const response = await makeAuthenticatedRequest(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        fetchUsers();
        fetchAuditLogs();
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (error) {
      setError('Failed to update user role');
    }
  };

  // Toggle user ban
  const toggleUserBan = async (userId) => {
    try {
      const response = await makeAuthenticatedRequest(`http://localhost:5000/api/admin/users/${userId}/ban`, {
        method: 'PATCH'
      });

      if (response.ok) {
        fetchUsers();
        fetchAuditLogs();
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (error) {
      setError('Failed to toggle user ban');
    }
  };

  // Delete report
  const deleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      const response = await makeAuthenticatedRequest(`http://localhost:5000/api/admin/reports/${reportId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchReports();
        fetchAuditLogs();
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (error) {
      setError('Failed to delete report');
    }
  };

  // Restore report
  const restoreReport = async (reportId) => {
    try {
      const response = await makeAuthenticatedRequest(`http://localhost:5000/api/admin/reports/${reportId}/restore`, {
        method: 'PATCH'
      });

      if (response.ok) {
        fetchReports();
        fetchAuditLogs();
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (error) {
      setError('Failed to restore report');
    }
  };

  // Create new admin
  const createAdmin = async (e) => {
    e.preventDefault();
    try {
      const response = await makeAuthenticatedRequest('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAdmin,
          role: 'admin'
        })
      });

      if (response.ok) {
        setShowCreateAdminModal(false);
        setNewAdmin({ username: '', email: '', password: '', cityId: '' });
        fetchUsers();
        fetchAuditLogs();
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (error) {
      setError('Failed to create admin');
    }
  };

  // Refresh all data
  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
    fetchStats();
    fetchAIInsights();
    fetchUsers();
    fetchReports();
    fetchAuditLogs();
  };

  // Load data on component mount
  useEffect(() => {
    fetchStats();
    fetchAIInsights();
    fetchUsers();
    fetchReports();
    fetchAuditLogs();
  }, [refreshKey]);

  // Generate sample chart data
  const generateChartData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const reportsOverTime = days.map(day => ({
      date: day,
      reports: Math.floor(Math.random() * 20) + 5
    }));

    const categoryData = [
      { name: 'Garbage', value: 35, color: '#2f83f7' },
      { name: 'Road', value: 25, color: '#16a34a' },
      { name: 'Water', value: 20, color: '#f59e0b' },
      { name: 'Power', value: 15, color: '#ef4444' },
      { name: 'Other', value: 5, color: '#8b5cf6' }
    ];

    const statusData = [
      { status: 'Open', count: 45 },
      { status: 'In Progress', count: 30 },
      { status: 'Resolved', count: 80 },
      { status: 'Closed', count: 25 }
    ];

    const responseTimeData = [
      { category: 'Garbage', responseTime: 2.5 },
      { category: 'Road', responseTime: 4.2 },
      { category: 'Water', responseTime: 1.8 },
      { category: 'Power', responseTime: 1.2 },
      { category: 'Other', responseTime: 3.1 }
    ];

    const userActivityData = days.map(day => ({
      date: day,
      newUsers: Math.floor(Math.random() * 10) + 2,
      activeUsers: Math.floor(Math.random() * 50) + 20
    }));

    const performanceData = [
      { name: 'Response Rate', value: 85, fill: '#2f83f7' },
      { name: 'Resolution Rate', value: 78, fill: '#16a34a' },
      { name: 'User Satisfaction', value: 92, fill: '#f59e0b' },
      { name: 'System Uptime', value: 99, fill: '#ef4444' }
    ];

    return {
      reportsOverTime,
      categoryData,
      statusData,
      responseTimeData,
      userActivityData,
      performanceData
    };
  };

  const chartData = generateChartData();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'audit', label: 'Audit Logs', icon: Shield },
    { id: 'ai-insights', label: 'AI Insights', icon: Brain }
  ];

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Access Denied
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            You need admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Admin Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Monitor and manage your CityWatch platform
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
              <button
                onClick={refreshData}
                className="flex items-center px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
          >
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-slate-200 dark:border-slate-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* KPI Cards */}
              <KPICards data={stats} />

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Active Reports
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {stats?.activeReports || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                      <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Total Users
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {stats?.totalUsers || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                      <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Resolution Rate
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {stats?.resolutionRate || 0}%
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                      <CheckCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Avg Response Time
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {stats?.avgResponseTime || 0}h
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                      <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {auditLogs.slice(0, 5).map((log, index) => (
                    <div key={log.id} className="flex items-center space-x-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                        <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {log.action}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ReportsOverTimeChart data={chartData.reportsOverTime} />
                <CategoryDistributionChart data={chartData.categoryData} />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <StatusDistributionChart data={chartData.statusData} />
                <ResponseTimeChart data={chartData.responseTimeData} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <UserActivityChart data={chartData.userActivityData} />
                <PerformanceMetricsChart data={chartData.performanceData} />
              </div>
            </motion.div>
          )}

          {activeTab === 'ai-insights' && (
            <motion.div
              key="ai-insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* AI Insights Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center space-x-3 mb-4">
                  <Brain className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">AI-Powered Insights</h2>
                </div>
                <p className="text-purple-100">
                  Intelligent analysis and predictions to help you make data-driven decisions
                </p>
              </div>

              {/* AI Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Lightbulb className="w-6 h-6 text-yellow-500" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Smart Recommendations
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {aiInsights?.recommendations?.map((rec, index) => (
                      <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className={`p-1 rounded-full ${
                            rec.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20' :
                            rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                            'bg-green-100 dark:bg-green-900/20'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              rec.priority === 'high' ? 'bg-red-500' :
                              rec.priority === 'medium' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {rec.message}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {rec.action}
                            </p>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                        No recommendations available
                      </p>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Zap className="w-6 h-6 text-blue-500" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Predictions
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {aiInsights?.predictions?.map((pred, index) => (
                      <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {pred.type.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {Math.round(pred.confidence * 100)}% confidence
                          </span>
                        </div>
                        <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {pred.prediction}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {pred.timeframe}
                        </p>
                      </div>
                    )) || (
                      <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                        No predictions available
                      </p>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* AI Alerts */}
              {aiInsights?.alerts?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      AI Alerts
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {aiInsights.alerts.map((alert, index) => (
                      <div key={index} className={`p-4 rounded-lg border-l-4 ${
                        alert.severity === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                        alert.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
                        'bg-green-50 dark:bg-green-900/20 border-green-500'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {alert.message}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {alert.action}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            alert.severity === 'high' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200' :
                            alert.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200' :
                            'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Other tabs content would go here... */}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;