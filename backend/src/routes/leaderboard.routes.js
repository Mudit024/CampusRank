const express = require('express');
const { verifyJWT } = require('../middleware/authMiddleware');
const leaderboardController = require('../controllers/leaderboard.controller');

const router = express.Router();

// Apply verifyJWT route guard so only logged-in students can view ranks
router.get('/', verifyJWT, leaderboardController.getLeaderboard);

module.exports = router;
