import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, makeAuthenticatedRequest } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authorityUpdate, setAuthorityUpdate] = useState({
    text: '',
    newStatus: ''
  });
  const [updating, setUpdating] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'timeline'

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await makeAuthenticatedRequest(`http://localhost:5000/api/reports/${id}`);

        if (response.ok) {
          const data = await response.json();
          setReport(data.report);
          // Set timeline data if it's included (for admin users)
          if (data.report.timeline) {
            setTimeline(data.report.timeline);
          }
        } else {
          setError('Report not found');
        }
      } catch (err) {
        setError('Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    const fetchTimeline = async () => {
      // Timeline data is now included in the report data for admin users
      // No separate API call needed
    };

    fetchReport();
    fetchTimeline();
  }, [id, makeAuthenticatedRequest, user]);

  const handleAuthorityUpdate = async (e) => {
    e.preventDefault();
    if (!authorityUpdate.text.trim()) return;

    setUpdating(true);
    try {
      const response = await makeAuthenticatedRequest(`http://localhost:5000/api/reports/${id}/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
      const response = await makeAuthenticatedRequest(`http://localhost:5000/api/reports/${id}/close`, {
        method: 'PATCH'
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
      const response = await makeAuthenticatedRequest(`http://localhost:5000/api/reports/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
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

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setAddingComment(true);
    try {
      const response = await makeAuthenticatedRequest(`http://localhost:5000/api/comments/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (response.ok) {
        setNewComment('');
        // Refresh report data to show new comment
        const reportResponse = await makeAuthenticatedRequest(`http://localhost:5000/api/reports/${id}`);
        if (reportResponse.ok) {
          const data = await reportResponse.json();
          setReport(data.report);
          // Set timeline data if it's included (for admin users)
          if (data.report.timeline) {
            setTimeline(data.report.timeline);
          }
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (err) {
      setError('Failed to add comment');
    } finally {
      setAddingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await makeAuthenticatedRequest(`http://localhost:5000/api/comments/${commentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Refresh report data to remove deleted comment
        const reportResponse = await makeAuthenticatedRequest(`http://localhost:5000/api/reports/${id}`);
        if (reportResponse.ok) {
          const data = await reportResponse.json();
          setReport(data.report);
          // Set timeline data if it's included (for admin users)
          if (data.report.timeline) {
            setTimeline(data.report.timeline);
          }
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (err) {
      setError('Failed to delete comment');
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

  const renderTimelineEvent = (event) => {
    const getEventIcon = (type) => {
      switch (type) {
        case 'report_created':
          return '📝';
        case 'authority_update':
          return '👮';
        case 'comment':
          return '💬';
        case 'file_upload':
          return '📎';
        default:
          return '📋';
      }
    };

    const getEventColor = (type) => {
      switch (type) {
        case 'report_created':
          return 'border-blue-500 bg-blue-50';
        case 'authority_update':
          return 'border-green-500 bg-green-50';
        case 'comment':
          return 'border-gray-500 bg-gray-50';
        case 'file_upload':
          return 'border-purple-500 bg-purple-50';
        default:
          return 'border-gray-500 bg-gray-50';
      }
    };

    return (
      <div key={event.id} className={`border-l-4 pl-4 py-3 ${getEventColor(event.type)}`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <span className="text-lg">{getEventIcon(event.type)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">
                {event.type === 'report_created' && 'Report Created'}
                {event.type === 'authority_update' && `Authority Update by ${event.data.authority?.username || 'Unknown'}`}
                {event.type === 'comment' && `Comment by ${event.data.author?.username || 'Unknown'}`}
                {event.type === 'file_upload' && `File Uploaded: ${event.data.filename}`}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(event.timestamp)}
              </p>
            </div>
            <div className="mt-1">
              {event.type === 'report_created' && (
                <div>
                  <p className="text-sm text-gray-700">{event.data.description}</p>
                  <div className="mt-2 flex space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.data.status)}`}>
                      {event.data.status.replace('_', ' ')}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {event.data.category}
                    </span>
                  </div>
                </div>
              )}
              {event.type === 'authority_update' && (
                <div>
                  <p className="text-sm text-gray-700">{event.data.text}</p>
                  {event.data.newStatus && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">Status changed to: </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.data.newStatus)}`}>
                        {event.data.newStatus.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {event.type === 'comment' && (
                <p className="text-sm text-gray-700">{event.data.content}</p>
              )}
              {event.type === 'file_upload' && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">{event.data.filename}</span>
                  <span className="text-xs text-gray-500">
                    ({Math.round(event.data.size / 1024)} KB)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
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

          {/* Tabs - Only show timeline tab for admins */}
          {user && user.role === 'admin' && (
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'details'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Report Details
                  </button>
                  <button
                    onClick={() => setActiveTab('timeline')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'timeline'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Timeline ({timeline.length})
                  </button>
                </nav>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {(activeTab === 'details' || !user || user.role !== 'admin') && (
                <>
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
                </>
              )}

              {activeTab === 'timeline' && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Report Timeline</h2>
                  {timeline.length > 0 ? (
                    <div className="space-y-4">
                      {timeline.map(renderTimelineEvent)}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No timeline events yet.</p>
                  )}
                </div>
              )}

              {/* Attachments Section */}
              {report.attachments && report.attachments.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Attachments</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {report.attachments.map((attachment) => (
                      <div key={attachment.id} className="border border-gray-200 rounded-lg p-4">
                        {attachment.mimetype.startsWith('image/') ? (
                          <div>
                            <img
                              src={attachment.url}
                              alt={attachment.filename}
                              className="w-full h-32 object-cover rounded-md mb-2"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <div className="w-full h-32 bg-gray-100 rounded-md mb-2 flex items-center justify-center" style={{display: 'none'}}>
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <p className="text-sm font-medium text-gray-900 truncate">{attachment.filename}</p>
                            <p className="text-xs text-gray-500">{Math.round(attachment.size / 1024)} KB</p>
                          </div>
                        ) : (
                          <div>
                            <div className="w-full h-32 bg-gray-100 rounded-md mb-2 flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <a
                              href={attachment.url}
                              download={attachment.filename}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate block"
                            >
                              {attachment.filename}
                            </a>
                            <p className="text-xs text-gray-500">{Math.round(attachment.size / 1024)} KB</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Comments ({report.comments ? report.comments.length : 0})
                </h2>
                
                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="mb-6">
                  <div className="flex space-x-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={2}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add a comment..."
                      required
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || addingComment}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingComment ? 'Adding...' : 'Add Comment'}
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                {report.comments && report.comments.length > 0 ? (
                  <div className="space-y-4">
                    {report.comments.map((comment) => (
                      <div key={comment.id} className="border-l-4 border-gray-200 pl-4 py-2">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                              {comment.author.profilePicture ? (
                                <img
                                  src={`http://localhost:5000/assets/profiles/${comment.author.profilePicture}`}
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {comment.author.username}
                                <span className="ml-2 text-xs text-gray-500 capitalize">
                                  ({comment.author.role})
                                </span>
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(comment.createdAt)}
                              </p>
                            </div>
                          </div>
                          {user && user.role === 'admin' && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                        <p className="text-gray-700 text-sm">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                )}
              </div>

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
