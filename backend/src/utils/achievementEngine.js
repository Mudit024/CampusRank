const Notification = require('../models/notification.model');
const Student = require('../models/student.model');
const Result = require('../models/result.model');

/**
 * Evaluates academic records and unlocks qualifying badges.
 * @param {Object} student - Mongoose Student document
 * @param {Array} semesters - Array of parsed semester/result objects
 */
exports.evaluateAchievements = async (student, semesters) => {
    try {
        if (!student.isTranscriptVerified || semesters.length === 0) return;

        const newAchievements = [];
        const existingTitles = student.achievements.map(a => a.title);

        const latestSem = semesters.reduce((max, s) => s.semesterNumber > max.semesterNumber ? s : max, semesters[0]);
        const cgpa = latestSem ? latestSem.cgpa : student.cgpa;

        // 1. Check: Dean's List (CPI >= 8.5)
        if (cgpa >= 8.5 && !existingTitles.includes("Dean's List")) {
            newAchievements.push({
                title: "Dean's List",
                description: "Maintained an elite overall CPI score of 8.5 or higher.",
                icon: "GraduationCap"
            });
        }

        // 2. Check: GPA Pioneer (CPI >= 9.0)
        if (cgpa >= 9.0 && !existingTitles.includes("GPA Pioneer")) {
            newAchievements.push({
                title: "GPA Pioneer",
                description: "Unlocked an outstanding overall CPI score of 9.0 or higher.",
                icon: "Trophy"
            });
        }

        // 3. Check: Perfect Term (Any semester SPI >= 9.5)
        const hasPerfectTerm = semesters.some(s => s.sgpa >= 9.5);
        if (hasPerfectTerm && !existingTitles.includes("Perfect Term")) {
            newAchievements.push({
                title: "Perfect Term",
                description: "Scored a near-perfect or perfect SPI score of 9.5 or higher in any term.",
                icon: "Sparkles"
            });
        }

        // 4. Check: Academic Ascent (SPI increase between semesters)
        let hasAscent = false;
        const sortedSems = [...semesters].sort((a, b) => a.semesterNumber - b.semesterNumber);
        for (let i = 1; i < sortedSems.length; i++) {
            if (sortedSems[i].sgpa > sortedSems[i - 1].sgpa) {
                hasAscent = true;
                break;
            }
        }
        if (hasAscent && !existingTitles.includes("Academic Ascent")) {
            newAchievements.push({
                title: "Academic Ascent",
                description: "Showed outstanding improvement in semester SPI ratings.",
                icon: "TrendingUp"
            });
        }

        // 5. Check: Class Leader (Rank #1 in program class)
        const classRank = await Student.countDocuments({
            isTranscriptVerified: true,
            role: 'student',
            program: student.program,
            batch: student.batch,
            $or: [
                { cgpa: { $gt: student.cgpa } },
                { cgpa: student.cgpa, rollNumber: { $lt: student.rollNumber } }
            ]
        }) + 1;

        if (classRank === 1 && !existingTitles.includes("Class Leader")) {
            newAchievements.push({
                title: "Class Leader",
                description: "Earned the absolute #1 academic rank in your degree class.",
                icon: "Award"
            });
        }

        // Apply newly unlocked achievements
        if (newAchievements.length > 0) {
            student.achievements.push(...newAchievements);
            await student.save();

            // Create alerts in Notification collection
            for (const ach of newAchievements) {
                await Notification.create({
                    student: student._id,
                    title: `🏆 Badge Unlocked: ${ach.title}`,
                    message: `Congratulations! You unlocked the '${ach.title}' achievement: ${ach.description}`,
                    type: "achievement"
                });
            }
            console.log(`Unlocked ${newAchievements.length} achievements for student ${student.name}`);
        }

    } catch (error) {
        console.error("❌ Achievement evaluation failed:", error);
    }
};

/**
 * Runner wrapper called by controllers.
 * @param {ObjectId} studentId - Student identifier
 */
exports.runAchievementEngine = async (studentId) => {
    try {
        const student = await Student.findById(studentId);
        if (!student) return;

        // Map Result document fields to match the engine format
        const results = await Result.find({ student: studentId }).sort({ semester: 1 });
        const semesters = results.map(r => ({
            semesterNumber: r.semester,
            sgpa: r.sgpa,
            cgpa: r.cgpa
        }));

        await exports.evaluateAchievements(student, semesters);
    } catch (error) {
        console.error("❌ Asynchronous achievements run failed:", error);
    }
};
