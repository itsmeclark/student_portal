import {getUser, getEnrolledSubjects, getAnnouncements} from "../../models/students_models/home.model.js";
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