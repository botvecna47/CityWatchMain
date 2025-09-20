import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { API_ENDPOINTS } from '../config/api';
import Button from './ui/Button';
import { MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const CityChangeRequest = () => {
  const { user, makeAuthenticatedRequest } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [cities, setCities] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    requestedCityId: '',
    reason: ''
  });

  // Fetch cities and user's requests
  useEffect(() => {
    fetchCities();
    fetchUserRequests();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await makeAuthenticatedRequest(API_ENDPOINTS.CITIES);
      if (response.ok) {
        const data = await response.json();
        setCities(data.cities || []);
      }
    } catch (error) {
      console.error('Failed to fetch cities:', error);
    }
  };

  const fetchUserRequests = async () => {
    try {
      const response = await makeAuthenticatedRequest(API_ENDPOINTS.CITY_CHANGE_MY_REQUESTS);
      if (response.ok) {
        const data = await response.json();
        setRequests(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.requestedCityId) {
      showError('Please select a city');
      return;
    }

    setLoading(true);
    try {
      const response = await makeAuthenticatedRequest(API_ENDPOINTS.CITY_CHANGE_REQUEST, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showSuccess('City change request submitted successfully');
        setFormData({ requestedCityId: '', reason: '' });
        setShowRequestForm(false);
        fetchUserRequests();
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to submit request');
      }
    } catch (error) {
      showError('Failed to submit request');
    } finally {
      setLoading(false);
    }
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
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <MapPin className="w-6 h-6 text-blue-600 mr-3" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">City Change Requests</h2>
            <p className="text-sm text-gray-600">Request to change your assigned city</p>
          </div>
        </div>
        <Button
          onClick={() => setShowRequestForm(!showRequestForm)}
          variant="outline"
          size="sm"
        >
          {showRequestForm ? 'Cancel' : 'New Request'}
        </Button>
      </div>

      {/* Current City */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-1">Current City</h3>
        <p className="text-lg font-semibold text-blue-800">
          {user?.city?.name || 'Not assigned'}
        </p>
      </div>

      {/* Request Form */}
      {showRequestForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Request City Change</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="requestedCityId" className="block text-sm font-medium text-gray-700 mb-2">
                Requested City *
              </label>
              <select
                id="requestedCityId"
                value={formData.requestedCityId}
                onChange={(e) => setFormData({...formData, requestedCityId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a city</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason (Optional)
              </label>
              <textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Explain why you need to change your city..."
              />
            </div>

            <div className="flex space-x-3">
              <Button
                type="submit"
                loading={loading}
                disabled={!formData.requestedCityId}
              >
                Submit Request
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRequestForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Request History */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Request History</h3>
        
        {requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No city change requests yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {getStatusIcon(request.status)}
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="text-sm text-gray-700">
                  <p>
                    <span className="font-medium">From:</span> {request.currentCity?.name || 'None'}
                  </p>
                  <p>
                    <span className="font-medium">To:</span> {request.requestedCity?.name}
                  </p>
                  {request.reason && (
                    <p>
                      <span className="font-medium">Reason:</span> {request.reason}
                    </p>
                  )}
                  {request.adminNotes && (
                    <p>
                      <span className="font-medium">Admin Notes:</span> {request.adminNotes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CityChangeRequest;


