import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

const VisualizationPanel = ({ prediction, location, date }) => {
  const formatHourlyData = () => {
    if (!prediction?.details?.hourly || prediction.details.hourly.length === 0) {
      return Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, '0')}:00`,
        probability: Math.random() * 60 + 20,
        precipitation: Math.random() * 3,
        temp: Math.random() * 10 + 15
      }));
    }
    
    return prediction.details.hourly.map(hour => {
      const time = new Date(hour.time);
      return {
        hour: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        probability: Math.round(hour.pop * 100),
        precipitation: hour.precipitation,
        temp: Math.round(hour.temp),
        humidity: hour.humidity
      };
    });
  };

  const hourlyData = formatHourlyData();
  const maxPrecip = Math.max(...hourlyData.map(d => d.precipitation));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'white',
          padding: '12px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{ fontWeight: 'bold', color: '#374151' }}>{`Time: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, fontSize: '14px' }}>
              {`${entry.name}: ${entry.value}${entry.name.includes('Probability') ? '%' : entry.name.includes('Temp') ? '°C' : 'mm'}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 className="section-title">
          📈 Hourly Forecast
        </h3>
        <div className="chart-container">
          <div style={{ height: '16rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="probabilityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0369A1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0369A1" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 12 }}
                  interval={2}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="probability" 
                  stroke="#0369A1" 
                  fillOpacity={1}
                  fill="url(#probabilityGradient)"
                  name="Rain Probability"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {maxPrecip > 0 && (
        <div>
          <h3 className="section-title">
            🌧️ Precipitation Amount
          </h3>
          <div className="chart-container">
            <div style={{ height: '12rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} interval={2} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="precipitation" 
                    fill="#0F766E" 
                    name="Precipitation"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="section-title">
          🗺️ Location & Details
        </h3>
        <div className="details-grid">
          <div className="location-overview">
            <div className="location-grid">
              <div className="location-item">
                <div className="location-icon">🗺️</div>
                <div className="location-label">Location</div>
                <div className="location-value">
                  {location.name || `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`}
                </div>
              </div>
              <div className="location-item">
                <div className="location-icon">📍</div>
                <div className="location-label">Coordinates</div>
                <div className="location-value">
                  {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="chart-container">
            {prediction ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="detail-item">
                  <span className="detail-label">
                    📊 Source:
                  </span>
                  <span className="detail-value" style={{ color: '#3b82f6' }}>
                    {prediction.source.join(', ')}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">
                    🎯 Confidence:
                  </span>
                  <span className="detail-value" style={{ color: '#10b981' }}>
                    {prediction.confidence}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">
                    📅 Date:
                  </span>
                  <span className="detail-value">
                    {new Date(date).toLocaleDateString()}
                  </span>
                </div>
                {prediction.details?.daily?.temp && (
                  <div className="detail-item">
                    <span className="detail-label">
                      🌡️ Temperature:
                    </span>
                    <span className="detail-value">
                      {Math.round(prediction.details.daily.temp.day)}°C
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '1rem 0' }}>
                Submit a location and date to see weather details
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizationPanel;