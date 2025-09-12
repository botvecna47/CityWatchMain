import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
};

const LocationPicker = ({ onLocationSelect, initialLocation = null, height = '300px' }) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // Default to NYC

  // Set initial location if provided
  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
      setMapCenter([initialLocation.lat, initialLocation.lng]);
    }
  }, [initialLocation]);

  const handleLocationSelect = (lat, lng) => {
    const location = { lat, lng };
    setSelectedLocation(location);
    onLocationSelect(lat, lng);
  };

  return (
    <div className="w-full">
      <div className="mb-3">
        <p className="text-sm text-gray-600">
          Click anywhere on the map to select a location
        </p>
      </div>
      
      <div 
        style={{ height, width: '100%' }} 
        className="rounded-lg overflow-hidden border border-gray-200"
      >
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          
          {selectedLocation && (
            <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
          )}
        </MapContainer>
      </div>
      
      {selectedLocation && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Selected Location:</strong> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
