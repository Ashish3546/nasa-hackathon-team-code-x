import React, { useState } from 'react';
import './App.css';

function App() {
  const [location, setLocation] = useState({ lat: 40.7128, lon: -74.0060, name: 'New York, NY' });
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const predefinedLocations = [
    { name: 'New York, NY', lat: 40.7128, lon: -74.0060 },
    { name: 'London, UK', lat: 51.5074, lon: -0.1278 },
    { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `http://localhost:3001/api/predict?lat=${location.lat}&lon=${location.lon}&date=${date}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setPrediction({
          ...data,
          location: location.name || data.location
        });
      } else {
        throw new Error('Failed to fetch prediction');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      
      // Demo fallback
      setPrediction({
        location: location.name || 'Demo Location',
        date: date,
        verdict: "Uncertain",
        probability: 0.35,
        confidence: "medium",
        source: ["demo"],
        reasoning: "Demo data - backend connection failed"
      });
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (verdict) => {
    switch (verdict?.toLowerCase()) {
      case 'rain': return '#2196f3';
      case 'no rain': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  const getWeatherIcon = (verdict) => {
    switch (verdict?.toLowerCase()) {
      case 'rain': return '🌧️';
      case 'no rain': return '☀️';
      default: return '☁️';
    }
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>Will It Rain? 🌧️</h1>
          <p>Get accurate rain predictions for any location and date</p>
        </header>

        {error && (
          <div className="error">
            ⚠️ {error}
          </div>
        )}

        <div className="main-grid">
          <div className="card">
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label>Location {location.name && <span>({location.name})</span>}</label>
                <div className="location-buttons">
                  {predefinedLocations.map((loc) => (
                    <button
                      key={loc.name}
                      type="button"
                      onClick={() => setLocation(loc)}
                      className="location-btn"
                    >
                      {loc.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="input"
                />
              </div>
              
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? '🔄 Analyzing...' : '🌦️ Will It Rain?'}
              </button>
            </form>

            {prediction && (
              <div className="prediction-card">
                <div className="weather-icon">{getWeatherIcon(prediction.verdict)}</div>
                <h2>{prediction.location}</h2>
                <p className="date">{new Date(prediction.date).toLocaleDateString('en-US', { 
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                })}</p>
                
                <div 
                  className="verdict-badge"
                  style={{ backgroundColor: getVerdictColor(prediction.verdict) }}
                >
                  {prediction.verdict?.toUpperCase()}
                </div>
                
                <div className="probability">{Math.round(prediction.probability * 100)}%</div>
                <p className="probability-label">Chance of Rain</p>
                
                <div className="confidence">
                  Confidence: <strong>{prediction.confidence}</strong>
                </div>
                
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${prediction.probability * 100}%`,
                      backgroundColor: getVerdictColor(prediction.verdict)
                    }}
                  />
                </div>
                
                {prediction.reasoning && (
                  <div className="reasoning">
                    💡 {prediction.reasoning}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="card">
            <h2>📊 Weather Details</h2>
            {prediction ? (
              <div className="details">
                <div className="detail-item">
                  <span>📊 Source:</span>
                  <span>{prediction.source?.join(', ')}</span>
                </div>
                <div className="detail-item">
                  <span>🎯 Confidence:</span>
                  <span>{prediction.confidence}</span>
                </div>
                <div className="detail-item">
                  <span>📅 Date:</span>
                  <span>{new Date(date).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <span>📍 Location:</span>
                  <span>{location.lat.toFixed(4)}, {location.lon.toFixed(4)}</span>
                </div>
              </div>
            ) : (
              <p className="placeholder">Submit a location and date to see weather details</p>
            )}
          </div>
        </div>
        
        <footer>
          <p>Powered by OpenWeatherMap API • Built with React</p>
        </footer>
      </div>
    </div>
  );
}

export default App;