import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { API_ENDPOINTS } from '../config/api';
import Button from '../components/ui/Button';
import { CheckCircle, XCircle, Clock, User, MapPin, MessageSquare } from 'lucide-react';

const AdminCityChangeRequests = () => {
  const { makeAuthenticatedRequest } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' 
        ? API_ENDPOINTS.CITY_CHANGE_ALL 
        : `${API_ENDPOINTS.CITY_CHANGE_ALL}?status=${filter}`;
      
      const response = await makeAuthenticatedRequest(url);
      if (response.ok) {
        const data = await response.json();
        setRequests(data.data.requests || []);
      } else {
        throw new Error('Failed to fetch requests');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      showError('Failed to fetch city change requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId, action) => {
    try {
      setActionLoading(true);
      const response = await makeAuthenticatedRequest(API_ENDPOINTS.CITY_CHANGE_UPDATE(requestId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: action,
          adminNotes: adminNotes
        })
      });

      if (response.ok) {
        showSuccess(`Request ${action} successfully`);
        setShowModal(false);
        setSelectedRequest(null);
        setAdminNotes('');
        fetchRequests();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to update request');
      }
    } catch (error) {
      showError('Failed to update request');
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (request) => {
    setSelectedRequest(request);
    setAdminNotes('');
    setShowModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
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

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">City Change Requests</h1>
          <p className="text-gray-600 mt-2">Manage user requests to change their assigned city</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Requests' },
                { key: 'pending', label: 'Pending' },
                { key: 'approved', label: 'Approved' },
                { key: 'rejected', label: 'Rejected' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'No city change requests have been submitted yet.'
                : `No ${filter} requests found.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {getStatusIcon(request.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(request.createdAt)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {request.user.firstName} {request.user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            @{request.user.username} • {request.user.role}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">From:</span> {request.currentCity?.name || 'None'}
                          </p>
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">To:</span> {request.requestedCity.name}
                          </p>
                        </div>
                      </div>
                    </div>

                    {request.reason && (
                      <div className="mb-4">
                        <div className="flex items-start space-x-2">
                          <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">Reason:</p>
                            <p className="text-sm text-gray-600">{request.reason}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {request.adminNotes && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-900 mb-1">Admin Notes:</p>
                        <p className="text-sm text-gray-600">{request.adminNotes}</p>
                      </div>
                    )}

                    {request.admin && (
                      <div className="text-sm text-gray-500">
                        Processed by {request.admin.firstName} {request.admin.lastName} on {formatDate(request.updatedAt)}
                      </div>
                    )}
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex space-x-2 ml-4">
                      <Button
                        onClick={() => openModal(request)}
                        variant="outline"
                        size="sm"
                      >
                        Review
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Action Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Review City Change Request
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>User:</strong> {selectedRequest.user.firstName} {selectedRequest.user.lastName} (@{selectedRequest.user.username})
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>From:</strong> {selectedRequest.currentCity?.name || 'None'}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>To:</strong> {selectedRequest.requestedCity.name}
                </p>
                {selectedRequest.reason && (
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Reason:</strong> {selectedRequest.reason}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add notes about your decision..."
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => handleAction(selectedRequest.id, 'approved')}
                  loading={actionLoading}
                  className="flex-1"
                >
                  Approve
                </Button>
                <Button
                  onClick={() => handleAction(selectedRequest.id, 'rejected')}
                  variant="outline"
                  loading={actionLoading}
                  className="flex-1"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => setShowModal(false)}
                  variant="secondary"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminCityChangeRequests;


