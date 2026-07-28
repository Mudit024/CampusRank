const multer = require('multer');
const AppError = require('../utils/appError');

// Store files as raw buffers in RAM
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new AppError('Only official transcript PDF files are supported.', 400), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB size limit
    }
});

module.exports = upload;
