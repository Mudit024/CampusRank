const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['info', 'alert', 'rank_up', 'achievement', 'transcript_verified', 'general'],
        default: 'general',
        index: true,
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
