import db from "../../config/db.js";

export const getAdminName = (admin_name, callback) => {
    const sql = "SELECT * FROM ADMIN WHERE Admin_name = ?";
    db.query(sql, [admin_name], callback)
}

// Overall student numbers + gender/status breakdown (used by the dashboard stat cards)
export const getStudentTotals = (callback) => {
    const sql = `
        SELECT
            COUNT(*) AS totalStudents,
            COALESCE(SUM(Status = 'ACTIVE'), 0) AS activeStudents,
            COALESCE(SUM(Status = 'INACTIVE'), 0) AS inactiveStudents,
            COALESCE(SUM(Status = 'DROPOUT'), 0) AS dropoutStudents,
            COALESCE(SUM(Gender = 'MALE'), 0) AS maleStudents,
            COALESCE(SUM(Gender = 'FEMALE'), 0) AS femaleStudents
        FROM STUDENTS`;
    db.query(sql, callback)
}

// Students grouped by course, split by gender and status
export const getStudentsByCourse = (callback) => {
    const sql = `
        SELECT Course,
               COUNT(*) AS totalStudents,
               COALESCE(SUM(Gender = 'MALE'), 0) AS maleStudents,
               COALESCE(SUM(Gender = 'FEMALE'), 0) AS femaleStudents,
               COALESCE(SUM(Status = 'ACTIVE'), 0) AS activeStudents
        FROM STUDENTS
        GROUP BY Course
        ORDER BY Course`;
    db.query(sql, callback)
}

// Latest published announcements (the dashboard shows them as upcoming events)
export const getPublishedAnnouncements = (callback) => {
    const sql = `
        SELECT Announcement_title AS title,
               Announcement_summary AS summary,
               Announcement_category AS category,
               Announcement_publishby AS publishBy,
               Announcement_date AS date
        FROM ANNOUNCEMENTS
        WHERE Announcement_status = 'Published'
        ORDER BY Announcement_date DESC
        LIMIT 5`;
    db.query(sql, callback)
}

// Institution wide counts: sections, subjects and students enrolled in the latest term
export const getInstitutionCounts = (callback) => {
    const sql = `
        SELECT
            (SELECT COUNT(*) FROM SECTIONS) AS sectionCount,
            (SELECT COUNT(*) FROM SUBJECTS) AS subjectCount,
            (SELECT COUNT(*)
               FROM ENROLLMENTS e
              WHERE e.Academic_year = (SELECT Academic_year FROM ENROLLMENTS ORDER BY Academic_year DESC LIMIT 1)
                AND e.Semester = (SELECT Semester FROM ENROLLMENTS ORDER BY Academic_year DESC, Semester DESC LIMIT 1)
            ) AS enrolledThisTerm`;
    db.query(sql, callback)
}
