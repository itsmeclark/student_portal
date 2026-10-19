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

// Get student info + grades by ID and term.
// LEFT JOIN on GRADES so every subject the student is enrolled in shows up,
// even when no grade has been recorded for it yet.
export const getStudentGrades = (idNumber, academicYear, semester, callback) => {
    const sql = `
        SELECT st.Id_number AS idNumber,
               st.First_name AS firstName,
               st.Last_name AS lastName,
               st.Course AS course,
               st.Current_year_level AS yearLevel,
               st.Current_section_num AS section,
               s.Subject_id AS subjectId,
               s.Subject_code AS edp,
               s.Subject_name AS name,
               es.Enrollments_subject_id AS enrollmentsSubjectId,
               g.Prelim AS prelim,
               g.Midterm AS midterm,
               g.Semifinal AS semifinal,
               g.Final AS final_period,
               g.Grade_id AS gradeId
        FROM STUDENTS st
        JOIN ENROLLMENTS e ON e.Student_id = st.Student_id
        JOIN ENROLLMENT_SUBJECTS es ON es.Enrollment_id = e.Enrollment_id
        JOIN SUBJECTS s ON s.Subject_id = es.Subject_id
        LEFT JOIN GRADES g ON g.Enrollments_subject_id = es.Enrollments_subject_id
        WHERE st.Id_number = ?
          AND e.Academic_year = ?
          AND e.Semester = ?
        ORDER BY s.Subject_code
    `;

    db.query(sql, [idNumber, academicYear, semester], callback);
};

// Verify a subject enrollment exists before writing a grade for it
export const enrollmentSubjectExists = (enrollmentsSubjectId, callback) => {
    const sql = `SELECT Enrollments_subject_id FROM ENROLLMENT_SUBJECTS WHERE Enrollments_subject_id = ?`;
    db.query(sql, [enrollmentsSubjectId], (err, rows) => {
        if (err) return callback(err);
        callback(null, rows.length > 0);
    });
};

// Save grades for a student subject.
// Updates the existing GRADES row, or creates one when the subject has no grade yet.
// GRADES.Enrollments_subject_id has a UNIQUE key, so a subject can only have one grade row.
export const upsertGrade = (enrollmentsSubjectId, prelim, midterm, semifinal, final, callback) => {
    const updateSql = `
        UPDATE GRADES
        SET Prelim = ?, Midterm = ?, Semifinal = ?, Final = ?
        WHERE Enrollments_subject_id = ?
    `;

    db.query(updateSql, [prelim, midterm, semifinal, final, enrollmentsSubjectId], (err, result) => {
        if (err) return callback(err);

        if (result.affectedRows > 0) {
            return callback(null, { created: false });
        }

        const insertSql = `
            INSERT INTO GRADES (Enrollments_subject_id, Prelim, Midterm, Semifinal, Final)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(insertSql, [enrollmentsSubjectId, prelim, midterm, semifinal, final], (insertErr, insertResult) => {
            if (insertErr) return callback(insertErr);
            callback(null, { created: true, gradeId: insertResult.insertId });
        });
    });
};
