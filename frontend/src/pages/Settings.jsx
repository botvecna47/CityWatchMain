import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const Settings = () => {
  const navigate = useNavigate();
  const { user, login, makeAuthenticatedRequest, fetchUserData } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    username: '',
    bio: '',
    cityId: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  // Initialize profile form with current user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || '',
        bio: user.bio || '',
        cityId: user.cityId || ''
      });
      if (user.profilePictureUrl) {
        setProfilePicturePreview(`http://localhost:5000${user.profilePictureUrl}`);
      }
    }
  }, [user]);

  // Fetch cities from API
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/cities');
        if (response.ok) {
          const data = await response.json();
          setCities(data.cities);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setCitiesLoading(false);
      }
    };

    fetchCities();
  }, []);

  // Handle profile picture selection
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile form input changes
  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      
      // Add form fields
      if (profileForm.username) formData.append('username', profileForm.username);
      if (profileForm.bio !== undefined) formData.append('bio', profileForm.bio);
      if (profileForm.cityId) formData.append('cityId', profileForm.cityId);
      
      // Add profile picture if selected
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      const response = await makeAuthenticatedRequest('http://localhost:5000/api/users/me', {
        method: 'PATCH',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      showSuccess('Profile updated successfully!');
      
      // Refresh user data from server to get updated profile picture
      await fetchUserData();
      
      // Clear profile picture state
      setProfilePicture(null);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const cityId = formData.get('cityId');

    if (!cityId) {
      showError('Please select a city');
      setLoading(false);
      return;
    }

    try {
      const response = await makeAuthenticatedRequest('http://localhost:5000/api/users/me/city', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cityId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update city');
      }

      showSuccess('City updated successfully!');
      
      // Update user context with new city info
      const updatedUser = { ...user, ...data.user };
      login(updatedUser, {
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken')
      });
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Settings
            </h1>
            <p className="text-gray-600">
              Manage your account settings and preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Profile Settings
              </h2>

              <form onSubmit={handleProfileUpdate}>
                {/* Profile Picture */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      {profilePicturePreview ? (
                        <img
                          src={profilePicturePreview}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : user.profilePictureUrl ? (
                        <img
                          src={`http://localhost:5000${user.profilePictureUrl}`}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Max 5MB, JPG/PNG/GIF</p>
                    </div>
                  </div>
                </div>

                {/* Username */}
                <div className="mb-6">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={profileForm.username}
                    onChange={handleProfileFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter username"
                  />
                </div>

                {/* Bio */}
                <div className="mb-6">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={profileForm.bio}
                    onChange={handleProfileFormChange}
                    rows={3}
                    maxLength={200}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tell us about yourself..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {profileForm.bio.length}/200 characters
                  </p>
                </div>

                {/* City */}
                <div className="mb-6">
                  <label htmlFor="cityId" className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  {citiesLoading ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                      Loading cities...
                    </div>
                  ) : (
                    <select
                      id="cityId"
                      name="cityId"
                      value={profileForm.cityId}
                      onChange={handleProfileFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a city</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>

            {/* Account Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Account Information
              </h2>
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Username:</span>
                  <p className="text-sm text-gray-900">{user.username}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Role:</span>
                  <p className="text-sm text-gray-900 capitalize">{user.role}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Current City:</span>
                  <p className="text-sm text-gray-900">{user.city?.name || 'Not set'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Member Since:</span>
                  <p className="text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {user.bio && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Bio:</span>
                    <p className="text-sm text-gray-900">{user.bio}</p>
                  </div>
                )}
              </div>
              
              {/* Privacy Notice */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Privacy Notice
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Your email address is kept private and is only used for account verification and important notifications.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
