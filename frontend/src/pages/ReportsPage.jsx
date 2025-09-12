import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS } from '../config/api';

const ReportsPage = () => {
  const { user, makeAuthenticatedRequest } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await makeAuthenticatedRequest(`${API_ENDPOINTS.REPORTS}?limit=50`);
      
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      } else {
        setError('Failed to fetch reports');
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to fetch reports');
    } finally {
      setLoading(false);
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

  const getStatusLabel = (status) => {
    switch (status) {
      case 'OPEN':
        return 'Unsolved';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'RESOLVED':
        return 'Resolved';
      case 'CLOSED':
        return 'Closed';
      default:
        return status;
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

  const getFilteredReports = () => {
    if (activeFilter === 'all') {
      return reports;
    }
    
    const statusMap = {
      'unsolved': 'OPEN',
      'in-progress': 'IN_PROGRESS',
      'resolved': 'RESOLVED'
    };
    
    return reports.filter(report => report.status === statusMap[activeFilter]);
  };

  const getReportsByStatus = (status) => {
    return getFilteredReports().filter(report => report.status === status);
  };

  const renderReportCard = (report) => (
    <Link
      key={report.id}
      to={`/reports/${report.id}`}
      className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
          {report.title}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
          {getStatusLabel(report.status)}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {report.description}
      </p>
      
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>By {report.author?.username || 'Unknown'}</span>
        <span>{formatDate(report.createdAt)}</span>
      </div>
      
      {report._count && (
        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
          <span>{report._count.comments} comments</span>
          {report._count.attachments > 0 && (
            <span>{report._count.attachments} attachments</span>
          )}
        </div>
      )}
    </Link>
  );

  const renderStatusSection = (status, title) => {
    const statusReports = getReportsByStatus(status);
    
    if (activeFilter !== 'all' && statusReports.length === 0) {
      return null;
    }

    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          {title}
          <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
            {statusReports.length}
          </span>
        </h2>
        
        {statusReports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No {title.toLowerCase()} reports found.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {statusReports.map(renderReportCard)}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchReports}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
            <p className="text-gray-600">
              View and manage reports for {user?.city?.name || 'your city'}
            </p>
          </div>
          
          <Link
            to="/reports/create"
            className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Report</span>
          </Link>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { key: 'all', label: 'All Reports' },
            { key: 'unsolved', label: 'Unsolved' },
            { key: 'in-progress', label: 'In Progress' },
            { key: 'resolved', label: 'Resolved' }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeFilter === filter.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Reports Sections */}
        {activeFilter === 'all' ? (
          <div>
            {renderStatusSection('OPEN', 'Unsolved Reports')}
            {renderStatusSection('IN_PROGRESS', 'In Progress')}
            {renderStatusSection('RESOLVED', 'Resolved Reports')}
            {renderStatusSection('CLOSED', 'Closed Reports')}
          </div>
        ) : (
          <div>
            {getFilteredReports().length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No reports found for the selected filter.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getFilteredReports().map(renderReportCard)}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {reports.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
              <p className="text-gray-500 mb-4">
                Be the first to report an issue in your city.
              </p>
              <Link
                to="/reports/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create First Report
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
