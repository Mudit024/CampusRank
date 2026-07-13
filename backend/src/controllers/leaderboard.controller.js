const Student = require('../models/student.model');
const Department = require('../models/department.model');
const Program = require('../models/program.model');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Fetch leaderboard lists and dynamic standings.
 */
exports.getLeaderboard = asyncHandler(async (req, res) => {
    if (!req.user || !req.user.isTranscriptVerified) {
        throw new AppError("Access denied. Please verify your transcript to access class standings.", 403);
    }

    const { page = 1, limit = 20, search, batch, department, program } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Filter rules
    const filterQuery = {
        isTranscriptVerified: true,
        role: 'student'
    };

    if (search) {
        filterQuery.$or = [
            { name: { $regex: search, $options: 'i' } },
            { rollNumber: { $regex: search, $options: 'i' } }
        ];
    }

    if (batch) {
        filterQuery.batch = parseInt(batch);
    }
    if (department) {
        filterQuery.department = department;
    }
    if (program) {
        filterQuery.program = program;
    }

    // Retrieve sorted list of verified students
    const students = await Student.find(filterQuery)
        .populate("program department")
        .sort({ cgpa: -1, rollNumber: 1 })
        .skip(skip)
        .limit(limitNum);

    const total = await Student.countDocuments(filterQuery);

    // Dynamic absolute rank mapping for retrieved items
    const leaderboard = await Promise.all(students.map(async (st) => {
        // College Rank (Overall system-wide)
        const collegeRank = await Student.countDocuments({
            isTranscriptVerified: true,
            role: 'student',
            $or: [
                { cgpa: { $gt: st.cgpa } },
                { cgpa: st.cgpa, rollNumber: { $lt: st.rollNumber } }
            ]
        }) + 1;

        // Batch Rank (Compared to the same batch year)
        const batchRank = await Student.countDocuments({
            isTranscriptVerified: true,
            role: 'student',
            batch: st.batch,
            $or: [
                { cgpa: { $gt: st.cgpa } },
                { cgpa: st.cgpa, rollNumber: { $lt: st.rollNumber } }
            ]
        }) + 1;

        // Class / Program Rank (Compared to same batch and degree program)
        const classRank = await Student.countDocuments({
            isTranscriptVerified: true,
            role: 'student',
            program: st.program?._id,
            batch: st.batch,
            $or: [
                { cgpa: { $gt: st.cgpa } },
                { cgpa: st.cgpa, rollNumber: { $lt: st.rollNumber } }
            ]
        }) + 1;

        return {
            _id: st._id,
            name: st.name,
            rollNumber: st.rollNumber,
            cgpa: st.cgpa,
            batch: st.batch,
            semester: st.semester,
            program: st.program,
            department: st.department,
            collegeRank,
            batchRank,
            classRank
        };
    }));

    // Calculate personal ranks for the currently logged-in student (if verified)
    let myRanks = null;
    if (req.user && req.user.isTranscriptVerified) {
        const me = req.user;

        const collegeRank = await Student.countDocuments({
            isTranscriptVerified: true,
            role: 'student',
            $or: [
                { cgpa: { $gt: me.cgpa } },
                { cgpa: me.cgpa, rollNumber: { $lt: me.rollNumber } }
            ]
        }) + 1;

        const batchRank = await Student.countDocuments({
            isTranscriptVerified: true,
            role: 'student',
            batch: me.batch,
            $or: [
                { cgpa: { $gt: me.cgpa } },
                { cgpa: me.cgpa, rollNumber: { $lt: me.rollNumber } }
            ]
        }) + 1;

        const deptRank = await Student.countDocuments({
            isTranscriptVerified: true,
            role: 'student',
            department: me.department?._id,
            $or: [
                { cgpa: { $gt: me.cgpa } },
                { cgpa: me.cgpa, rollNumber: { $lt: me.rollNumber } }
            ]
        }) + 1;

        const classRank = await Student.countDocuments({
            isTranscriptVerified: true,
            role: 'student',
            program: me.program?._id,
            batch: me.batch,
            $or: [
                { cgpa: { $gt: me.cgpa } },
                { cgpa: me.cgpa, rollNumber: { $lt: me.rollNumber } }
            ]
        }) + 1;

        myRanks = {
            college: collegeRank,
            batch: batchRank,
            department: deptRank,
            class: classRank
        };
    }

    // Retrieve active catalog items for frontend select dropdown filters
    const departments = await Department.find();
    const programs = await Program.find();

    return res.status(200).json({
        success: true,
        message: "Leaderboard loaded successfully.",
        data: {
            leaderboard,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            },
            myRanks,
            filters: {
                departments,
                programs
            }
        }
    });
});
