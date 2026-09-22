import db from "../../config/db.js";

export const getAnnouncements = (callback) => {
    const sql = "SELECT * FROM announcements ORDER BY pinned DESC, created_at DESC";
    db.query(sql, callback);
};

export const getAnnouncementById = (announcement_id, callback) => {
    const sql = "SELECT * FROM announcements WHERE announcement_id = ?";
    db.query(sql, [announcement_id], callback);
};

export const createAnnouncement = (
    { title, content, category, pinned, posted_by, posted_by_label },
    callback
) => {
    const sql = `INSERT INTO announcements
        (title, content, category, pinned, posted_by, posted_by_label)
        VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(
        sql,
        [title, content, category || "General", pinned ? 1 : 0, posted_by, posted_by_label || null],
        callback
    );
};