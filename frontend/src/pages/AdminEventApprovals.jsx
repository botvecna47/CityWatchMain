import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { API_ENDPOINTS } from '../config/api';
import Button from '../components/ui/Button';
import { CheckCircle, XCircle, Clock, User, MapPin, Calendar, MessageSquare, Eye } from 'lucide-react';

const AdminEventApprovals = () => {
  const { makeAuthenticatedRequest } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchPendingEvents();
  }, [pagination.page]);

  const fetchPendingEvents = async () => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest(
        `${API_ENDPOINTS.EVENTS}/admin/pending?page=${pagination.page}&limit=${pagination.limit}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setEvents(data.data.events || []);
        setPagination(prev => ({
          ...prev,
          ...data.data.pagination
        }));
      } else {
        throw new Error('Failed to fetch pending events');
      }
    } catch (error) {
      console.error('Error fetching pending events:', error);
      showError('Failed to fetch pending events');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId) => {
    try {
      setActionLoading(eventId);
      const response = await makeAuthenticatedRequest(
        `${API_ENDPOINTS.EVENTS}/${eventId}/approve`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.ok) {
        showSuccess('Event approved successfully');
        fetchPendingEvents();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to approve event');
      }
    } catch (error) {
      showError('Failed to approve event');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (eventId, reason) => {
    try {
      setActionLoading(eventId);
      const response = await makeAuthenticatedRequest(
        `${API_ENDPOINTS.EVENTS}/${eventId}/reject`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ rejectionReason: reason })
        }
      );

      if (response.ok) {
        showSuccess('Event rejected successfully');
        setShowModal(false);
        setSelectedEvent(null);
        setRejectionReason('');
        fetchPendingEvents();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to reject event');
      }
    } catch (error) {
      showError('Failed to reject event');
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (event) => {
    setSelectedEvent(event);
    setRejectionReason('');
    setShowModal(true);
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

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Event Approvals</h1>
          <p className="text-gray-600 mt-2">Review and approve pending events from users and authorities</p>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending events</h3>
            <p className="text-gray-500">All events have been reviewed and processed.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Clock className="w-5 h-5 text-yellow-500" />
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending Approval
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(event.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 mb-4">{event.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(event.dateTime)}
                          </p>
                        </div>
                      </div>

                      {event.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-900">{event.location}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {event.creator.firstName} {event.creator.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            @{event.creator.username} • 
                            <span className={`ml-1 px-1 py-0.5 rounded text-xs font-medium ${getRoleColor(event.creator.role)}`}>
                              {event.creator.role}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-900">{event.city.name}</p>
                        </div>
                      </div>
                    </div>

                    {event.imageUrl && (
                      <div className="mb-4">
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full max-w-md h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button
                      onClick={() => handleApprove(event.id)}
                      loading={actionLoading === event.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => openRejectModal(event)}
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-2">
              <Button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Rejection Modal */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Reject Event
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Event:</strong> {selectedEvent.title}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Creator:</strong> {selectedEvent.creator.firstName} {selectedEvent.creator.lastName} (@{selectedEvent.creator.username})
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>City:</strong> {selectedEvent.city.name}
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Please provide a reason for rejecting this event..."
                  required
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => handleReject(selectedEvent.id, rejectionReason)}
                  loading={actionLoading === selectedEvent.id}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Reject Event
                </Button>
                <Button
                  onClick={() => setShowModal(false)}
                  variant="outline"
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

export default AdminEventApprovals;
