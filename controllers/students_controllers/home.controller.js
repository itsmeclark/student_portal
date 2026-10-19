import { getUser, getEnrolledSubjects, getAnnouncements } from "../../models/students_models/home.model.js";

// Logged-in student's info (the token decides who it is)
export const getUserController = async (req, res) => {
    try {
        const results = await getUser(req.user.id);
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json({ user: results[0] });
    } catch (err) {
        console.error('Error fetching user info:', err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Enrolled subjects for the logged-in student.
// If the subjects tables are missing or different, the page still loads (just with no subjects).
export const getEnrolledSubjectsController = async (req, res) => {
    try {
        const subjects = await getEnrolledSubjects(req.user.id);
        return res.status(200).json({ subjects });
    } catch (err) {
        console.error('SUBJECTS QUERY FAILED (dashboard shows no subjects):', err.message);
        return res.status(200).json({ subjects: [] });
    }
};

// Latest published announcements
export const getAnnouncementsController = async (req, res) => {
    try {
        const announcements = await getAnnouncements();
        return res.status(200).json({ announcements });
    } catch (err) {
        console.error('ANNOUNCEMENTS QUERY FAILED (dashboard shows none):', err.message);
        return res.status(200).json({ announcements: [] });
    }
};
