const { PDFParse } = require('pdf-parse');

/**
 * Maps letter grades to standard university grade points (10-point scale)
 */
const getGradePoints = (grade) => {
    const scale = {
        'O': 10,
        'A+': 10,
        'A': 9,
        'B+': 8,
        'B': 7,
        'C': 6,
        'D': 5,
        'P': 4,
        'E': 4,
        'F': 0
    };
    const cleanedGrade = grade.toUpperCase().trim();
    return scale[cleanedGrade] !== undefined ? scale[cleanedGrade] : 0;
};

/**
 * Parses raw text from transcript PDF buffer and extracts academic structured JSON.
 * @param {Buffer} pdfBuffer - File buffer from Multer
 */
const parseTranscriptPDF = async (pdfBuffer) => {
    try {
        const parser = new PDFParse({ data: pdfBuffer });
        const data = await parser.getText();
        const text = data.text;

        if (!text || text.trim() === "") {
            throw new Error("Parsed PDF content is empty or unreadable.");
        }

        // 1. Parse Metadata using regular expressions
        const nameMatch = text.match(/Name:\s*([^\r\n|]+)/i) || text.match(/Student\s*Name:\s*([^\r\n|]+)/i);
        const rollMatch = text.match(/Roll\s*(?:Number|No):\s*([^\r\n|]+)/i) || text.match(/Enrollment\s*(?:Number|No):\s*([^\r\n|]+)/i);
        const programMatch = text.match(/Program:\s*([^\r\n|]+)/i);
        const deptMatch = text.match(/Department:\s*([^\r\n|]+)/i) || text.match(/Branch:\s*([^\r\n|]+)/i);
        const batchMatch = text.match(/Batch:\s*(\d{4})/i);

        if (!nameMatch || !rollMatch || !programMatch || !deptMatch) {
            throw new Error("Missing mandatory transcript identifiers (Name, Roll Number, Program, or Department).");
        }

        const name = nameMatch[1].trim();
        const rollNumber = rollMatch[1].trim().toUpperCase();
        const programCode = programMatch[1].trim().toUpperCase();
        const deptCode = deptMatch[1].trim().toUpperCase();
        const batch = batchMatch ? parseInt(batchMatch[1]) : null;

        // 2. Parse Semesters
        // We split the document text on instances of "Semester:" keyword
        const semesterBlocks = text.split(/Semester:\s*/i);
        const semesters = [];

        // Index 0 represents text BEFORE the first "Semester:" (general headers/metadata), so we start at 1
        for (let i = 1; i < semesterBlocks.length; i++) {
            const block = semesterBlocks[i];

            // Extract semester number (should be leading digits)
            const semNumMatch = block.match(/^(\d+)/);
            if (!semNumMatch) continue;
            const semesterNumber = parseInt(semNumMatch[1]);

            // Extract SGPA & CGPA
            const sgpaMatch = block.match(/SGPA:\s*([0-9.]+)/i);
            const cgpaMatch = block.match(/CGPA:\s*([0-9.]+)/i);

            if (!sgpaMatch || !cgpaMatch) continue;

            const sgpa = parseFloat(sgpaMatch[1]);
            const cgpa = parseFloat(cgpaMatch[1]);

            // Extract subjects for this semester
            // Standard format: SubjectCode | SubjectName | Grade | Credits
            const subjects = [];
            const lines = block.split('\n');
            let isParsingSubjects = false;

            for (const line of lines) {
                const lowerLine = line.toLowerCase().trim();
                
                if (lowerLine.includes('subjects:')) {
                    isParsingSubjects = true;
                    continue;
                }

                // Stop scanning subjects if we transition to a different block
                if (lowerLine.includes('semester:')) {
                    break;
                }

                if (isParsingSubjects) {
                    const parts = line.split('|');
                    if (parts.length >= 4) {
                        const subjectCode = parts[0].trim().toUpperCase();
                        const subjectName = parts[1].trim();
                        const grade = parts[2].trim().toUpperCase();
                        const credits = parseInt(parts[3].trim());

                        if (subjectCode && subjectName && grade && !isNaN(credits)) {
                            subjects.push({
                                subjectCode,
                                subjectName,
                                grade,
                                credits,
                                gradePoints: getGradePoints(grade)
                            });
                        }
                    }
                }
            }

            semesters.push({
                semesterNumber,
                sgpa,
                cgpa,
                subjects
            });
        }

        if (semesters.length === 0) {
            throw new Error("No semesters or GPA records could be parsed from the transcript.");
        }

        return {
            name,
            rollNumber,
            programCode,
            deptCode,
            batch,
            semesters
        };

    } catch (error) {
        console.error("❌ PDF extraction failure: ", error);
        throw new Error(error.message || "Failed to parse academic record PDF.");
    }
};

module.exports = { parseTranscriptPDF };
