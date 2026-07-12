const express = require('express');
const { verifyJWT } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const transcriptController = require('../controllers/transcript.controller');

const router = express.Router();

// Enforce auth verification and check for 'transcript' file key in multipart form uploads
router.post('/upload', verifyJWT, upload.single('transcript'), transcriptController.uploadTranscript);

module.exports = router;
