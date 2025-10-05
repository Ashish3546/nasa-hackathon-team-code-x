const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('OPENWEATHER_API_KEY:', process.env.OPENWEATHER_API_KEY ? 'Loaded' : 'Not found');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const weatherRoutes = require('./src/routes/weather');
const geocodingRoutes = require('./src/routes/geocoding');
const recommendationsRoutes = require('./src/routes/recommendations');
const mlWeatherRoutes = require('./src/routes/mlWeather');

// Routes
app.use('/api', weatherRoutes);
app.use('/api/geocode', geocodingRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/ml', mlWeatherRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Will It Rain API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});