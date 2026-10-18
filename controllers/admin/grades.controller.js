import { getTermsByStudentId, getStudentGrades, saveGrade } from "../../models/admin/grades.model.js";
import { parseTermKey } from "../../models/students_models/grades.model.js";

// Get terms available for a student ID
export const getTermsController = (req, res) => {
    const idNumber = req.query.idNumber;

    if (!idNumber) {
        return res.status(400).json({ error: "idNumber parameter is required" });
    }

    getTermsByStudentId(idNumber, (err, results) => {
        if (err) {
            console.error("Error fetching terms:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        const terms = results.map((row) => {
            const startYear = row.academicYear.split("-")[0];
            const semesterNum = row.semester === "1st Semester" ? "1" : "2";
            return {
                termKey: `${startYear}-${semesterNum}`,
                label: `${row.semester} A.Y. ${row.academicYear}`
            };
        });

        res.status(200).json({ terms });
    });
};

// Get student info + grades by ID, term, and optional period
export const getStudentGradesController = (req, res) => {
    const idNumber = req.query.idNumber;
    const termKey = req.query.term;
    const period = req.query.period || "All";

    if (!idNumber) {
        return res.status(400).json({ error: "idNumber parameter is required" });
    }
    if (!termKey) {
        return res.status(400).json({ error: "term parameter is required" });
    }

    const { academicYear, semester } = parseTermKey(termKey);

    getStudentGrades(idNumber, academicYear, semester, period, (err, results) => {
        if (err) {
            console.error("Error fetching student grades:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (results.length === 0) {
            return res.status(200).json({
                idNumber: null,
                firstName: null,
                lastName: null,
                course: null,
                yearLevel: null,
                section: null,
                subjects: []
            });
        }

        const row = results[0];
        const subjects = results.map((r) => ({
            gradeId: r.gradeId,
            edp: r.edp,
            name: r.name,
            prelim: r.prelim,
            midterm: r.midterm,
            semifinal: r.semifinal,
            final_period: r.final_period
        }));

        res.status(200).json({
            idNumber: row.idNumber,
            firstName: row.firstName,
            lastName: row.lastName,
            course: row.course,
            yearLevel: row.yearLevel,
            section: row.section,
            subjects
        });
    });
};

// Save/update grades
export const saveGradeController = (req, res) => {
    const { gradeId, prelim, midterm, semifinal, final } = req.body;

    if (!gradeId) {
        return res.status(400).json({ error: "gradeId is required" });
    }

    saveGrade(gradeId, prelim, midterm, semifinal, final, (err) => {
        if (err) {
            console.error("Error saving grade:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        res.status(200).json({ message: "Grade saved successfully" });
    });
};
