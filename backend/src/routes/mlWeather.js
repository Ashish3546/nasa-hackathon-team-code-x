const express = require('express');
const router = express.Router();
const { trainModel, getMLWeatherPrediction } = require('../controllers/mlWeatherController');

// Train ML model
router.post('/train', trainModel);

// Get ML weather prediction
router.get('/predict', getMLWeatherPrediction);

module.exports = router;