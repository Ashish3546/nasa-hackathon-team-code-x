const axios = require('axios');

// Function to determine rain verdict based on weather data
function determineRainVerdict(weatherData, targetDate) {
  const { lat, lon } = weatherData;
  
  // Calculate days ahead
  const daysAhead = Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24));
  
  // Find daily forecast for the target date
  const targetForecast = weatherData.daily.find(day => {
    const forecastDate = new Date(day.dt * 1000).toISOString().split('T')[0];
    return forecastDate === targetDate;
  });
  
  // If no forecast data (beyond API limit), use simple prediction
  if (!targetForecast) {
    return generateSimplePrediction(lat, lon, targetDate, daysAhead);
  }
  
  // Handle missing forecast data
  if (!targetForecast.temp) {
    targetForecast.temp = { day: 20, morn: 15, eve: 18, night: 12 };
  }
  if (!targetForecast.humidity) targetForecast.humidity = 60;
  if (!targetForecast.wind_speed) targetForecast.wind_speed = 5;
  if (!targetForecast.pressure) targetForecast.pressure = 1013;
  if (!targetForecast.clouds) targetForecast.clouds = 30;
  
  // Extract precipitation data from API
  const pop = targetForecast.pop || 0;
  const rainVolume = (targetForecast.rain && targetForecast.rain['1h']) || 0;
  const snowVolume = (targetForecast.snow && targetForecast.snow['1h']) || 0;
  const totalPrecip = rainVolume + snowVolume;
  
  // Get hourly data for the target date
  const targetDateStart = new Date(targetDate + 'T00:00:00Z').getTime() / 1000;
  const targetDateEnd = targetDateStart + 24 * 60 * 60;
  
  const hourlyForDate = weatherData.hourly.filter(hour => 
    hour.dt >= targetDateStart && hour.dt < targetDateEnd
  ).map(hour => ({
    time: new Date(hour.dt * 1000).toISOString(),
    pop: hour.pop || 0,
    precipitation: ((hour.rain && hour.rain['1h']) || 0) + ((hour.snow && hour.snow['1h']) || 0),
    temp: hour.temp,
    humidity: hour.humidity,
    weather: hour.weather[0]
  }));
  
  // Use actual weather data probability
  let combinedPop = Math.max(pop, hourlyForDate.length > 0 
    ? hourlyForDate.reduce((sum, h) => sum + h.pop, 0) / hourlyForDate.length 
    : pop);
  
  // Determine verdict based on probability and precipitation
  let verdict, confidence;
  
  if (combinedPop >= 0.7 || totalPrecip > 2) {
    verdict = "Rain";
    confidence = "high";
  } else if (combinedPop >= 0.4 || totalPrecip > 0.5) {
    verdict = "Rain";
    confidence = "medium";
  } else if (combinedPop >= 0.2 || totalPrecip > 0.1) {
    verdict = "Uncertain";
    confidence = "medium";
  } else {
    verdict = "No rain";
    confidence = combinedPop < 0.1 ? "high" : "medium";
  }
  
  // Generate reasoning
  const reasoning = generateReasoning(verdict, combinedPop, totalPrecip);
  
  return {
    location: `${lat}, ${lon}`,
    date: targetDate,
    verdict,
    probability: combinedPop,
    confidence,
    source: ["openweathermap"],
    reasoning,
    details: {
      hourly: hourlyForDate,
      daily: {
        temp: targetForecast.temp || { day: 20, morn: 15, eve: 18, night: 12 },
        humidity: targetForecast.humidity || 60,
        wind_speed: targetForecast.wind_speed || 5,
        pressure: targetForecast.pressure || 1013,
        clouds: targetForecast.clouds || 30,
        weather: targetForecast.weather ? targetForecast.weather[0] : { main: 'Clear', description: 'clear sky' }
      }
    }
  };
}

function generateReasoning(verdict, probability, precipitation) {
  const probPercent = Math.round(probability * 100);
  const precipMm = precipitation.toFixed(1);
  
  if (verdict === "Rain") {
    if (precipitation > 2) {
      return `Weather forecast indicates significant rainfall (${precipMm}mm) with ${probPercent}% probability.`;
    }
    return `Weather models show ${probPercent}% likelihood of rain based on current conditions.`;
  } else if (verdict === "No rain") {
    return `Weather forecast shows clear conditions with only ${probPercent}% precipitation probability.`;
  } else {
    return `Weather conditions show mixed patterns - ${probPercent}% precipitation probability.`;
  }
}

// Generate simple prediction for dates beyond forecast horizon
function generateSimplePrediction(lat, lon, targetDate, daysAhead) {
  const month = new Date(targetDate).getMonth() + 1;
  
  // Simple climate-based probability
  let baseProbability = 0.3;
  
  // Basic seasonal adjustments
  if (month >= 6 && month <= 9) {
    baseProbability = 0.4; // Summer/monsoon
  } else if (month >= 12 || month <= 2) {
    baseProbability = 0.25; // Winter
  }
  
  // Location-based adjustments
  if (Math.abs(lat) < 23.5) {
    baseProbability += 0.1; // Tropical regions
  }
  if (lat > 10 && lat < 30 && lon > 70 && lon < 90) {
    baseProbability += 0.2; // Monsoon regions
  }
  
  baseProbability = Math.max(0.1, Math.min(0.8, baseProbability));
  
  let verdict, confidence;
  if (baseProbability >= 0.6) {
    verdict = "Rain";
    confidence = "medium";
  } else if (baseProbability >= 0.35) {
    verdict = "Uncertain";
    confidence = "low";
  } else {
    verdict = "No rain";
    confidence = "medium";
  }
  
  return {
    location: `${lat}, ${lon}`,
    date: targetDate,
    verdict,
    probability: baseProbability,
    confidence,
    source: ["climate_forecast"],
    reasoning: `Extended forecast based on seasonal patterns (${daysAhead} days ahead)`,
    details: {
      hourly: [],
      daily: {
        temp: {
          day: Math.round(25 + (Math.sin(lat * 0.1) * 10)),
          morn: Math.round(22 + (Math.sin(lat * 0.1) * 10)),
          eve: Math.round(24 + (Math.sin(lat * 0.1) * 10)),
          night: Math.round(20 + (Math.sin(lat * 0.1) * 10))
        },
        humidity: Math.round(60 + (baseProbability * 20)),
        wind_speed: 5,
        pressure: 1013,
        clouds: Math.round(baseProbability * 70)
      }
    }
  };
}

module.exports = { determineRainVerdict };