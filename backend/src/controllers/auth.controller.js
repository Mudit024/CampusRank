const Student = require('../models/student.model');
const RefreshToken = require('../models/refreshToken.model');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const { sendOTPMail } = require('../utils/mailer');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Cookie options for refresh tokens (7 days expiration)
const getCookieOptions = () => {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 
    };
};

// Cookie options for access tokens (15 minutes expiration)
const getAccessTokenCookieOptions = () => {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        maxAge: 15 * 60 * 1000 
    };
};

// Helper to generate access and refresh tokens, caching the refresh token in the database
const generateAccessAndRefreshTokens = async (studentId) => {
    try {
        const student = await Student.findById(studentId);
        if (!student) {
            throw new AppError("Student profile does not exist.", 404);
        }

        const accessToken = student.generateAccessToken();
        const refreshToken = student.generateRefreshToken();

        // Expire session log in 7 days
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await RefreshToken.create({
            token: refreshToken,
            student: studentId,
            expiresAt
        });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new AppError(error.message || "Failed to generate security tokens.", 500);
    }
};

/**
 * Register a student.
 * Restricts registrations to @mnnit.ac.in domains.
 */
exports.register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if ([name, email, password].some((field) => !field || field.trim() === "")) {
        throw new AppError("All registration fields are required.", 400);
    }

    // Direct domain verification
    if (!email.toLowerCase().endsWith("@mnnit.ac.in")) {
        throw new AppError("Registration is restricted to official college emails (@mnnit.ac.in) only.", 400);
    }

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
        throw new AppError("A student account is already registered with this email.", 409);
    }

    // Generate 6-digit verification code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Create student as unverified initially
    const student = await Student.create({
        name,
        email,
        password,
        isVerified: false,
        otp: otpCode,
        otpExpiresAt,
        role: 'student'
    });

    // Send verification mail
    await sendOTPMail(email, otpCode);

    return res.status(201).json({
        success: true,
        message: "Registration successful! A 6-digit verification OTP has been sent to your college email.",
        data: {
            email: student.email
        }
    });
});

/**
 * Log in student.
 */
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new AppError("Email and password are required.", 400);
    }

    const student = await Student.findOne({ email }).select("+password");
    if (!student) {
        throw new AppError("Incorrect email or password.", 401);
    }

    const isPasswordCorrect = await student.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new AppError("Incorrect email or password.", 401);
    }

    if (!student.isVerified) {
        throw new AppError("Your account has not been verified yet. Please complete email OTP verification.", 403);
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(student._id);

    const loggedInUser = await Student.findById(student._id).populate("program department");

    return res
        .status(200)
        .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
        .cookie("refreshToken", refreshToken, getCookieOptions())
        .json({
            success: true,
            message: "Successfully signed in.",
            data: {
                user: loggedInUser,
                accessToken,
                refreshToken
            }
        });
});

/**
 * Log out student and revoke refresh token.
 */
exports.logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
        await RefreshToken.deleteOne({ token: refreshToken });
    }

    const clearOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    };

    return res
        .status(200)
        .clearCookie("accessToken", clearOptions)
        .clearCookie("refreshToken", clearOptions)
        .json({
            success: true,
            message: "User successfully logged out."
        });
});

/**
 * Refresh access session using token rotation.
 */
exports.refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
        throw new AppError("Session refresh failed: Token not provided.", 401);
    }

    const tokenRecord = await RefreshToken.findOne({ token: incomingRefreshToken });
    if (!tokenRecord) {
        throw new AppError("Invalid or expired session. Please log in again.", 403);
    }

    // Immediately revoke old token (rotation)
    await RefreshToken.deleteOne({ _id: tokenRecord._id });

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(tokenRecord.student);

    return res
        .status(200)
        .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
        .cookie("refreshToken", refreshToken, getCookieOptions())
        .json({
            success: true,
            message: "Tokens refreshed successfully.",
            data: {
                accessToken,
                refreshToken
            }
        });
});

/**
 * Retrieve authenticated student profile details with class rank standings.
 */
