const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        index: true,
    },
    fileName: {
        type: String,
        required: true,
    },
    fileUrl: {
        type: String,
        required: true,
    },
    fileHash: {
        type: String,
        required: true,
        unique: true,
        index: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Upload', uploadSchema);
