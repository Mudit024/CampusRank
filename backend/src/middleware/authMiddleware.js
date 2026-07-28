const jwt = require('jsonwebtoken');
const Student = require('../models/student.model');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Route protection middleware verifying Access Token cookie or Authorization header.
 */
exports.verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = 
            req.cookies?.accessToken || 
            req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            throw new AppError("Access denied: No token provided.", 401);
        }

        const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        
        const student = await Student.findById(decodedToken._id).populate("program department");
        if (!student) {
            throw new AppError("Access denied: Student account not found.", 401);
        }

        req.user = student;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            const expiredError = new AppError("Access token has expired.", 401);
            expiredError.errors = [{ code: 'TOKEN_EXPIRED' }];
            return next(expiredError);
        }
        
        return next(new AppError(error.message || "Access denied: Invalid session token.", 401));
    }
});

/**
 * Role-based access authorization middleware.
 */
exports.verifyRole = (roles = []) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            throw new AppError("Access Forbidden: Insufficient privileges.", 403);
        }
        next();
    };
};
