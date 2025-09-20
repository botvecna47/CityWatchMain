import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ArrowLeft, AlertTriangle, Calendar, MapPin, User, Pin } from 'lucide-react';

const AlertDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, makeAuthenticatedRequest } = useAuth();
  const { error: showError } = useToast();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlert();
  }, [id]);

  const fetchAlert = async () => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest(`http://localhost:5000/api/alerts/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setAlert(data.alert);
      } else {
        showError('Alert not found');
        navigate('/alerts');
      }
    } catch (error) {
      console.error('Error fetching alert:', error);
      showError('Failed to load alert details');
      navigate('/alerts');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading alert details...</p>
        </div>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Alert Not Found</h2>
          <p className="text-gray-600 mb-4">The alert you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/alerts')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Alerts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/alerts')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Alerts
          </button>
          
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            {alert.isPinned && <Pin className="w-5 h-5 text-blue-500" />}
            <h1 className="text-3xl font-bold text-gray-900">{alert.title}</h1>
          </div>
          
          {alert.isPinned && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
              <Pin className="w-4 h-4 mr-1" />
              Pinned Alert
            </div>
          )}
        </div>

        {/* Alert Content */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="prose max-w-none">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
              {alert.message}
            </p>
          </div>
        </div>

        {/* Alert Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Alert Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-900">Posted Date</p>
                <p className="text-sm text-gray-600">{formatDate(alert.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-900">Location</p>
                <p className="text-sm text-gray-600">{alert.city?.name || 'Not specified'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-900">Posted By</p>
                <p className="text-sm text-gray-600">
                  {alert.creator?.firstName} {alert.creator?.lastName}
                  <span className="ml-2 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {alert.creator?.role}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-900">Status</p>
                <p className="text-sm text-gray-600">
                  {alert.deleted ? 'Removed' : 'Active'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => navigate('/alerts')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Back to Alerts
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDetail;
