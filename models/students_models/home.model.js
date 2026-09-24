import db from "../../config/db.js";
//QUERIES
//GET USER INFO: SELECT * from students WHERE studentID = ?

export const getUser = (student_id,callback) => {
    const sql = "SELECT * from STUDENTS WHERE Id_number = ?";
    db.query(sql, [student_id], callback);
}

// Enrolled subjects for the student's LATEST enrollment (current semester),
// resolved from Id_number (that's what's stored in the JWT)
export const getEnrolledSubjects = (idNumber, callback) => {
    const sql = `
        SELECT s.Subject_id, s.Subject_code, s.Edp_code, s.Subject_name, s.Instructor_name,
               s.Room, s.Schedule_days, s.Start_time, s.End_time
        FROM STUDENTS st
        JOIN ENROLLMENTS e ON e.Student_id = st.Student_id
        JOIN ENROLLMENT_SUBJECTS es ON es.Enrollment_id = e.Enrollment_id
        JOIN SUBJECTS s ON s.Subject_id = es.Subject_id
        WHERE st.Id_number = ?
          AND e.Enrollment_id = (
              SELECT MAX(e2.Enrollment_id)
              FROM ENROLLMENTS e2
              WHERE e2.Student_id = st.Student_id
          )
        ORDER BY s.Subject_code`;
    db.query(sql, [idNumber], callback);
}

// Latest published announcements for the student dashboard
export const getAnnouncements = (callback) => {
    const sql = `
        SELECT Announcement_id, Announcement_title, Announcement_summary, Announcement_description,
               Announcement_category, Announcement_publishby, Announcement_date
        FROM ANNOUNCEMENTS
        WHERE Announcement_status = 'Published'
        ORDER BY Announcement_date DESC
        LIMIT 3`;
    db.query(sql, callback);
}
