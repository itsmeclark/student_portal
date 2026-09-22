import {
    getAnnouncements,
    getAnnouncementById,
    createAnnouncement,
} from "../../models/students_models/announcement.model.js";
import jwt from "jsonwebtoken";

export const getAnnouncementsController = (req, res) => {
    getAnnouncements((err, results) => {
        if (err) {
            console.error("Error fetching announcements:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.status(200).json({ announcements: results });
    });
};

export const getAnnouncementByIdController = (req, res) => {
    const { id } = req.params;

    getAnnouncementById(id, (err, results) => {
        if (err) {
            console.error("Error fetching announcement:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: "Announcement not found" });
        }
        res.status(200).json({ announcement: results[0] });
    });
};

export const createAnnouncementController = (req, res) => {
    const decode = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    const student_id = decode.id;
    const { title, content, category, pinned, posted_by_label } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required" });
    }

    createAnnouncement(
        { title, content, category, pinned, posted_by: student_id, posted_by_label },
        (err, results) => {
            if (err) {
                console.error("Error creating announcement:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
            res.status(201).json({ message: "Announcement created successfully" });
        }
    );
};