import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authorityUpdate, setAuthorityUpdate] = useState({
    text: '',
    newStatus: ''
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:5000/api/reports/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setReport(data.report);
        } else {
          setError('Report not found');
        }
      } catch (err) {
        setError('Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleAuthorityUpdate = async (e) => {
    e.preventDefault();
    if (!authorityUpdate.text.trim()) return;

    setUpdating(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/reports/${id}/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(authorityUpdate),
      });

      if (response.ok) {
        const data = await response.json();
        setReport(data.report);
        setAuthorityUpdate({ text: '', newStatus: '' });
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (err) {
      setError('Failed to add authority update');
    } finally {
      setUpdating(false);
    }
  };


  const handleCloseReport = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/reports/${id}/close`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReport(data.report);
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (err) {
      setError('Failed to close report');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteReport = async () => {
    const reason = prompt('Please provide a reason for deleting this report (required for audit):');
    if (!reason || !reason.trim()) return;

    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/reports/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      if (response.ok) {
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (err) {
      setError('Failed to delete report');
    } finally {
      setUpdating(false);
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canAddAuthorityUpdate = user && (user.role === 'authority' || user.role === 'admin');
  const canDelete = user && user.role === 'admin';
  const canClose = user && user.role === 'citizen' && report && report.authorId === user.id && report.status === 'RESOLVED';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Report Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{report.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                {report.status.replace('_', ' ')}
              </span>
              <span>Category: {report.category}</span>
              <span>By: {report.author.username}</span>
              <span>Created: {formatDate(report.createdAt)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{report.description}</p>
                </div>
              </div>

              {/* Authority Updates */}
              {report.authorityUpdates && report.authorityUpdates.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Authority Updates</h2>
                  <div className="space-y-4">
                    {report.authorityUpdates.map((update) => (
                      <div key={update.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {update.authority.username} ({update.authority.role})
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(update.createdAt)}
                            </p>
                          </div>
                          {update.newStatus && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(update.newStatus)}`}>
                              Status: {update.newStatus.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700">{update.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Authority Update Form */}
              {canAddAuthorityUpdate && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Authority Update</h2>
                  <form onSubmit={handleAuthorityUpdate} className="space-y-4">
                    <div>
                      <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                        Update Text *
                      </label>
                      <textarea
                        id="text"
                        value={authorityUpdate.text}
                        onChange={(e) => setAuthorityUpdate({...authorityUpdate, text: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Provide an update on this report..."
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="newStatus" className="block text-sm font-medium text-gray-700 mb-2">
                        Change Status (Optional)
                      </label>
                      <select
                        id="newStatus"
                        value={authorityUpdate.newStatus}
                        onChange={(e) => setAuthorityUpdate({...authorityUpdate, newStatus: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">No status change</option>
                        {report.status === 'OPEN' && (
                          <option value="IN_PROGRESS">Mark as In Progress</option>
                        )}
                        {report.status === 'IN_PROGRESS' && (
                          <option value="RESOLVED">Mark as Resolved</option>
                        )}
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={!authorityUpdate.text.trim() || updating}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating ? 'Adding Update...' : 'Add Update'}
                    </button>
                  </form>
                </div>
              )}

              {/* Close Report (Citizens only) */}
              {canClose && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Close Report</h2>
                  <p className="text-gray-600 mb-4">
                    This report has been resolved. You can now close it if the issue has been fully addressed.
                  </p>
                  <button
                    onClick={handleCloseReport}
                    disabled={updating}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Closing...' : 'Close Report'}
                  </button>
                </div>
              )}

            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">ID:</span>
                    <p className="text-sm text-gray-900 font-mono">{report.id}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <p className="text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status.replace('_', ' ')}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Category:</span>
                    <p className="text-sm text-gray-900">{report.category}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Author:</span>
                    <p className="text-sm text-gray-900">{report.author.username}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Created:</span>
                    <p className="text-sm text-gray-900">{formatDate(report.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Last Updated:</span>
                    <p className="text-sm text-gray-900">{formatDate(report.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
              {canDelete && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h3>
                  <button
                    onClick={handleDeleteReport}
                    disabled={updating}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Deleting...' : 'Delete Report'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
