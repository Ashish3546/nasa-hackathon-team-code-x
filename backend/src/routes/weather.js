const express = require('express');
const router = express.Router();
const { getWeatherPrediction } = require('../controllers/weatherController');
const { downloadReport } = require('../controllers/downloadController');

// GET /api/predict?lat={lat}&lon={lon}&date={YYYY-MM-DD}
router.get('/predict', getWeatherPrediction);

// GET /api/download?lat={lat}&lon={lon}&date={YYYY-MM-DD}
router.get('/download', downloadReport);

module.exports = router;