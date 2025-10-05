const generateCSVReport = (prediction) => {
  const headers = ['Field', 'Value'];
  const rows = [
    ['Location', prediction.location],
    ['Date', prediction.date],
    ['Verdict', prediction.verdict],
    ['Probability', `${Math.round(prediction.probability * 100)}%`],
    ['Confidence', prediction.confidence],
    ['Reasoning', prediction.reasoning || 'N/A'],
    ['Data Source', prediction.source.join(', ')],
    ['Generated At', new Date().toISOString()]
  ];

  if (prediction.details?.hourly?.length > 0) {
    rows.push(['', '']); // Empty row
    rows.push(['Hourly Forecast', '']);
    rows.push(['Time', 'Rain Probability (%)', 'Precipitation (mm)', 'Temperature (°C)']);
    
    prediction.details.hourly.forEach(hour => {
      const time = new Date(hour.time).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      rows.push([
        time,
        Math.round(hour.pop * 100),
        hour.precipitation.toFixed(2),
        Math.round(hour.temp)
      ]);
    });
  }

  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

const downloadReport = async (req, res) => {
  try {
    const { lat, lon, date } = req.query;
    
    if (!lat || !lon || !date) {
      return res.status(400).json({ error: 'Missing required parameters: lat, lon, date' });
    }

    // Get prediction data (reuse existing logic)
    const { getWeatherPrediction } = require('./weatherController');
    
    // Create a mock request/response to get prediction data
    const mockReq = { query: { lat, lon, date } };
    let predictionData = null;
    
    const mockRes = {
      json: (data) => { predictionData = data; },
      status: () => mockRes
    };
    
    await getWeatherPrediction(mockReq, mockRes);
    
    if (!predictionData) {
      return res.status(500).json({ error: 'Failed to generate prediction data' });
    }

    const csvContent = generateCSVReport(predictionData);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="weather-report-${date}.csv"`);
    res.send(csvContent);
    
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

module.exports = { downloadReport };