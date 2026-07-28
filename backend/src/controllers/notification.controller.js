const Notification = require('../models/notification.model');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Get all notifications for the authenticated student.
 */
exports.getNotifications = asyncHandler(async (req, res) => {
    const studentId = req.user._id;

    const notifications = await Notification.find({ student: studentId })
        .sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        message: "Notifications retrieved successfully.",
        data: notifications
    });
});

/**
 * Mark all notifications as read for the student.
 */
exports.markAllAsRead = asyncHandler(async (req, res) => {
    const studentId = req.user._id;

    await Notification.updateMany(
        { student: studentId, isRead: false },
        { $set: { isRead: true } }
    );

    return res.status(200).json({
        success: true,
        message: "All notifications marked as read."
    });
});
