import db from '../../config/db.js'

export const displayStudent = (callback) => {
    const sql = "SELECT * FROM STUDENTS";
    db.query(sql, callback)
}

export const getSections = (callback) => {
    const sql = "SELECT Section_id, Section_num, Section_program FROM SECTIONS ORDER BY Section_id";
    db.query(sql, callback)
}

export const addStudent = (student, enrollment, callback) => {
    db.beginTransaction((err) => {
        if (err) return callback(err);

        // 1. Validate the section exists (server-side, don't trust the client)
        const sectionSql = "SELECT Section_program FROM SECTIONS WHERE Section_id = ?";
        db.query(sectionSql, [enrollment.Section_id], (err, sectionRows) => {
            if (err) return db.rollback(() => callback(err));

            if (sectionRows.length === 0) {
                const notFound = new Error('Invalid section selected');
                notFound.status = 400;
                return db.rollback(() => callback(notFound));
            }
            const sectionProgram = sectionRows[0].Section_program;

            // 2. Insert the student
            const studentSql = `INSERT INTO STUDENTS(
                First_name,
                Last_name,
                Course,
                Current_year_level,
                Id_number,
                Email,
                Current_section_num,
                Student_password,
                Contact_num,
                Current_address,
                Emergency_contact_name,
                Emergency_contact_num,
                Gender
            ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            db.query(studentSql, [
                student.First_name,
                student.Last_name,
                student.Course,
                student.Current_year_level,
                student.Id_number,
                student.Email,
                sectionProgram,
                student.Student_password,
                student.Contact_num,
                student.Current_address,
                student.Emergency_contact_name,
                student.Emergency_contact_num,
                student.Gender
            ], (err, result) => {
                if (err) return db.rollback(() => callback(err));

                const studentId = result.insertId;

                // 3. Insert the linked enrollment row
                const enrollmentSql = `INSERT INTO ENROLLMENTS(
                    Student_id,
                    Section_id,
                    Academic_year,
                    Semester,
                    Year_level,
                    Enrollment_type
                ) VALUES(?, ?, ?, ?, ?, ?)`;

                db.query(enrollmentSql, [
                    studentId,
                    enrollment.Section_id,
                    enrollment.Academic_year,
                    enrollment.Semester,
                    enrollment.Year_level,
                    enrollment.Enrollment_type
                ], (err) => {
                    if (err) return db.rollback(() => callback(err));

                    db.commit((err) => {
                        if (err) return db.rollback(() => callback(err));
                        callback(null, { studentId });
                    });
                });
            });
        });
    });
}
