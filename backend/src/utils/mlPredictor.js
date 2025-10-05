// ML-based weather prediction using trained model
const { spawn } = require('child_process');
const path = require('path');

// Cache for ML predictions to avoid repeated Python calls
const mlCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getClimateZone(lat) {
  const absLat = Math.abs(lat);
  if (absLat <= 10) return 'equatorial';
  if (absLat <= 23.5) return 'tropical';
  if (absLat <= 35) return 'subtropical';
  if (absLat <= 60) return 'temperate';
  return 'polar';
}

function createFeatureVector(lat, lon, targetDate, weatherData = null) {
  const date = new Date(targetDate);
  const month = date.getMonth() + 1;
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const season = Math.floor((month - 1) / 3); // 0=winter, 1=spring, 2=summer, 3=fall
  
  // Base features from location and date
  const features = {
    lat: lat,
    lon: lon,
    month: month,
    day_of_year: dayOfYear,
    season: season,
    climate_zone: getClimateZone(lat)
  };
  
  // Add weather data if available (for short-term predictions)
  if (weatherData && weatherData.daily && weatherData.daily.length > 0) {
    const recent = weatherData.daily[0];
    features.T2M = recent.temp?.day || 20;
    features.RH2M = recent.humidity || 60;
    features.WS10M = recent.wind_speed || 5;
    features.PS = recent.pressure || 1013;
    features.PRECTOTCORR = (recent.rain && recent.rain['1h']) || 0;
  } else {
    // Use climatological defaults
    const tempBase = getSeasonalTemp(lat, month);
    features.T2M = tempBase;
    features.RH2M = 60 + Math.random() * 20;
    features.WS10M = 3 + Math.random() * 4;
    features.PS = 1013 + (Math.random() - 0.5) * 20;
    features.PRECTOTCORR = 0;
  }
  
  return features;
}

function getSeasonalTemp(lat, month) {
  // Simplified temperature model based on latitude and month
  const tempByZone = {
    equatorial: [26, 27, 28, 28, 27, 26, 25, 25, 26, 27, 27, 26],
    tropical: [24, 25, 27, 29, 31, 32, 32, 31, 30, 28, 26, 24],
    subtropical: [18, 20, 23, 26, 30, 33, 35, 34, 31, 27, 22, 19],
    temperate: [5, 7, 12, 17, 22, 26, 28, 27, 23, 17, 11, 6],
    polar: [-15, -12, -8, -2, 4, 10, 12, 10, 5, -1, -7, -12]
  };
  
  const zone = getClimateZone(lat);
  let temp = tempByZone[zone][month - 1];
  
  // Adjust for southern hemisphere
  if (lat < 0) {
    temp = tempByZone[zone][(month + 5) % 12];
  }
  
  return temp + (Math.random() - 0.5) * 6;
}

async function predictWithML(lat, lon, targetDate, weatherData = null) {
  const cacheKey = `${lat},${lon},${targetDate}`;
  
  // Check cache first
  if (mlCache.has(cacheKey)) {
    const cached = mlCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    mlCache.delete(cacheKey);
  }
  
  try {
    // Create feature vector
    const features = createFeatureVector(lat, lon, targetDate, weatherData);
    
    // Call Python ML model (if available)
    const prediction = await callPythonPredictor(features);
    
    // Cache result
    mlCache.set(cacheKey, {
      data: prediction,
      timestamp: Date.now()
    });
    
    return prediction;
    
  } catch (error) {
    console.log('ML prediction failed, falling back to statistical model:', error.message);
    
    // Fallback to enhanced statistical prediction
    return generateStatisticalPrediction(lat, lon, targetDate, weatherData);
  }
}

function callPythonPredictor(features) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, '../../../scripts/predict.py');
    const python = spawn('python', [pythonScript, JSON.stringify(features)]);
    
    let output = '';
    let error = '';
    
    python.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    python.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output.trim());
          resolve(result);
        } catch (e) {
          reject(new Error('Failed to parse Python output'));
        }
      } else {
        reject(new Error(`Python script failed: ${error}`));
      }
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
      python.kill();
      reject(new Error('Python prediction timeout'));
    }, 10000);
  });
}

function generateStatisticalPrediction(lat, lon, targetDate, weatherData) {
  // Enhanced statistical model as fallback
  const month = new Date(targetDate).getMonth() + 1;
  const climateZone = getClimateZone(lat);
  
  // Base probabilities by climate zone and month
  const baseProbabilities = {
    equatorial: [0.75, 0.70, 0.80, 0.85, 0.80, 0.65, 0.60, 0.65, 0.75, 0.85, 0.85, 0.80],
    tropical: [0.45, 0.40, 0.55, 0.65, 0.70, 0.80, 0.85, 0.80, 0.70, 0.60, 0.50, 0.45],
    subtropical: [0.35, 0.30, 0.40, 0.45, 0.25, 0.15, 0.10, 0.15, 0.25, 0.35, 0.40, 0.35],
    temperate: [0.40, 0.35, 0.45, 0.50, 0.55, 0.60, 0.65, 0.60, 0.50, 0.45, 0.45, 0.40],
    polar: [0.25, 0.20, 0.25, 0.30, 0.35, 0.45, 0.50, 0.45, 0.35, 0.30, 0.25, 0.25]
  };
  
  let probability = baseProbabilities[climateZone][month - 1];
  
  // Adjust based on current weather if available
  if (weatherData && weatherData.daily && weatherData.daily.length > 0) {
    const current = weatherData.daily[0];
    const humidity = current.humidity || 60;
    const pressure = current.pressure || 1013;
    
    // High humidity increases rain probability
    if (humidity > 80) probability *= 1.3;
    else if (humidity < 40) probability *= 0.7;
    
    // Low pressure increases rain probability
    if (pressure < 1000) probability *= 1.2;
    else if (pressure > 1020) probability *= 0.8;
  }
  
  // Add natural variability
  probability += (Math.random() - 0.5) * 0.15;
  probability = Math.max(0.05, Math.min(0.90, probability));
  
  return {
    probability: probability,
    confidence: probability > 0.7 || probability < 0.3 ? 'medium' : 'low',
    source: 'statistical-model',
    method: 'enhanced-climatology'
  };
}

module.exports = { predictWithML, getClimateZone };