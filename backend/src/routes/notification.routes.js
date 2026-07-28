const express = require('express');
const { verifyJWT } = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notification.controller');

const router = express.Router();

router.get('/', verifyJWT, notificationController.getNotifications);
router.patch('/read-all', verifyJWT, notificationController.markAllAsRead);

module.exports = router;
