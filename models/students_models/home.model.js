import db from "../../config/db.js";

// NOTE: config/db.js uses "mysql2/promise", so every query here uses async/await.
// Column names match the real database (lowercase). The "AS" names are what the page uses.

// Logged-in student's info (no password is selected)
export const getUser = async (idNumber) => {
    const [rows] = await db.query(
        `SELECT first_name AS First_name,
                last_name  AS Last_name,
                course     AS Course,
                year_level AS Current_year_level,
                id_number  AS Id_number,
                email      AS Email,
                section    AS Section,
                photo_path AS Profile_photo
         FROM STUDENTS
         WHERE id_number = ?`,
        [idNumber]
    );
    return rows;
};

// Enrolled subjects for the student's LATEST enrollment (current semester)
export const getEnrolledSubjects = async (idNumber) => {
    const sql = `
        SELECT s.Subject_id, s.Subject_code, s.Edp_code, s.Subject_name, s.Instructor_name,
               s.Room, s.Schedule_days, s.Start_time, s.End_time
        FROM STUDENTS st
        JOIN ENROLLMENTS e ON e.Student_id = st.student_id
        JOIN ENROLLMENT_SUBJECTS es ON es.Enrollment_id = e.Enrollment_id
        JOIN SUBJECTS s ON s.Subject_id = es.Subject_id
        WHERE st.id_number = ?
          AND e.Enrollment_id = (
              SELECT MAX(e2.Enrollment_id)
              FROM ENROLLMENTS e2
              WHERE e2.Student_id = st.student_id
          )
        ORDER BY s.Subject_code`;
    const [rows] = await db.query(sql, [idNumber]);
    return rows;
};

// Latest published announcements for the student dashboard
export const getAnnouncements = async () => {
    const sql = `
        SELECT Announcement_id, Announcement_title, Announcement_summary, Announcement_description,
               Announcement_category, Announcement_publishby, Announcement_date
        FROM ANNOUNCEMENTS
        WHERE Announcement_status = 'Published'
        ORDER BY Announcement_date DESC
        LIMIT 3`;
    const [rows] = await db.query(sql);
    return rows;
};
