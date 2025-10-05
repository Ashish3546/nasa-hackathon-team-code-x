const express = require('express');
const { geocodeLocation } = require('../controllers/geocodingController');

const router = express.Router();

// GET /api/geocode - Geocode location using Google Maps API
router.get('/', geocodeLocation);

module.exports = router;