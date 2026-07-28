const express = require('express');
const { verifyJWT } = require('../middleware/authMiddleware');
const analyticsController = require('../controllers/analytics.controller');

const router = express.Router();

// Apply verifyJWT route guard so only logged-in students can fetch analytics
router.get('/', verifyJWT, analyticsController.getAcademicAnalytics);
router.get('/compare', verifyJWT, analyticsController.compareStudents);

module.exports = router;
