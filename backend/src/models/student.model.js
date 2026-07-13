const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required."],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        unique: true,
        lowercase: true,
        trim: true,
        // Restricts registrations strictly to the mnnit.ac.in domain
        match: [/^[a-zA-Z0-9._%+-]+@mnnit\.ac\.in$/, 'Registration is restricted to official college emails (@mnnit.ac.in) only.'],
    },
    password: {
        type: String,
        required: [true, "Password is required."],
        minlength: [6, "Password must be at least 6 characters long."],
        select: false,
    },
    rollNumber: {
        type: String,
        unique: true,
        sparse: true,
        uppercase: true,
        trim: true,
        index: true,
    },
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program',
        index: true,
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        index: true,
    },
    batch: {
        type: Number,
        index: true,
    },
    semester: {
        type: Number,
        default: 1,
        index: true,
    },
    section: {
        type: String,
        uppercase: true,
        trim: true,
    },
    profilePhoto: {
        type: String,
        default: "",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isTranscriptVerified: {
        type: Boolean,
        default: false,
    },
    cgpa: {
        type: Number,
        index: true,
    },
    transcriptHash: {
        type: String,
        unique: true,
        sparse: true,
        index: true,
    },
    achievements: [
        {
            title: { type: String, required: true },
            description: { type: String, required: true },
            icon: { type: String, required: true },
            unlockedAt: { type: Date, default: Date.now }
        }
    ],
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student',
    }
}, { timestamps: true });

// Pre-save password hashing hook (no 'next' callback parameter to avoid Mongoose validation bugs)
studentSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Helper method to verify passwords
studentSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Helper method to generate access tokens
studentSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name,
            role: this.role
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m'
        }
    );
};

// Helper method to generate refresh tokens
studentSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d'
        }
    );
};

module.exports = mongoose.model('Student', studentSchema);
