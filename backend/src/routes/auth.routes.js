const express = require('express');
const authController = require('../controllers/auth.controller');
const { verifyJWT } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshAccessToken);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/google-login', authController.googleLogin);
router.get('/me', verifyJWT, authController.getMe);

module.exports = router;
