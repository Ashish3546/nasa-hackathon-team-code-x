import React, { useState } from 'react';

const LocationInput = ({ onLocationChange }) => {
  const [locationInput, setLocationInput] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationName, setLocationName] = useState('');

  const predefinedLocations = [
    { name: 'New York, NY', lat: 40.7128, lon: -74.0060 },
    { name: 'London, UK', lat: 51.5074, lon: -0.1278 },
    { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
    { name: 'Mumbai, India', lat: 19.0760, lon: 72.8777 },
    { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093 }
  ];

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    if (!locationInput.trim()) return;
    
    const predefined = predefinedLocations.find(loc => 
      loc.name.toLowerCase().includes(locationInput.toLowerCase())
    );
    
    if (predefined) {
      setLocationName(predefined.name);
      onLocationChange({ ...predefined, name: predefined.name });
    } else {
      setLocationName(locationInput);
      onLocationChange({ lat: 40.7128, lon: -74.0060, name: locationInput });
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        onLocationChange({ 
          lat: latitude, 
          lon: longitude, 
          name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` 
        });
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please enter a location manually.');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  return (
    <div className="form-group">
      <label htmlFor="location" className="label">
        Location {locationName && <span style={{color: '#3f51b5'}}>({locationName})</span>}
      </label>
      
      <form onSubmit={handleLocationSubmit} style={{display: 'flex', gap: '0.5rem', marginBottom: '1rem'}}>
        <input
          type="text"
          id="location"
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
          placeholder="Enter city name (e.g., New York, London)"
          className="input"
          style={{flex: 1}}
        />
        <button
          type="submit"
          className="button"
          style={{padding: '0.75rem 1rem', fontSize: '0.9rem'}}
        >
          Search
        </button>
      </form>
      
      <div className="location-buttons">
        {predefinedLocations.slice(0, 3).map((loc) => (
          <button
            key={loc.name}
            type="button"
            onClick={() => {
              setLocationName(loc.name);
              onLocationChange(loc);
            }}
            className="location-quick-button"
          >
            {loc.name}
          </button>
        ))}
      </div>
      
      <button
        type="button"
        onClick={getCurrentLocation}
        disabled={isGettingLocation}
        className="geolocation-button"
      >
        <span style={{marginRight: '0.25rem'}}>📍</span>
        {isGettingLocation ? 'Getting location...' : 'Use current location'}
      </button>
    </div>
  );
};

export default LocationInput;