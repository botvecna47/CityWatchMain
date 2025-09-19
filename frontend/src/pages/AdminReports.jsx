import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import {
  FileText,
  Search,
  Filter,
  Trash2,
  Eye,
  RefreshCw,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

const AdminReports = () => {
  const { user, makeAuthenticatedRequest } = useAuth();
  const { success: showSuccess, error: showError } = useToast();

  // State for reports data
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    city: '',
    deleted: ''
  });

  // Cities for filtering
  const [cities, setCities] = useState([]);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');

  // Fetch reports
  const fetchReports = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      });

      const response = await makeAuthenticatedRequest(
        `${API_ENDPOINTS.ADMIN_REPORTS}?${params}`
      );

      if (response.ok) {
        const data = await response.json();
        setReports(data.reports);
        setPagination(data.pagination);
      } else {
        throw new Error('Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      showError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  // Fetch cities
  const fetchCities = async () => {
    try {
      const response = await makeAuthenticatedRequest(API_ENDPOINTS.CITIES);
      if (response.ok) {
        const data = await response.json();
        setCities(data.cities || []);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  // Delete report
  const deleteReport = async () => {
    if (!selectedReport || !deleteReason.trim()) {
      showError('Please provide a reason for deletion');
      return;
    }

    try {
      const response = await makeAuthenticatedRequest(
        API_ENDPOINTS.ADMIN_REPORT_DELETE(selectedReport.id),
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: deleteReason })
        }
      );

      if (response.ok) {
        showSuccess('Report deleted successfully');
        fetchReports(pagination.page);
        setShowDeleteModal(false);
        setSelectedReport(null);
        setDeleteReason('');
      } else {
        throw new Error('Failed to delete report');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      showError('Failed to delete report');
    }
  };

  // Restore report
  const restoreReport = async (reportId) => {
    try {
      const response = await makeAuthenticatedRequest(
        API_ENDPOINTS.ADMIN_REPORT_RESTORE(reportId),
        { method: 'PATCH' }
      );

      if (response.ok) {
        showSuccess('Report restored successfully');
        fetchReports(pagination.page);
      } else {
        throw new Error('Failed to restore report');
      }
    } catch (error) {
      console.error('Error restoring report:', error);
      showError('Failed to restore report');
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchReports(1);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      status: '',
      category: '',
      city: '',
      deleted: ''
    });
    setTimeout(() => fetchReports(1), 0);
  };

  useEffect(() => {
    fetchReports();
    fetchCities();
  }, []);

  const getStatusBadgeColor = (status) => {
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

  const getCategoryBadgeColor = (category) => {
    switch (category) {
      case 'GARBAGE':
        return 'bg-orange-100 text-orange-800';
      case 'ROAD':
        return 'bg-blue-100 text-blue-800';
      case 'WATER':
        return 'bg-cyan-100 text-cyan-800';
      case 'POWER':
        return 'bg-purple-100 text-purple-800';
      case 'OTHER':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && reports.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                to="/dashboard"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back to Dashboard
              </Link>
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-xl mr-3">
                  <FileText className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Report Management</h1>
                  <p className="text-sm text-gray-500">
                    Manage and moderate community reports
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="GARBAGE">Garbage</option>
                <option value="ROAD">Road</option>
                <option value="WATER">Water</option>
                <option value="POWER">Power</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Status
              </label>
              <select
                value={filters.deleted}
                onChange={(e) => handleFilterChange('deleted', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Reports</option>
                <option value="false">Active</option>
                <option value="true">Deleted</option>
              </select>
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Apply
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Reports ({pagination.total})
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className={`hover:bg-gray-50 ${report.deleted ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <FileText className="h-5 w-5 text-primary-600 mt-1" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {report.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-2 max-w-xs">
                            {report.description}
                          </div>
                          {report.deleted && (
                            <div className="flex items-center mt-1">
                              <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                              <span className="text-xs text-red-600 font-medium">DELETED</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {report.author.username}
                      </div>
                      <div className="text-sm text-gray-500">
                        {report.author.role}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryBadgeColor(report.category)}`}>
                        {report.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.city?.name || 'No City'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link to={`/reports/${report.id}`}>
                          <button className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
                        </Link>
                        {report.deleted ? (
                          <button
                            onClick={() => restoreReport(report.id)}
                            className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200"
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Restore
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedReport(report);
                              setShowDeleteModal(true);
                            }}
                            className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{pagination.total}</span>{' '}
                  results
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fetchReports(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 text-gray-400 hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(pagination.pages, 10) }, (_, i) => {
                    const startPage = Math.max(1, pagination.page - 5);
                    const pageNum = startPage + i;
                    return pageNum <= pagination.pages ? (
                      <button
                        key={pageNum}
                        onClick={() => fetchReports(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          pageNum === pagination.page
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ) : null;
                  })}
                </div>
                <button
                  onClick={() => fetchReports(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="p-2 text-gray-400 hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Delete Report
                </h3>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-4">
                You are about to delete the report "{selectedReport?.title}". This action will soft-delete the report and create an audit log entry.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for deletion *
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Please provide a reason for deleting this report..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows="3"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedReport(null);
                  setDeleteReason('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={deleteReport}
                disabled={!deleteReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;