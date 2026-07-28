const { PDFParse } = require('pdf-parse');

const romanToNum = (roman) => {
    const map = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8 };
    return map[roman.toLowerCase()] || 0;
};

/**
 * Parses raw text from transcript PDF buffer and extracts academic structured JSON.
 * Tailored specifically to MNNIT Allahabad web-generated transcripts.
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
        const nameMatch = text.match(/Name\s*:\s*([^\r\n]+)/i);
        const rollMatch = text.match(/Registration\s*No\s*:\s*([^\r\n]+)/i) || text.match(/Roll\s*(?:Number|No):\s*([^\r\n]+)/i);
        const degreeMatch = text.match(/Degree\s*:\s*([^\r\n]+)/i) || text.match(/Program:\s*([^\r\n]+)/i);
        const branchMatch = text.match(/Branch\s*:\s*([^\r\n]+)/i) || text.match(/Department:\s*([^\r\n]+)/i);

        if (!nameMatch || !rollMatch || !degreeMatch || !branchMatch) {
            throw new Error("Missing mandatory transcript identifiers (Name, Registration No, Degree, or Branch).");
        }

        const name = nameMatch[1].trim();
        const rollNumber = rollMatch[1].trim().toUpperCase();
        
        // Maps Master of Computer Applications -> MCA
        let programCode = degreeMatch[1].trim();
        if (programCode.toLowerCase().includes("computer applications")) {
            programCode = "MCA";
        } else {
            programCode = programCode.split(/\s+/).map(w => w[0]).join("").toUpperCase();
        }

        // Maps Branch (Not Applicable -> CA or CSE)
        let deptCode = branchMatch[1].trim().toUpperCase();
        if (deptCode === "NOT APPLICABLE" || deptCode === "N/A" || deptCode === "") {
            deptCode = programCode === "MCA" ? "CA" : "CSE";
        }

        // Extract batch from registration number (e.g. 2024CA057 -> Batch 2024)
        const rollYearMatch = rollNumber.match(/^(20\d{2})/);
        const batch = rollYearMatch ? parseInt(rollYearMatch[1]) : new Date().getFullYear() - 3;

        // 2. Parse Bottom CPI Table (Cumulative Performance Index)
        const cpiValues = [];
        const cpiTableMatch = text.match(/CPI\s+([\d.\s]+)/i);
        if (cpiTableMatch) {
            const numbers = cpiTableMatch[1].trim().split(/\s+/).map(parseFloat).filter(n => !isNaN(n));
            cpiValues.push(...numbers);
        }

        // 3. Parse Semesters Performance Index (SPI)
        const regex = /([IVXLC]+)\s+semester/gi;
        const indices = [];
        let match;
        
        while ((match = regex.exec(text)) !== null) {
            indices.push({
                roman: match[1],
                index: match.index
            });
        }

        const semesters = [];

        for (let i = 0; i < indices.length; i++) {
            const current = indices[i];
            const nextIndex = indices[i + 1] ? indices[i + 1].index : text.length;
            const block = text.slice(current.index, nextIndex);
            const semesterNumber = romanToNum(current.roman);

            if (semesterNumber === 0) continue;

            // Extract SPI for this semester
            const spiMatch = block.match(/SPI\s*([\d.]+)/i);
            if (!spiMatch) continue;
            const sgpa = parseFloat(spiMatch[1]);

            // Map CPI from bottom CPI table list
            const cgpa = cpiValues[semesterNumber - 1] !== undefined ? cpiValues[semesterNumber - 1] : sgpa;

            semesters.push({
                semesterNumber,
                sgpa,
                cgpa,
                subjects: [] // Bypassed subject information as requested
            });
        }

        if (semesters.length === 0) {
            throw new Error("No semesters or GPA records (SPI/CPI) could be parsed from the transcript.");
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
