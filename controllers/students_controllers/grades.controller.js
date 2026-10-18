import { getGrades, getTerms, parseTermKey } from "../../models/students_models/grades.model.js";

export const getGradesController = (req, res) => {
    const idNumber = req.user.id;
    const termKey = req.query.term;
    const period = req.query.period || "All";

    if (!termKey) {
        return res.status(400).json({ error: "Term parameter is required" });
    }

    const { academicYear, semester } = parseTermKey(termKey);

    getGrades(idNumber, academicYear, semester, period, (err, results) => {
        if (err) {
            console.error("Error fetching grades:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (results.length === 0) {
            return res.status(200).json({
                idNumber: null,
                firstName: null,
                lastName: null,
                section: null,
                yearLevel: null,
                subjects: []
            });
        }

        // All subjects share the same student info, section, and year level
        const row = results[0];
        const idNumberVal = row.idNumber;
        const firstName = row.firstName;
        const lastName = row.lastName;
        const section = row.section;
        const yearLevel = row.yearLevel;

        const subjects = results.map((r) => ({
            edp: r.edp,
            name: r.name,
            prelim: r.prelim,
            midterm: r.midterm,
            semifinal: r.semifinal,
            final_period: r.final_period
        }));

        res.status(200).json({
            idNumber: idNumberVal,
            firstName,
            lastName,
            section,
            yearLevel,
            subjects
        });
    });
};

export const getTermsController = (req, res) => {
    const idNumber = req.user.id;

    getTerms(idNumber, (err, results) => {
        if (err) {
            console.error("Error fetching terms:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        // Convert each enrollment term into a term key like "2026-1"
        const terms = results.map((row) => {
            const startYear = row.academicYear.split("-")[0]; // "2026-2027" -> "2026"
            const semesterNum = row.semester === "1st Semester" ? "1" : "2";
            return {
                termKey: `${startYear}-${semesterNum}`,
                label: `${row.semester} A.Y. ${row.academicYear}`
            };
        });

        res.status(200).json({ terms });
    });
};
