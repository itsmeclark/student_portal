import db from "../../config/db.js";

// Parse a term key like "2026-1" into academic year and semester
// "2026-1" -> Academic_year: "2026-2027", Semester: "1st Semester"
// "2025-2" -> Academic_year: "2025-2026", Semester: "2nd Semester"
export function parseTermKey(termKey) {
    const [startYear, semesterNum] = termKey.split("-");
    const academicYear = `${startYear}-${Number(startYear) + 1}`;
    const semester = semesterNum === "1" ? "1st Semester" : "2nd Semester";
    return { academicYear, semester };
}

// Get grades for a student by term and optional period filter
export const getGrades = (idNumber, academicYear, semester, period, callback) => {
    let sql = `
        SELECT s.Subject_code AS edp,
               s.Subject_name AS name,
               g.Prelim AS prelim,
               g.Midterm AS midterm,
               g.Semifinal AS semifinal,
               g.Final AS final_period,
               e.Section_id AS section,
               e.Year_level AS yearLevel,
               st.Id_number AS idNumber,
               st.First_name AS firstName,
               st.Last_name AS lastName
        FROM STUDENTS st
        JOIN ENROLLMENTS e ON e.Student_id = st.Student_id
        JOIN ENROLLMENT_SUBJECTS es ON es.Enrollment_id = e.Enrollment_id
        JOIN SUBJECTS s ON s.Subject_id = es.Subject_id
        JOIN GRADES g ON g.Enrollments_subject_id = es.Enrollments_subject_id
        WHERE st.Id_number = ?
          AND e.Academic_year = ?
          AND e.Semester = ?
    `;
    const params = [idNumber, academicYear, semester];

    if (period && period !== "All") {
        const periodMap = {
            Prelim: "g.Prelim",
            Midterm: "g.Midterm",
            Semifinal: "g.Semifinal",
            Final: "g.Final"
        };
        sql += ` AND ${periodMap[period]} IS NOT NULL`;
    }

    sql += ` ORDER BY s.Subject_code`;

    db.query(sql, params, callback);
};

// Get distinct terms (academic year + semester) that a student has enrollments for
export const getTerms = (idNumber, callback) => {
    const sql = `
        SELECT DISTINCT e.Academic_year AS academicYear, e.Semester AS semester
        FROM ENROLLMENTS e
        JOIN STUDENTS st ON st.Student_id = e.Student_id
        WHERE st.Id_number = ?
        ORDER BY e.Academic_year DESC, e.Semester DESC
    `;
    db.query(sql, [idNumber], callback);
};
