import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LocationPicker from '../components/LocationPicker';
import Button from '../components/ui/Button';
import { MapPin, Map, X, Upload } from 'lucide-react';

const CreateReport = () => {
  const navigate = useNavigate();
  const { user, makeAuthenticatedRequest } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    latitude: '',
    longitude: ''
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMethod, setLocationMethod] = useState('current'); // 'current' or 'manual'
  const [showMap, setShowMap] = useState(false);

  const categories = [
    'GARBAGE',
    'ROAD',
    'WATER',
    'POWER',
    'OTHER'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validate file types and sizes
    const validFiles = selectedFiles.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        setError(`File ${file.name} is not a supported type. Please upload images, PDFs, or text files.`);
        return false;
      }
      
      if (file.size > maxSize) {
        setError(`File ${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      setError(''); // Clear any previous errors
      setFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLocationLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData({
          ...formData,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        });
        setLocationLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationLoading(false);
        
        let message = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out.';
            break;
        }
        setError(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleLocationSelect = (lat, lng) => {
    setFormData({
      ...formData,
      latitude: lat.toString(),
      longitude: lng.toString()
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (formData.title.trim().length < 5) {
      setError('Title must be at least 5 characters long');
      setLoading(false);
      return;
    }

    // Location validation
    if (!formData.latitude || !formData.longitude) {
      setError('Location is required. Please select a location for your report.');
      setLoading(false);
      return;
    }

    if (formData.description.trim().length < 10) {
      setError('Description must be at least 10 characters long');
      setLoading(false);
      return;
    }

    try {
      // First, create the report
      const reportResponse = await makeAuthenticatedRequest('http://localhost:5000/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      const reportData = await reportResponse.json();

      if (!reportResponse.ok) {
        throw new Error(reportData.error || 'Failed to create report');
      }

      // If files are selected, upload them
      if (files.length > 0) {
        const formDataFiles = new FormData();
        files.forEach(file => {
          formDataFiles.append('files', file);
        });

        const uploadResponse = await makeAuthenticatedRequest(`http://localhost:5000/api/attachments/${reportData.report.id}/upload`, {
          method: 'POST',
          body: formDataFiles,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          console.warn('File upload failed:', uploadError.error);
          // Don't fail the entire operation if file upload fails
        }
      }

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not a citizen
  if (user && user.role !== 'citizen') {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create New Report
            </h1>
            <p className="text-gray-600">
              Report an issue in your city to help improve community safety and services.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Report Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of the issue"
                  value={formData.title}
                  onChange={handleChange}
                />
                <p className="mt-1 text-sm text-gray-500">Minimum 5 characters</p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Provide detailed information about the issue, including location, severity, and any other relevant details..."
                  value={formData.description}
                  onChange={handleChange}
                />
                <p className="mt-1 text-sm text-gray-500">Minimum 10 characters</p>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Location *</h3>
                
                {/* Location Method Selection */}
                <div className="mb-4">
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="locationMethod"
                        value="current"
                        checked={locationMethod === 'current'}
                        onChange={(e) => setLocationMethod(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Use my current location</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="locationMethod"
                        value="manual"
                        checked={locationMethod === 'manual'}
                        onChange={(e) => setLocationMethod(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Pick location manually</span>
                    </label>
                  </div>
                </div>

                {/* Current Location Option */}
                {locationMethod === 'current' && (
                  <div className="mb-4">
                    <Button
                      type="button"
                      onClick={getCurrentLocation}
                      loading={locationLoading}
                      leftIcon={<MapPin className="w-4 h-4" />}
                      size="sm"
                      variant="secondary"
                    >
                      {locationLoading ? 'Getting Location...' : 'Get Current Location'}
                    </Button>
                    <p className="mt-1 text-sm text-gray-500">
                      Use your device's GPS to automatically set the location
                    </p>
                  </div>
                )}

                {/* Manual Location Option */}
                {locationMethod === 'manual' && (
                  <div className="mb-4">
                    <Button
                      type="button"
                      onClick={() => setShowMap(!showMap)}
                      leftIcon={<Map className="w-4 h-4" />}
                      size="sm"
                      variant="secondary"
                    >
                      {showMap ? 'Hide Map' : 'Show Map'}
                    </Button>
                    <p className="mt-1 text-sm text-gray-500">
                      Click on the map to select a location
                    </p>
                    
                    {/* Map Picker */}
                    {showMap && (
                      <div className="mt-4">
                        <LocationPicker
                          onLocationSelect={handleLocationSelect}
                          initialLocation={
                            formData.latitude && formData.longitude
                              ? { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) }
                              : null
                          }
                          height="300px"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Location Display */}
                {(formData.latitude && formData.longitude) && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-green-800">Location Selected</p>
                        <p className="text-xs text-green-600">
                          {formData.latitude}, {formData.longitude}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Manual Coordinate Input */}
                {locationMethod === 'manual' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                        Latitude
                      </label>
                      <input
                        type="number"
                        id="latitude"
                        name="latitude"
                        step="any"
                        placeholder="e.g., 40.7128"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.latitude}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                        Longitude
                      </label>
                      <input
                        type="number"
                        id="longitude"
                        name="longitude"
                        step="any"
                        placeholder="e.g., -74.0060"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.longitude}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="files" className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments (Optional)
                </label>
                <input
                  type="file"
                  id="files"
                  multiple
                  accept="image/*,.pdf,.txt"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Upload images, PDFs, or text files (max 5 files, 5MB each)
                </p>
                
                {files.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({Math.round(file.size / 1024)} KB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            onClick={() => removeFile(index)}
                            variant="ghost"
                            size="sm"
                            leftIcon={<X className="w-3 h-3" />}
                            className="text-error-600 hover:text-error-800"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>


              <div className="flex space-x-4">
                <Button
                  type="submit"
                  loading={loading}
                  fullWidth
                  className="flex-1"
                >
                  {loading ? 'Creating Report...' : 'Create Report'}
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  variant="secondary"
                  fullWidth
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateReport;


