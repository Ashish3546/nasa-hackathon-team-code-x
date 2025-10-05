// Synthetic training data based on real weather patterns
// Simulates 10 years of weather data for model training

const TRAINING_DATA = [
  // Mumbai (Tropical monsoon)
  ...generateLocationData(19.0760, 72.8777, 'Mumbai', 'tropical-monsoon'),
  
  // New York (Temperate continental)
  ...generateLocationData(40.7128, -74.0060, 'NewYork', 'temperate'),
  
  // London (Temperate oceanic)
  ...generateLocationData(51.5074, -0.1278, 'London', 'temperate-oceanic'),
  
  // Tokyo (Humid subtropical)
  ...generateLocationData(35.6762, 139.6503, 'Tokyo', 'humid-subtropical'),
  
  // Sydney (Temperate oceanic)
  ...generateLocationData(-33.8688, 151.2093, 'Sydney', 'temperate-oceanic'),
  
  // Cairo (Hot desert)
  ...generateLocationData(30.0444, 31.2357, 'Cairo', 'hot-desert')
];

function generateLocationData(lat, lon, location, climateType) {
  const data = [];
  const startYear = 2015;
  const endYear = 2024;
  
  for (let year = startYear; year <= endYear; year++) {
    for (let month = 1; month <= 12; month++) {
      const daysInMonth = new Date(year, month, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const dayOfYear = Math.floor((date - new Date(year, 0, 0)) / (1000 * 60 * 60 * 24));
        const season = Math.floor((month - 1) / 3);
        
        // Generate weather features based on climate type
        const weather = generateWeatherForClimate(lat, lon, month, day, climateType);
        
        // Generate rain probability based on multiple factors
        const rainProb = calculateRainProbability(lat, lon, month, weather, climateType);
        
        data.push({
          lat,
          lon,
          location,
          date: date.toISOString().split('T')[0],
          month,
          dayOfYear,
          season,
          temperature: weather.temperature,
          humidity: weather.humidity,
          pressure: weather.pressure,
          windSpeed: weather.windSpeed,
          climateType,
          rainProbability: rainProb,
          willRain: rainProb > 0.5 ? 1 : 0
        });
      }
    }
  }
  
  return data;
}

function generateWeatherForClimate(lat, lon, month, day, climateType) {
  const baseTemp = getBaseTemperature(lat, month);
  const seasonalVariation = Math.sin((month - 1) * Math.PI / 6) * 5;
  const dailyVariation = (Math.random() - 0.5) * 8;
  
  let temperature = baseTemp + seasonalVariation + dailyVariation;
  let humidity = 60;
  let pressure = 1013;
  let windSpeed = 5;
  
  // Climate-specific adjustments
  switch (climateType) {
    case 'tropical-monsoon':
      humidity = 70 + Math.random() * 25;
      if (month >= 6 && month <= 9) { // Monsoon season
        humidity += 15;
        pressure -= 8;
        windSpeed += 3;
      }
      break;
      
    case 'temperate':
      humidity = 55 + Math.random() * 30;
      pressure = 1010 + Math.random() * 20;
      windSpeed = 3 + Math.random() * 6;
      break;
      
    case 'temperate-oceanic':
      humidity = 65 + Math.random() * 20;
      pressure = 1015 + Math.random() * 15;
      windSpeed = 4 + Math.random() * 5;
      temperature -= 2; // Oceanic moderation
      break;
      
    case 'humid-subtropical':
      humidity = 65 + Math.random() * 25;
      if (month >= 6 && month <= 8) { // Summer
        humidity += 10;
        temperature += 3;
      }
      break;
      
    case 'hot-desert':
      humidity = 20 + Math.random() * 30;
      pressure = 1015 + Math.random() * 10;
      windSpeed = 2 + Math.random() * 4;
      temperature += 5; // Hotter
      break;
  }
  
  return {
    temperature: Math.round(temperature * 10) / 10,
    humidity: Math.round(humidity),
    pressure: Math.round(pressure),
    windSpeed: Math.round(windSpeed * 10) / 10
  };
}

function getBaseTemperature(lat, month) {
  const tempByZone = {
    equatorial: [26, 27, 28, 28, 27, 26, 25, 25, 26, 27, 27, 26],
    tropical: [24, 25, 27, 29, 31, 32, 32, 31, 30, 28, 26, 24],
    subtropical: [18, 20, 23, 26, 30, 33, 35, 34, 31, 27, 22, 19],
    temperate: [5, 7, 12, 17, 22, 26, 28, 27, 23, 17, 11, 6],
    polar: [-15, -12, -8, -2, 4, 10, 12, 10, 5, -1, -7, -12]
  };
  
  const absLat = Math.abs(lat);
  let zone = 'temperate';
  if (absLat <= 10) zone = 'equatorial';
  else if (absLat <= 23.5) zone = 'tropical';
  else if (absLat <= 35) zone = 'subtropical';
  else if (absLat > 60) zone = 'polar';
  
  let temp = tempByZone[zone][month - 1];
  
  // Southern hemisphere adjustment
  if (lat < 0) {
    temp = tempByZone[zone][(month + 5) % 12];
  }
  
  return temp;
}

function calculateRainProbability(lat, lon, month, weather, climateType) {
  let baseProb = 0.3;
  
  // Climate type base probabilities
  const climateProbs = {
    'tropical-monsoon': [0.2, 0.15, 0.3, 0.4, 0.6, 0.85, 0.9, 0.85, 0.7, 0.5, 0.3, 0.25],
    'temperate': [0.4, 0.35, 0.45, 0.5, 0.55, 0.6, 0.65, 0.6, 0.5, 0.45, 0.45, 0.4],
    'temperate-oceanic': [0.5, 0.45, 0.5, 0.45, 0.4, 0.35, 0.3, 0.35, 0.4, 0.5, 0.55, 0.5],
    'humid-subtropical': [0.3, 0.35, 0.45, 0.5, 0.6, 0.7, 0.75, 0.7, 0.6, 0.4, 0.35, 0.3],
    'hot-desert': [0.05, 0.03, 0.08, 0.1, 0.05, 0.02, 0.01, 0.02, 0.03, 0.05, 0.08, 0.06]
  };
  
  baseProb = climateProbs[climateType] ? climateProbs[climateType][month - 1] : 0.3;
  
  // Weather-based adjustments
  if (weather.humidity > 80) baseProb *= 1.4;
  else if (weather.humidity < 40) baseProb *= 0.6;
  
  if (weather.pressure < 1000) baseProb *= 1.3;
  else if (weather.pressure > 1020) baseProb *= 0.7;
  
  if (weather.windSpeed > 8) baseProb *= 1.2;
  
  // Temperature effects
  if (weather.temperature > 30) baseProb *= 1.1; // Convective rain
  else if (weather.temperature < 5) baseProb *= 0.8;
  
  // Add some randomness
  baseProb += (Math.random() - 0.5) * 0.2;
  
  return Math.max(0.01, Math.min(0.99, baseProb));
}

module.exports = { TRAINING_DATA };