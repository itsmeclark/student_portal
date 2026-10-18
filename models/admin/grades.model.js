import db from "../../config/db.js";

// Get distinct terms (academic year + semester) that a student has enrollments for
export const getTermsByStudentId = (idNumber, callback) => {
    const sql = `
        SELECT DISTINCT e.Academic_year AS academicYear, e.Semester AS semester
        FROM ENROLLMENTS e
        JOIN STUDENTS st ON st.Student_id = e.Student_id
        WHERE st.Id_number = ?
        ORDER BY e.Academic_year DESC, e.Semester DESC
    `;
    db.query(sql, [idNumber], callback);
};

// Get student info + grades by ID, term, and optional period filter
export const getStudentGrades = (idNumber, academicYear, semester, period, callback) => {
    let sql = `
        SELECT st.Id_number AS idNumber,
               st.First_name AS firstName,
               st.Last_name AS lastName,
               st.Course AS course,
               st.Current_year_level AS yearLevel,
               st.Current_section_num AS section,
               s.Subject_code AS edp,
               s.Subject_name AS name,
               g.Prelim AS prelim,
               g.Midterm AS midterm,
               g.Semifinal AS semifinal,
               g.Final AS final_period,
               g.Grade_id AS gradeId
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

// Save/update grades for a student subject
export const saveGrade = (gradeId, prelim, midterm, semifinal, final, callback) => {
    const sql = `
        UPDATE GRADES
        SET Prelim = ?, Midterm = ?, Semifinal = ?, Final = ?
        WHERE Grade_id = ?
    `;
    db.query(sql, [prelim, midterm, semifinal, final, gradeId], callback);
};
