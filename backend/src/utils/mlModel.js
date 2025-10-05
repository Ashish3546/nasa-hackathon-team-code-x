// Simple ML model implementation in JavaScript
// Trained on synthetic weather data patterns

class WeatherMLModel {
  constructor() {
    // Pre-trained weights based on weather patterns analysis
    this.weights = {
      // Location features
      lat: -0.012,
      lon: 0.003,
      
      // Temporal features
      month: 0.15,
      dayOfYear: -0.001,
      season: 0.08,
      
      // Weather features
      temperature: -0.02,
      humidity: 0.025,
      pressure: -0.018,
      windSpeed: 0.01,
      
      // Climate zone weights
      climateZone: {
        equatorial: 0.6,
        tropical: 0.4,
        subtropical: 0.2,
        temperate: 0.3,
        polar: 0.15
      },
      
      // Regional patterns
      monsoon: 0.8,
      mediterranean: -0.3,
      desert: -0.7,
      
      // Bias term
      bias: 0.25
    };
    
    // Training data statistics for normalization
    this.stats = {
      lat: { mean: 0, std: 30 },
      lon: { mean: 0, std: 60 },
      temperature: { mean: 20, std: 15 },
      humidity: { mean: 65, std: 20 },
      pressure: { mean: 1013, std: 15 },
      windSpeed: { mean: 5, std: 3 }
    };
  }
  
  normalize(value, feature) {
    const stat = this.stats[feature];
    if (!stat) return value;
    return (value - stat.mean) / stat.std;
  }
  
  getClimateZone(lat) {
    const absLat = Math.abs(lat);
    if (absLat <= 10) return 'equatorial';
    if (absLat <= 23.5) return 'tropical';
    if (absLat <= 35) return 'subtropical';
    if (absLat <= 60) return 'temperate';
    return 'polar';
  }
  
  getRegionalFeatures(lat, lon) {
    let features = { monsoon: 0, mediterranean: 0, desert: 0 };
    
    // Monsoon regions
    if (lat >= 5 && lat <= 30 && lon >= 60 && lon <= 140) {
      features.monsoon = 1;
    }
    
    // Mediterranean
    if (lat >= 30 && lat <= 45 && lon >= -10 && lon <= 45) {
      features.mediterranean = 1;
    }
    
    // Desert regions
    const deserts = [
      {latRange: [20, 35], lonRange: [-120, -100]},
      {latRange: [15, 35], lonRange: [10, 50]},
      {latRange: [-35, -15], lonRange: [110, 140]}
    ];
    
    for (const desert of deserts) {
      if (lat >= desert.latRange[0] && lat <= desert.latRange[1] &&
          lon >= desert.lonRange[0] && lon <= desert.lonRange[1]) {
        features.desert = 1;
        break;
      }
    }
    
    return features;
  }
  
  predict(features) {
    const {
      lat, lon, month, dayOfYear, season,
      temperature, humidity, pressure, windSpeed
    } = features;
    
    // Normalize numerical features
    const normLat = this.normalize(lat, 'lat');
    const normLon = this.normalize(lon, 'lon');
    const normTemp = this.normalize(temperature, 'temperature');
    const normHumidity = this.normalize(humidity, 'humidity');
    const normPressure = this.normalize(pressure, 'pressure');
    const normWind = this.normalize(windSpeed, 'windSpeed');
    
    // Get categorical features
    const climateZone = this.getClimateZone(lat);
    const regional = this.getRegionalFeatures(lat, lon);
    
    // Calculate linear combination
    let score = this.weights.bias;
    score += normLat * this.weights.lat;
    score += normLon * this.weights.lon;
    score += (month / 12) * this.weights.month;
    score += (dayOfYear / 365) * this.weights.dayOfYear;
    score += (season / 4) * this.weights.season;
    score += normTemp * this.weights.temperature;
    score += normHumidity * this.weights.humidity;
    score += normPressure * this.weights.pressure;
    score += normWind * this.weights.windSpeed;
    
    // Add climate zone effect
    score += this.weights.climateZone[climateZone] || 0.3;
    
    // Add regional effects
    score += regional.monsoon * this.weights.monsoon;
    score += regional.mediterranean * this.weights.mediterranean;
    score += regional.desert * this.weights.desert;
    
    // Apply sigmoid activation
    const probability = 1 / (1 + Math.exp(-score));
    
    // Determine confidence
    let confidence = 'low';
    if (probability > 0.8 || probability < 0.2) confidence = 'high';
    else if (probability > 0.65 || probability < 0.35) confidence = 'medium';
    
    return {
      probability: Math.max(0.05, Math.min(0.95, probability)),
      confidence,
      score,
      features: {
        climateZone,
        regional,
        normalized: {
          lat: normLat,
          lon: normLon,
          temperature: normTemp,
          humidity: normHumidity,
          pressure: normPressure,
          windSpeed: normWind
        }
      }
    };
  }
}

module.exports = { WeatherMLModel };