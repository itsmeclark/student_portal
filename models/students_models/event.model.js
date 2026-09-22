import db from "../../config/db.js";

export const getEvents = (callback) => {
    const sql = "SELECT * FROM events ORDER BY event_date ASC";
    db.query(sql, callback);
};

export const getEventsByMonth = (year, month, callback) => {
    const sql = `SELECT * FROM events
        WHERE YEAR(event_date) = ? AND MONTH(event_date) = ?
        ORDER BY event_date ASC`;
    db.query(sql, [year, month], callback);
};

export const createEvent = (
    { title, category, event_date, start_time, end_time, all_day, location, posted_by },
    callback
) => {
    const sql = `INSERT INTO events
        (title, category, event_date, start_time, end_time, all_day, location, posted_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(
        sql,
        [title, category || "Event", event_date, start_time || null, end_time || null, all_day ? 1 : 0, location || null, posted_by],
        callback
    );
};