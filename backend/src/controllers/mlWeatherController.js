const { spawn } = require('child_process');
const path = require('path');

// Train the ML model
const trainModel = async (req, res) => {
  try {
    const pythonScript = path.join(__dirname, '..', 'ml', 'weather_predictor.py');
    
    const python = spawn('python', [pythonScript, 'train']);
    
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
          const result = JSON.parse(output);
          res.json(result);
        } catch (e) {
          res.json({ success: "Model training completed" });
        }
      } else {
        res.status(500).json({ error: error || 'Training failed' });
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get ML weather prediction
const getMLWeatherPrediction = async (req, res) => {
  try {
    const { location, date } = req.query;
    
    if (!location || !date) {
      return res.status(400).json({ error: 'Missing location or date parameter' });
    }
    
    const pythonScript = path.join(__dirname, '..', 'ml', 'weather_predictor.py');
    
    const python = spawn('python', [pythonScript, 'predict', location, date]);
    
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
          const result = JSON.parse(output);
          
          if (result.error) {
            return res.status(400).json(result);
          }
          
          // Format response to match existing API structure
          const prediction = {
            location: result.location,
            date: result.date,
            verdict: result.verdict,
            probability: result.probability,
            confidence: result.confidence,
            source: ["ml_model"],
            reasoning: `ML prediction based on historical weather patterns for ${result.location}`,
            details: {
              hourly: [],
              daily: {
                temp: {
                  day: result.temperature,
                  morn: result.temperature - 3,
                  eve: result.temperature - 1,
                  night: result.temperature - 5
                },
                humidity: result.humidity,
                wind_speed: result.wind_speed / 3.6, // Convert km/h to m/s
                pressure: 1013, // Default pressure
                clouds: Math.round(result.probability * 80),
                weather: {
                  main: result.verdict === "Rain" ? "Rain" : result.verdict === "Uncertain" ? "Clouds" : "Clear",
                  description: result.verdict === "Rain" ? "light rain" : result.verdict === "Uncertain" ? "scattered clouds" : "clear sky"
                }
              }
            }
          };
          
          res.json(prediction);
          
        } catch (e) {
          res.status(500).json({ error: 'Failed to parse ML prediction' });
        }
      } else {
        res.status(500).json({ error: error || 'ML prediction failed' });
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { trainModel, getMLWeatherPrediction };