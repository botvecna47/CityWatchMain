import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createCustomIcon = (color, iconType = 'marker') => {
  const iconHtml = iconType === 'user' 
    ? `<div style="
        width: 20px; 
        height: 20px; 
        background-color: ${color}; 
        border: 3px solid white; 
        border-radius: 50%; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`
    : `<div style="
        width: 25px; 
        height: 25px; 
        background-color: ${color}; 
        border: 2px solid white; 
        border-radius: 50% 50% 50% 0; 
        transform: rotate(-45deg);
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      "><div style="
        transform: rotate(45deg);
        color: white;
        font-size: 12px;
        font-weight: bold;
      ">!</div></div>`;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-icon',
    iconSize: [25, 25],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

// Map center updater component
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
};

const CityMap = ({ height = '400px', showNearbyToggle = true }) => {
  const { user, makeAuthenticatedRequest } = useAuth();
  const { showToast } = useToast();
  
  // State
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyReports, setNearbyReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNearby, setShowNearby] = useState(false);
  const [locationPermission, setLocationPermission] = useState('prompt'); // 'granted', 'denied', 'prompt'
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // Default to NYC
  const [mapZoom, setMapZoom] = useState(13);
  
  const watchIdRef = useRef(null);
  const mapRef = useRef(null);

  // Get user's current location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationPermission('denied');
      showToast('Geolocation is not supported by this browser', 'error');
      return;
    }

    setLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        
        setUserLocation(location);
        setMapCenter([latitude, longitude]);
        setMapZoom(15);
        setLocationPermission('granted');
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationPermission('denied');
        setLoading(false);
        
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
        showToast(message, 'error');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }, [showToast]);

  // Watch user's location
  const startLocationWatch = useCallback(() => {
    if (!navigator.geolocation || !userLocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        
        setUserLocation(newLocation);
      },
      (error) => {
        console.error('Error watching location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // 1 minute
      }
    );
  }, [userLocation]);

  // Stop watching location
  const stopLocationWatch = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Fetch nearby reports
  const fetchNearbyReports = useCallback(async (lat, lng, radius = 1) => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest(
        `http://localhost:5000/api/reports/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
      );

      if (response.ok) {
        const data = await response.json();
        setNearbyReports(data.reports || []);
      } else {
        const errorData = await response.json();
        showToast(errorData.error || 'Failed to fetch nearby reports', 'error');
      }
    } catch (error) {
      console.error('Error fetching nearby reports:', error);
      showToast('Failed to fetch nearby reports', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, makeAuthenticatedRequest, showToast]);

  // Toggle nearby reports
  const toggleNearby = useCallback(() => {
    const newShowNearby = !showNearby;
    setShowNearby(newShowNearby);
    
    if (!newShowNearby) {
      setNearbyReports([]);
    }
  }, [showNearby]);

  // Request location permission
  const requestLocation = useCallback(() => {
    getUserLocation();
  }, [getUserLocation]);

  // Fetch nearby reports when location changes and nearby is enabled
  useEffect(() => {
    if (showNearby && userLocation) {
      fetchNearbyReports(userLocation.lat, userLocation.lng);
    }
  }, [showNearby, userLocation, fetchNearbyReports]);

  // Auto-refresh nearby reports
  useEffect(() => {
    if (!showNearby || !userLocation) return;

    const interval = setInterval(() => {
      fetchNearbyReports(userLocation.lat, userLocation.lng);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [showNearby, userLocation, fetchNearbyReports]);

  // Start/stop location watching
  useEffect(() => {
    if (showNearby && userLocation) {
      startLocationWatch();
    } else {
      stopLocationWatch();
    }

    return () => stopLocationWatch();
  }, [showNearby, userLocation, startLocationWatch, stopLocationWatch]);

  // Get status color for reports
  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return '#ef4444'; // red
      case 'IN_PROGRESS':
        return '#f59e0b'; // yellow
      case 'RESOLVED':
        return '#10b981'; // green
      case 'CLOSED':
        return '#6b7280'; // gray
      default:
        return '#3b82f6'; // blue
    }
  };

  // Format distance
  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900">City Map</h3>
          {locationPermission === 'granted' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Location Active
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {locationPermission === 'prompt' && (
            <button
              onClick={requestLocation}
              disabled={loading}
              className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50"
            >
              {loading ? 'Getting Location...' : 'Enable Location'}
            </button>
          )}
          
          {showNearbyToggle && locationPermission === 'granted' && (
            <button
              onClick={toggleNearby}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                showNearby
                  ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
                  : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {showNearby ? 'Hide Nearby' : 'Show Nearby'}
            </button>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="relative">
        <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden border border-gray-200">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            <MapUpdater center={mapCenter} zoom={mapZoom} />
            
            {/* User location marker */}
            {userLocation && (
              <>
                <Marker
                  position={[userLocation.lat, userLocation.lng]}
                  icon={createCustomIcon('#3b82f6', 'user')}
                >
                  <Popup>
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">Your Location</div>
                      <div className="text-sm text-gray-600">
                        {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
                
                {/* Search radius circle */}
                {showNearby && (
                  <Circle
                    center={[userLocation.lat, userLocation.lng]}
                    radius={1000} // 1km in meters
                    pathOptions={{
                      color: '#3b82f6',
                      fillColor: '#3b82f6',
                      fillOpacity: 0.1,
                      weight: 2
                    }}
                  />
                )}
              </>
            )}
            
            {/* Nearby reports markers */}
            {nearbyReports.map((report) => (
              <Marker
                key={report.id}
                position={[report.latitude, report.longitude]}
                icon={createCustomIcon(getStatusColor(report.status))}
              >
                <Popup>
                  <div className="max-w-xs">
                    <div className="font-semibold text-gray-900 mb-1">{report.title}</div>
                    <div className="text-sm text-gray-600 mb-2 line-clamp-2">{report.description}</div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'OPEN' ? 'bg-red-100 text-red-800' :
                        report.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.status.replace('_', ' ')}
                      </span>
                      <span>{formatDistance(report.distance)}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      By {report.author.username} • {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Loading...</span>
            </div>
          </div>
        )}
      </div>

      {/* Status messages */}
      {locationPermission === 'denied' && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-yellow-800">
              Location access denied. Enable location permissions to see your position and nearby reports.
            </div>
          </div>
        </div>
      )}

      {showNearby && nearbyReports.length === 0 && !loading && (
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <div className="text-sm text-gray-600 text-center">
            No reports found within 1km of your location.
          </div>
        </div>
      )}

      {showNearby && nearbyReports.length > 0 && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="text-sm text-blue-800">
            Found {nearbyReports.length} report{nearbyReports.length !== 1 ? 's' : ''} within 1km of your location.
          </div>
        </div>
      )}
    </div>
  );
};

export default CityMap;
