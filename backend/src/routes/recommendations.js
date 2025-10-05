const express = require('express');
const { generateRecommendations } = require('../controllers/recommendationsController');

const router = express.Router();

router.post('/generate', generateRecommendations);

module.exports = router;