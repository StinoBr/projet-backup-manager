const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');

// GET /api/dashboard/stats
router.get('/stats', DashboardController.getStats);

module.exports = router;