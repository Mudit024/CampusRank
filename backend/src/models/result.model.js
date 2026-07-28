const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    subjectCode: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
    },
    subjectName: {
        type: String,
        required: true,
        trim: true,
    },
    grade: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
    },
    credits: {
        type: Number,
        required: true,
    },
    gradePoints: {
        type: Number,
        required: true,
    }
});

const resultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        index: true,
    },
    semester: {
        type: Number,
        required: true,
        index: true,
    },
    sgpa: {
        type: Number,
        required: true,
    },
    cgpa: {
        type: Number,
        required: true,
    },
    subjects: [subjectSchema],
}, { timestamps: true });

// A student can only have one result document per semester
resultSchema.index({ student: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);