exports.getMe = asyncHandler(async (req, res) => {
    const student = await Student.findById(req.user._id).populate("program department");
    if (!student) {
        throw new AppError("Student profile not found.", 404);
    }

    let classRank = null;
    let totalClassStudents = null;
    if (student.isTranscriptVerified) {
        classRank = await Student.countDocuments({
            isTranscriptVerified: true,
            role: 'student',
            program: student.program?._id,
            batch: student.batch,
            $or: [
                { cgpa: { $gt: student.cgpa } },
                { cgpa: student.cgpa, rollNumber: { $lt: student.rollNumber } }
            ]
        }) + 1;

        totalClassStudents = await Student.countDocuments({
            isTranscriptVerified: true,
            role: 'student',
            program: student.program?._id,
            batch: student.batch
        });
    }

    return res.status(200).json({
        success: true,
        message: "Student profile retrieved successfully.",
        data: {
            ...student.toObject(),
            classRank,
            totalClassStudents
        }
    });
});

/**
 * Verify OTP code for normal registration
 */
exports.verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        throw new AppError("Email and OTP code are required.", 400);
    }

    const student = await Student.findOne({ email }).select("+otp +otpExpiresAt");
    if (!student) {
        throw new AppError("Student record not found.", 404);
    }

    if (student.isVerified) {
        throw new AppError("Student email is already verified.", 400);
    }

    if (!student.otp || student.otp !== otp) {
        throw new AppError("Invalid verification code. Please check and try again.", 400);
    }

    if (new Date() > student.otpExpiresAt) {
        throw new AppError("Verification code has expired. Please request a new one.", 400);
    }

    // Mark as verified, clear OTP details
    student.isVerified = true;
    student.otp = undefined;
    student.otpExpiresAt = undefined;
    await student.save();

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(student._id);
    const verifiedStudent = await Student.findById(student._id).populate("program department");

    return res
        .status(200)
        .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
        .cookie("refreshToken", refreshToken, getCookieOptions())
        .json({
            success: true,
            message: "Email verified successfully! Welcome to CampusRank.",
            data: {
                user: verifiedStudent,
                accessToken,
                refreshToken
            }
        });
});

/**
 * Resend OTP code for normal registration
 */
exports.resendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new AppError("Email is required to resend verification code.", 400);
    }

    const student = await Student.findOne({ email });
    if (!student) {
        throw new AppError("Student record not found.", 404);
    }

    if (student.isVerified) {
        throw new AppError("Student email is already verified.", 400);
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    student.otp = otpCode;
    student.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await student.save();

    await sendOTPMail(email, otpCode);

    return res.status(200).json({
        success: true,
        message: "A new 6-digit OTP code has been successfully sent to your college email."
    });
});

/**
 * Google OAuth Sign-in / Sign-up handler
 */
exports.googleLogin = asyncHandler(async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) {
        throw new AppError("Google Identity ID Token is required.", 400);
    }

    let payload;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        payload = ticket.getPayload();
    } catch (error) {
        console.error("❌ Google Token Verification Error details:", error);
        throw new AppError("Google token verification failed: " + error.message, 401);
    }

    const email = payload.email;
    const name = payload.name || "MNNIT Student";

    if (!email.toLowerCase().endsWith("@mnnit.ac.in")) {
        throw new AppError("Access is restricted to official college emails (@mnnit.ac.in) only.", 400);
    }

    let student = await Student.findOne({ email });
    if (!student) {
        // Auto-create Google verified student
        student = await Student.create({
            name,
            email,
            isVerified: true,
            role: 'student'
        });
    } else if (!student.isVerified) {
        // Auto-verify account since Google has verified their identity
        student.isVerified = true;
        await student.save();
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(student._id);
    const loggedInUser = await Student.findById(student._id).populate("program department");

    return res
        .status(200)
        .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
        .cookie("refreshToken", refreshToken, getCookieOptions())
        .json({
            success: true,
            message: "Signed in successfully with Google.",
            data: {
                user: loggedInUser,
                accessToken,
                refreshToken
            }
        });
});
