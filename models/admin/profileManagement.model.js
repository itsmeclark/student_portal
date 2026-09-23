import db from '../../config/db.js'

export const displayStudent = (callback) => {
    const sql = "SELECT * FROM STUDENTS";
    db.query(sql, callback)
}

export const getSections = (callback) => {
    const sql = "SELECT Section_id, Section_num, Section_program FROM SECTIONS ORDER BY Section_id";
    db.query(sql, callback)
}

export const getStudentById = (studentId, callback) => {
    const studentSql = "SELECT * FROM STUDENTS WHERE Student_id = ?";
    db.query(studentSql, [studentId], (err, studentRows) => {
        if (err) return callback(err);
        if (studentRows.length === 0) return callback(null, null);

        const enrollmentSql = "SELECT * FROM ENROLLMENTS WHERE Student_id = ? ORDER BY Enrollment_id DESC LIMIT 1";
        db.query(enrollmentSql, [studentId], (err, enrollmentRows) => {
            if (err) return callback(err);
            callback(null, {
                student: studentRows[0],
                enrollment: enrollmentRows.length > 0 ? enrollmentRows[0] : null
            });
        });
    });
}

export const updateStudent = (studentId, student, enrollment, callback) => {
    db.beginTransaction((err) => {
        if (err) return callback(err);

        const sectionSql = "SELECT Section_program FROM SECTIONS WHERE Section_id = ?";
        db.query(sectionSql, [enrollment.Section_id], (err, sectionRows) => {
            if (err) return db.rollback(() => callback(err));

            if (sectionRows.length === 0) {
                const notFound = new Error('Invalid section selected');
                notFound.status = 400;
                return db.rollback(() => callback(notFound));
            }
            const sectionProgram = sectionRows[0].Section_program;

            const studentSql = `UPDATE STUDENTS SET
                First_name = ?,
                Last_name = ?,
                Course = ?,
                Current_year_level = ?,
                Id_number = ?,
                Email = ?,
                Current_section_num = ?,
                Student_password = ?,
                Contact_num = ?,
                Current_address = ?,
                Emergency_contact_name = ?,
                Emergency_contact_num = ?,
                Gender = ?,
                Status = ?
            WHERE Student_id = ?`;

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
                student.Gender,
                student.Status,
                studentId
            ], (err, result) => {
                if (err) return db.rollback(() => callback(err));

                if (result.affectedRows === 0) {
                    const notFound = new Error('Student not found');
                    notFound.status = 404;
                    return db.rollback(() => callback(notFound));
                }

                const existingSql = "SELECT Enrollment_id FROM ENROLLMENTS WHERE Student_id = ? ORDER BY Enrollment_id DESC LIMIT 1";
                db.query(existingSql, [studentId], (err, rows) => {
                    if (err) return db.rollback(() => callback(err));

                    const done = (err) => {
                        if (err) return db.rollback(() => callback(err));
                        db.commit((err) => {
                            if (err) return db.rollback(() => callback(err));
                            callback(null, { studentId: Number(studentId) });
                        });
                    };

                    if (rows.length > 0) {
                        const updateSql = `UPDATE ENROLLMENTS SET
                            Section_id = ?,
                            Academic_year = ?,
                            Semester = ?,
                            Year_level = ?,
                            Enrollment_type = ?
                        WHERE Enrollment_id = ?`;
                        db.query(updateSql, [
                            enrollment.Section_id,
                            enrollment.Academic_year,
                            enrollment.Semester,
                            enrollment.Year_level,
                            enrollment.Enrollment_type,
                            rows[0].Enrollment_id
                        ], done);
                    } else {
                        const insertSql = `INSERT INTO ENROLLMENTS(
                            Student_id,
                            Section_id,
                            Academic_year,
                            Semester,
                            Year_level,
                            Enrollment_type
                        ) VALUES(?, ?, ?, ?, ?, ?)`;
                        db.query(insertSql, [
                            studentId,
                            enrollment.Section_id,
                            enrollment.Academic_year,
                            enrollment.Semester,
                            enrollment.Year_level,
                            enrollment.Enrollment_type
                        ], done);
                    }
                });
            });
        });
    });
}

export const deleteStudent = (studentId, callback) => {
    const sql = "DELETE FROM STUDENTS WHERE Student_id = ?";
    db.query(sql, [studentId], (err, result) => {
        if (err) return callback(err);
        callback(null, { affectedRows: result.affectedRows });
    });
}

export const addStudent = (student, enrollment, callback) => {
    db.beginTransaction((err) => {
        if (err) return callback(err);

        const sectionSql = "SELECT Section_program FROM SECTIONS WHERE Section_id = ?";
        db.query(sectionSql, [enrollment.Section_id], (err, sectionRows) => {
            if (err) return db.rollback(() => callback(err));

            if (sectionRows.length === 0) {
                const notFound = new Error('Invalid section selected');
                notFound.status = 400;
                return db.rollback(() => callback(notFound));
            }
            const sectionProgram = sectionRows[0].Section_program;

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
