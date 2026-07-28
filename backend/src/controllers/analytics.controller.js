const Student = require('../models/student.model');
const Result = require('../models/result.model');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Fetch comparative averages and student's semester gpa timeline.
 */
exports.getAcademicAnalytics = asyncHandler(async (req, res) => {
    const studentId = req.user._id;

    const student = await Student.findById(studentId);
    if (!student) {
        throw new AppError("Student profile not found.", 404);
    }

    if (!student.isTranscriptVerified) {
        throw new AppError("Access denied. Please verify your transcript to access student analytics.", 403);
    }

    // 1. Calculate College, Department and Program CGPA Stats (Averages & Highs)
    const collegeStats = await Student.aggregate([
        { $match: { isTranscriptVerified: true, role: 'student' } },
        {
            $group: {
                _id: null,
                avgCgpa: { $avg: '$cgpa' },
                maxCgpa: { $max: '$cgpa' }
            }
        }
    ]);

    const deptStats = await Student.aggregate([
        { $match: { isTranscriptVerified: true, role: 'student', department: student.department } },
        {
            $group: {
                _id: null,
                avgCgpa: { $avg: '$cgpa' },
                maxCgpa: { $max: '$cgpa' }
            }
        }
    ]);

    const progStats = await Student.aggregate([
        { $match: { isTranscriptVerified: true, role: 'student', program: student.program } },
        {
            $group: {
                _id: null,
                avgCgpa: { $avg: '$cgpa' },
                maxCgpa: { $max: '$cgpa' }
            }
        }
    ]);

    // 2. Retrieve student's semester gpa progression timeline
    const history = await Result.find({ student: student._id }).sort({ semester: 1 });

    return res.status(200).json({
        success: true,
        message: "Academic statistics computed successfully.",
        data: {
            averages: {
                college: collegeStats[0]?.avgCgpa ? parseFloat(collegeStats[0].avgCgpa.toFixed(2)) : 0,
                department: deptStats[0]?.avgCgpa ? parseFloat(deptStats[0].avgCgpa.toFixed(2)) : 0,
                program: progStats[0]?.avgCgpa ? parseFloat(progStats[0].avgCgpa.toFixed(2)) : 0
            },
            highestCgpa: {
                college: collegeStats[0]?.maxCgpa ? parseFloat(collegeStats[0].maxCgpa.toFixed(2)) : 0,
                department: deptStats[0]?.maxCgpa ? parseFloat(deptStats[0].maxCgpa.toFixed(2)) : 0,
                program: progStats[0]?.maxCgpa ? parseFloat(progStats[0].maxCgpa.toFixed(2)) : 0
            },
            history: history.map(h => ({
                semester: h.semester,
                sgpa: h.sgpa,
                cgpa: h.cgpa
            }))
        }
    });
});

/**
 * Compare two students side-by-side.
 */
exports.compareStudents = asyncHandler(async (req, res) => {
    const { rollNumber } = req.query;

    if (!rollNumber) {
        throw new AppError("Target roll number query parameter is required.", 400);
    }

    const studentA = await Student.findById(req.user._id).populate("program department");
    if (!studentA || !studentA.isTranscriptVerified) {
        throw new AppError("Verify your own profile before comparing.", 400);
    }

    const studentB = await Student.findOne({ 
        rollNumber: rollNumber.toUpperCase(), 
        isTranscriptVerified: true 
    }).populate("program department");

    if (!studentB) {
        throw new AppError(`Student with Roll Number "${rollNumber}" not found or lacks a verified transcript.`, 404);
    }

    // Retrieve semester histories
    const resultsA = await Result.find({ student: studentA._id }).sort({ semester: 1 });
    const resultsB = await Result.find({ student: studentB._id }).sort({ semester: 1 });

    // Calculate College Rank for student A
    const rankA = await Student.countDocuments({
        isTranscriptVerified: true,
        role: 'student',
        $or: [
            { cgpa: { $gt: studentA.cgpa } },
            { cgpa: studentA.cgpa, rollNumber: { $lt: studentA.rollNumber } }
        ]
    }) + 1;

    // Calculate College Rank for student B
    const rankB = await Student.countDocuments({
        isTranscriptVerified: true,
        role: 'student',
        $or: [
            { cgpa: { $gt: studentB.cgpa } },
            { cgpa: studentB.cgpa, rollNumber: { $lt: studentB.rollNumber } }
        ]
    }) + 1;

    return res.status(200).json({
        success: true,
        message: "Academic comparison compiled successfully.",
        data: {
            studentA: {
                name: studentA.name,
                rollNumber: studentA.rollNumber,
                cgpa: studentA.cgpa,
                rank: rankA,
                program: studentA.program?.code,
                department: studentA.department?.code,
                history: resultsA.map(r => ({ semester: r.semester, sgpa: r.sgpa, cgpa: r.cgpa }))
            },
            studentB: {
                name: studentB.name,
                rollNumber: studentB.rollNumber,
                cgpa: studentB.cgpa,
                rank: rankB,
                program: studentB.program?.code,
                department: studentB.department?.code,
                history: resultsB.map(r => ({ semester: r.semester, sgpa: r.sgpa, cgpa: r.cgpa }))
            }
        }
    });
});
