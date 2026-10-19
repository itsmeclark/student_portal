import { getTermsByStudentId, getStudentGrades, upsertGrade, enrollmentSubjectExists } from "../../models/admin/grades.model.js";
import { parseTermKey } from "../../models/students_models/grades.model.js";

// Validate a single grading period value.
// Blank means "no grade yet" (stored as NULL), otherwise it must be a number in the 1.0 - 5.0 scale.
const parseGrade = (value) => {
    if (value === undefined || value === null || String(value).trim() === "") {
        return { value: null };
    }

    const num = Number(value);
    if (Number.isNaN(num)) {
        return { error: `"${value}" is not a valid grade. Use a number between 1.0 and 5.0, or leave it blank.` };
    }
    if (num < 1.0 || num > 5.0) {
        return { error: `Grade ${num} is out of range. Use a number between 1.0 and 5.0.` };
    }

    return { value: num };
};

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

// Get student info + grades by ID and term
export const getStudentGradesController = (req, res) => {
    const idNumber = req.query.idNumber;
    const termKey = req.query.term;

    if (!idNumber) {
        return res.status(400).json({ error: "idNumber parameter is required" });
    }
    if (!termKey) {
        return res.status(400).json({ error: "term parameter is required" });
    }

    const { academicYear, semester } = parseTermKey(termKey);

    getStudentGrades(idNumber, academicYear, semester, (err, results) => {
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
            enrollmentsSubjectId: r.enrollmentsSubjectId,
            subjectId: r.subjectId,
            hasGrade: r.gradeId !== null,
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

// Save/update grades for one subject of a student
export const saveGradeController = (req, res) => {
    const { enrollmentsSubjectId, prelim, midterm, semifinal, final } = req.body;

    if (!enrollmentsSubjectId) {
        return res.status(400).json({ error: "enrollmentsSubjectId is required" });
    }

    const parsed = {
        prelim: parseGrade(prelim),
        midterm: parseGrade(midterm),
        semifinal: parseGrade(semifinal),
        final: parseGrade(final)
    };

    for (const key of Object.keys(parsed)) {
        if (parsed[key].error) {
            return res.status(400).json({ error: parsed[key].error });
        }
    }

    enrollmentSubjectExists(enrollmentsSubjectId, (existsErr, exists) => {
        if (existsErr) {
            console.error("Error checking subject enrollment:", existsErr);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (!exists) {
            return res.status(404).json({ error: "Subject not found for this student." });
        }

        upsertGrade(
            enrollmentsSubjectId,
            parsed.prelim.value,
            parsed.midterm.value,
            parsed.semifinal.value,
            parsed.final.value,
            (err, result) => {
                if (err) {
                    console.error("Error saving grade:", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }

                res.status(200).json({
                    message: "Grade saved successfully",
                    created: result.created
                });
            }
        );
    });
};
