import React from 'react';

const RainPredictionCard = ({ prediction }) => {
  if (!prediction) return null;

  const { verdict, probability, confidence, location, date, reasoning } = prediction;

  const getVerdictClass = () => {
    switch (verdict.toLowerCase()) {
      case 'rain':
        return 'verdict-rain';
      case 'no rain':
        return 'verdict-no-rain';
      default:
        return 'verdict-uncertain';
    }
  };

  const getWeatherIcon = () => {
    switch (verdict.toLowerCase()) {
      case 'rain':
        return '🌧️';
      case 'no rain':
        return '☀️';
      default:
        return '☁️';
    }
  };

  const confidenceIcons = { low: '⚠️', medium: '📊', high: '✅' };

  return (
    <div className="prediction-card">
      <div className="weather-icon">
        {getWeatherIcon()}
      </div>
      
      <h2 className="location-name">
        {location.includes(',') ? location : `${location}`}
      </h2>
      <p className="date-text">
        {new Date(date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </p>
      
      <div className={`verdict-badge ${getVerdictClass()}`}>
        {verdict.toUpperCase()}
      </div>
      
      <div className="probability">
        {Math.round(probability * 100)}%
      </div>
      <div className="probability-label">Chance of Rain</div>
      
      <div className="confidence">
        <span>Confidence:</span>
        <span style={{fontSize: '1.5rem'}}>{confidenceIcons[confidence]}</span>
        <span style={{fontWeight: 'bold', textTransform: 'capitalize'}}>
          {confidence}
        </span>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${probability * 100}%` }}
        ></div>
      </div>
      
      {reasoning && (
        <div className="reasoning">
          <p>
            💡 {reasoning}
          </p>
        </div>
      )}
    </div>
  );
};

export default RainPredictionCard;