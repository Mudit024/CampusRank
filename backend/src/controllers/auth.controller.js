const Student = require('../models/student.model');
const RefreshToken = require('../models/refreshToken.model');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

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

    // Create student directly as verified to bypass Nodemailer requirements in testing
    const student = await Student.create({
        name,
        email,
        password,
        isVerified: true,
        role: 'student'
    });

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(student._id);

    const createdStudent = await Student.findById(student._id).select("-password");

    return res
        .status(201)
        .cookie("accessToken", accessToken, getAccessTokenCookieOptions())
        .cookie("refreshToken", refreshToken, getCookieOptions())
        .json({
            success: true,
            message: "Student account created successfully.",
            data: {
                user: createdStudent,
                accessToken,
                refreshToken
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
