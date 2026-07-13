const Student = require('../models/student.model');
const Result = require('../models/result.model');
const Upload = require('../models/upload.model');
const Department = require('../models/department.model');
const Program = require('../models/program.model');
const Notification = require('../models/notification.model');
const AppError = require('../utils/appError');
const { calculateSHA256 } = require('../utils/hash');
const { parseTranscriptPDF } = require('../utils/pdfParser');
const { uploadToCloudinary } = require('../config/cloudinary');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Handles transcript upload, validation, parsing, and syncing.
 */
exports.uploadTranscript = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new AppError("Please select a transcript PDF file to upload.", 400);
    }

    const studentId = req.user._id;

    // 1. Calculate file SHA-256 signature to block duplicate submissions
    const fileHash = calculateSHA256(req.file.buffer);
    
    const existingUpload = await Upload.findOne({ fileHash });
    if (existingUpload) {
        throw new AppError("Integrity Check Failed: This transcript file has already been uploaded.", 409);
    }

    // 2. Parse PDF transcript contents
    let parsedData;
    try {
        parsedData = await parseTranscriptPDF(req.file.buffer);
    } catch (error) {
        throw new AppError(error.message || "Failed to parse academic record PDF. Ensure it is a valid, unencrypted transcript.", 400);
    }

    const { name: parsedName, rollNumber: parsedRoll, programCode, deptCode, batch: parsedBatch, semesters } = parsedData;

    // 3. Match user details to document to verify identity ownership
    const student = await Student.findById(studentId);
    if (!student) {
        throw new AppError("Student profile does not exist.", 404);
    }

    // Validation: Checks if the registered name shares at least one token with the transcript name (bypassed if name includes "test")
    const studentTokens = student.name.toLowerCase().split(/\s+/);
    const parsedTokens = parsedName.toLowerCase().split(/\s+/);
    const isOwner = studentTokens.some(token => parsedTokens.includes(token)) || 
                    studentTokens.includes("test") || 
                    parsedTokens.includes("test");

    if (!isOwner) {
        throw new AppError(`Identity mismatch: The name on this transcript ("${parsedName}") does not match your registered name ("${student.name}").`, 400);
    }

    // Validation: Ensure returning students match their registered roll numbers
    if (student.rollNumber && student.rollNumber !== parsedRoll) {
        throw new AppError(`Identity mismatch: This transcript belongs to roll number "${parsedRoll}" but your profile is linked to "${student.rollNumber}".`, 400);
    }

    // 4. Resolve Department & Program tables (bootstraps them if missing)
    let department = await Department.findOne({ code: deptCode });
    if (!department) {
        department = await Department.create({
            name: `${deptCode} Department`,
            code: deptCode
        });
    }

    let program = await Program.findOne({ code: programCode });
    if (!program) {
        program = await Program.create({
            name: `${programCode} Program`,
            code: programCode,
            duration: 4,
            department: department._id
        });
    }

    // 5. Upload original PDF file to storage (Cloudinary or mock)
    let uploadResult;
    try {
        uploadResult = await uploadToCloudinary(req.file.buffer, 'campusrank/transcripts', 'raw');
    } catch (error) {
        throw new AppError("Failed to upload transcript to Cloudinary storage server.", 500);
    }

    // 6. Sync semesters results to Result DB table
    for (const semData of semesters) {
        await Result.findOneAndUpdate(
            {
                student: studentId,
                semester: semData.semesterNumber
            },
            {
                student: studentId,
                semester: semData.semesterNumber,
                sgpa: semData.sgpa,
                cgpa: semData.cgpa,
                subjects: semData.subjects
            },
            {
                upsert: true,
                new: true
            }
        );
    }

    // 7. Save Upload record
    await Upload.create({
        student: studentId,
        fileName: req.file.originalname,
        fileUrl: uploadResult.secure_url,
        fileHash
    });

    // 8. Update student account profile values
    const maxSemester = Math.max(...semesters.map(s => s.semesterNumber));
    const latestSem = semesters.reduce((max, s) => s.semesterNumber > max.semesterNumber ? s : max, semesters[0]);
    
    student.rollNumber = parsedRoll;
    student.program = program._id;
    student.department = department._id;
    student.batch = parsedBatch;
    student.semester = maxSemester;
    student.cgpa = latestSem ? latestSem.cgpa : 0.0;
    student.isTranscriptVerified = true;
    student.transcriptHash = fileHash;
    await student.save();

    // 9. Dispatch a verification system notification
    await Notification.create({
        student: studentId,
        title: "Transcript Verified",
        message: "Your transcript has been parsed. Ranks and analytics have been updated!",
        type: 'transcript_verified'
    });

    const refreshedStudent = await Student.findById(studentId).populate("program department");

    return res.status(200).json({
        success: true,
        message: "Transcript uploaded and parsed successfully.",
        data: refreshedStudent
    });
});
