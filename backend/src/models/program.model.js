const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true,
    },
    duration: {
        type: Number,
        default: 4, // standard 4 years program
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true,
        index: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Program', programSchema);
