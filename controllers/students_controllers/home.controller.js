import {getUser, getEnrolledSubjects, getAnnouncements, getStudentProfile, updateStudentPassword} from "../../models/students_models/home.model.js";
import jwt from "jsonwebtoken";

export const getUserController = (req, res) => {
   const decode = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
   const student_id = decode.id;
    getUser(student_id, (err, results) => {
        if (err) {
            console.error('Error fetching user info:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if(results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userInfo = results[0];
        const {Student_password : _, ...userWithoutPassword} = userInfo
        res.status(200).json({ user: userWithoutPassword });
    });
}

// Enrolled subjects for the logged-in student (Id_number comes from the verified JWT,
// so a student can never request someone else's subjects)
export const getEnrolledSubjectsController = (req, res) => {
    const idNumber = req.user.id;
    getEnrolledSubjects(idNumber, (err, results) => {
        if (err) {
            console.error('Error fetching enrolled subjects:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json({ subjects: results });
    });
}

// Latest published announcements
export const getAnnouncementsController = (req, res) => {
    getAnnouncements((err, results) => {
        if (err) {
            console.error('Error fetching announcements:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json({ announcements: results });
    });
}

// Personal info + latest enrollment details of the logged-in student
export const getStudentProfileController = (req, res) => {
    const idNumber = req.user.id;
    getStudentProfile(idNumber, (err, results) => {
        if (err) {
            console.error('Error fetching student profile:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const { Student_password: _, ...student } = results[0];
        const enrollment = {
            Academic_year: student.Academic_year ?? null,
            Semester: student.Semester ?? null,
            Year_level: student.Year_level ?? null,
            Enrollment_type: student.Enrollment_type ?? null
        };

        res.status(200).json({ user: student, enrollment });
    });
}

// Change the logged-in student's password
export const changePasswordController = (req, res) => {
    const idNumber = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Please fill in all the fields.' });
    }

    if (String(newPassword).length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    }

    getUser(idNumber, (err, results) => {
        if (err) {
            console.error('Error fetching user for password change:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const user = results[0];
        if (user.Student_password !== currentPassword) {
            return res.status(401).json({ error: 'Current password is incorrect.' });
        }

        updateStudentPassword(idNumber, newPassword, (err) => {
            if (err) {
                console.error('Error updating password:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.status(200).json({ message: 'Password changed successfully.' });
        });
    });
}