import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { API_ENDPOINTS } from '../config/api';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

const AuthorityTypes = () => {
  const { makeAuthenticatedRequest } = useAuth();
  const { success: showSuccess, error: showError } = useToast();

  const [authorityTypes, setAuthorityTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    icon: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchAuthorityTypes();
  }, []);

  const fetchAuthorityTypes = async () => {
    try {
      const response = await makeAuthenticatedRequest(API_ENDPOINTS.AUTHORITY_TYPES);
      if (response.ok) {
        const data = await response.json();
        setAuthorityTypes(data.data || []);
      } else {
        showError('Failed to fetch authority types');
      }
    } catch (error) {
      console.error('Error fetching authority types:', error);
      showError('Failed to fetch authority types');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.displayName.trim()) newErrors.displayName = 'Display name is required';
    
    // Name should be lowercase and alphanumeric with underscores
    if (formData.name && !/^[a-z0-9_]+$/.test(formData.name)) {
      newErrors.name = 'Name must be lowercase, alphanumeric with underscores only';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Please fix the errors below');
      return;
    }

    try {
      const response = await makeAuthenticatedRequest(API_ENDPOINTS.AUTHORITY_TYPES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess('Authority type created successfully!');
        setAuthorityTypes(prev => [...prev, data.data]);
        setShowCreateForm(false);
        setFormData({ name: '', displayName: '', icon: '', description: '' });
        setErrors({});
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to create authority type');
      }
    } catch (error) {
      console.error('Error creating authority type:', error);
      showError('Failed to create authority type');
    }
  };

  const handleEdit = (authorityType) => {
    setEditingId(authorityType.id);
    setFormData({
      name: authorityType.name,
      displayName: authorityType.displayName,
      icon: authorityType.icon || '',
      description: authorityType.description || ''
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Please fix the errors below');
      return;
    }

    try {
      const response = await makeAuthenticatedRequest(API_ENDPOINTS.AUTHORITY_TYPE_BY_ID(editingId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess('Authority type updated successfully!');
        setAuthorityTypes(prev => 
          prev.map(type => type.id === editingId ? data.data : type)
        );
        setEditingId(null);
        setFormData({ name: '', displayName: '', icon: '', description: '' });
        setErrors({});
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to update authority type');
      }
    } catch (error) {
      console.error('Error updating authority type:', error);
      showError('Failed to update authority type');
    }
  };

  const handleDelete = async (id, displayName) => {
    if (!window.confirm(`Are you sure you want to delete "${displayName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await makeAuthenticatedRequest(API_ENDPOINTS.AUTHORITY_TYPE_BY_ID(id), {
        method: 'DELETE'
      });

      if (response.ok) {
        showSuccess('Authority type deleted successfully!');
        setAuthorityTypes(prev => prev.filter(type => type.id !== id));
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to delete authority type');
      }
    } catch (error) {
      console.error('Error deleting authority type:', error);
      showError('Failed to delete authority type');
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      const response = await makeAuthenticatedRequest(API_ENDPOINTS.AUTHORITY_TYPE_BY_ID(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess(`Authority type ${!isActive ? 'activated' : 'deactivated'} successfully!`);
        setAuthorityTypes(prev => 
          prev.map(type => type.id === id ? data.data : type)
        );
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to update authority type');
      }
    } catch (error) {
      console.error('Error updating authority type:', error);
      showError('Failed to update authority type');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', displayName: '', icon: '', description: '' });
    setErrors({});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading authority types...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-xl mr-3">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Authority Types</h1>
                <p className="text-sm text-gray-500">
                  Manage authority types for the system
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Authority Type
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Create New Authority Type</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., police, fire, medical"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.displayName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Police Department"
                  />
                  {errors.displayName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.displayName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon (Emoji)
                  </label>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., 👮, 🚒, 🏥"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Brief description of this authority type"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Create Authority Type
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Authority Types List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Authority Types ({authorityTypes.length})
            </h2>
          </div>

          {authorityTypes.length === 0 ? (
            <div className="p-8 text-center">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Authority Types</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first authority type.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mx-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Authority Type
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {authorityTypes.map((authorityType) => (
                <div key={authorityType.id} className="p-6">
                  {editingId === authorityType.id ? (
                    // Edit Form
                    <form onSubmit={handleUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                              errors.name ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.name && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {errors.name}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Display Name *
                          </label>
                          <input
                            type="text"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                              errors.displayName ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.displayName && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {errors.displayName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Icon (Emoji)
                          </label>
                          <input
                            type="text"
                            name="icon"
                            value={formData.icon}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </button>
                      </div>
                    </form>
                  ) : (
                    // Display Mode
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                            <span className="text-2xl">{authorityType.icon || '🛡️'}</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {authorityType.displayName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Name: {authorityType.name}
                          </p>
                          {authorityType.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {authorityType.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleActive(authorityType.id, authorityType.isActive)}
                          className={`p-2 rounded-lg transition-colors ${
                            authorityType.isActive
                              ? 'text-green-600 bg-green-100 hover:bg-green-200'
                              : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                          }`}
                          title={authorityType.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {authorityType.isActive ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(authorityType)}
                          className="p-2 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(authorityType.id, authorityType.displayName)}
                          className="p-2 text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AuthorityTypes;


