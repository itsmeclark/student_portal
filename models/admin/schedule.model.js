import db from "../../config/db.js";

// ==========================================================
// CLASS SCHEDULE MODEL
// A schedule row IS a SUBJECTS row: subject, instructor, room,
// meeting days and time, plus the section it is offered to.
// ==========================================================

// The database stores the meeting days as letters (e.g. "MWF", "TTH").
// T is Tuesday and H is Thursday, the same convention the student
// class schedule uses.
export const DAY_CODES = ["M", "T", "W", "H", "F", "S"];

export const DAY_NAMES = {
    M: "MONDAY",
    T: "TUESDAY",
    W: "WEDNESDAY",
    H: "THURSDAY",
    F: "FRIDAY",
    S: "SATURDAY"
};

// "MWF" -> ["M", "W", "F"] (canonical order, duplicates removed)
export function parseDays(value) {
    const text = String(value || "").toUpperCase();
    const letters = text.split("").filter((char) => DAY_CODES.includes(char));
    return DAY_CODES.filter((code) => letters.includes(code));
}

// "MWF" -> "MONDAY / WEDNESDAY / FRIDAY"
export function formatDays(value) {
    return parseDays(value).map((code) => DAY_NAMES[code]).join(" / ");
}

// Do the two day sets share at least one day?
export function daysOverlap(a, b) {
    const left = parseDays(a);
    const right = parseDays(b);
    return left.some((code) => right.includes(code));
}

// "08:00" -> 480 (minutes since midnight)
export function timeToMinutes(value) {
    const match = String(value || "").trim().match(/^(\d{1,2}):([0-5]\d)$/);
    if (!match) return null;

    const hour = Number(match[1]);
    if (hour > 23) return null;

    return hour * 60 + Number(match[2]);
}

// Two ranges overlap when each one starts before the other one ends.
// Ranges that only touch (09:00 end / 09:00 start) do NOT overlap.
export function timesOverlap(startA, endA, startB, endB) {
    const s1 = timeToMinutes(startA);
    const e1 = timeToMinutes(endA);
    const s2 = timeToMinutes(startB);
    const e2 = timeToMinutes(endB);

    if (s1 === null || e1 === null || s2 === null || e2 === null) return false;

    return s1 < e2 && s2 < e1;
}

export function sameRoom(a, b) {
    return String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
}

// A room can only hold one class at a time: same room + a shared day
// + overlapping time = conflict (regardless of section).
export function conflicts(a, b) {
    if (!a || !b) return false;
    if (a.Subject_id && b.Subject_id && Number(a.Subject_id) === Number(b.Subject_id)) return false;

    return sameRoom(a.Room, b.Room)
        && daysOverlap(a.Schedule_days, b.Schedule_days)
        && timesOverlap(a.Start_time, a.End_time, b.Start_time, b.End_time);
}

// Human readable summary of a schedule, used in the conflict message
export function describeSchedule(schedule) {
    if (!schedule) return '';
    return `${schedule.Subject_code} - ${schedule.Subject_name} (${formatDays(schedule.Schedule_days)} ${schedule.Start_time} - ${schedule.End_time}, ${schedule.Room})`;
}

// --- QUERIES ---

export const getSchedules = (callback) => {
    const sql = `
        SELECT s.Subject_id, s.Subject_code, s.Edp_code, s.Subject_name, s.Instructor_name,
               s.Room, s.Schedule_days, s.Start_time, s.End_time, s.Section_id,
               sec.Section_num, sec.Section_program
        FROM SUBJECTS s
        LEFT JOIN SECTIONS sec ON sec.Section_id = s.Section_id
        ORDER BY s.Start_time, s.Subject_code`;

    db.query(sql, (err, rows) => {
        if (err) return callback(err);

        // Flag the rows whose room is double-booked on one of their days
        const schedules = rows.map((row) => {
            const conflict = rows.find((other) => conflicts(row, other)) || null;
            return { ...row, occupied: Boolean(conflict), conflict };
        });

        callback(null, schedules);
    });
}

export const getSections = (callback) => {
    const sql = "SELECT Section_id, Section_num, Section_program FROM SECTIONS ORDER BY Section_id";
    db.query(sql, callback);
}

export const getScheduleById = (subjectId, callback) => {
    const sql = "SELECT * FROM SUBJECTS WHERE Subject_id = ?";
    db.query(sql, [subjectId], callback);
}

// Every schedule that uses the same room - the candidates for a conflict
export const getSchedulesByRoom = (room, callback) => {
    const sql = "SELECT * FROM SUBJECTS WHERE LOWER(TRIM(Room)) = LOWER(TRIM(?))";
    db.query(sql, [String(room || "").trim()], callback);
}

// Schedules that clash with the given room / days / time.
// excludeSubjectId lets a schedule be checked against the others without
// comparing it with itself.
export const findRoomConflicts = ({ room, days, start, end, excludeSubjectId }, callback) => {
    getSchedulesByRoom(room, (err, rows) => {
        if (err) return callback(err);

        const candidate = { Room: room, Schedule_days: days, Start_time: start, End_time: end };
        const clashes = rows.filter((row) => {
            if (excludeSubjectId !== undefined && excludeSubjectId !== null
                && Number(row.Subject_id) === Number(excludeSubjectId)) return false;
            return conflicts(candidate, row);
        });

        callback(null, clashes);
    });
}

export const createSchedule = (schedule, callback) => {
    const sql = `
        INSERT INTO SUBJECTS
            (Subject_code, Edp_code, Subject_name, Instructor_name, Room, Schedule_days, Start_time, End_time, Section_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [
        schedule.Subject_code,
        schedule.Edp_code,
        schedule.Subject_name,
        schedule.Instructor_name,
        schedule.Room,
        schedule.Schedule_days,
        schedule.Start_time,
        schedule.End_time,
        schedule.Section_id
    ], callback);
}

export const updateSchedule = (subjectId, schedule, callback) => {
    const sql = `
        UPDATE SUBJECTS SET
            Subject_code = ?,
            Edp_code = ?,
            Subject_name = ?,
            Instructor_name = ?,
            Room = ?,
            Schedule_days = ?,
            Start_time = ?,
            End_time = ?,
            Section_id = ?
        WHERE Subject_id = ?`;

    db.query(sql, [
        schedule.Subject_code,
        schedule.Edp_code,
        schedule.Subject_name,
        schedule.Instructor_name,
        schedule.Room,
        schedule.Schedule_days,
        schedule.Start_time,
        schedule.End_time,
        schedule.Section_id,
        subjectId
    ], callback);
}

export const deleteSchedule = (subjectId, callback) => {
    const sql = "DELETE FROM SUBJECTS WHERE Subject_id = ?";
    db.query(sql, [subjectId], callback);
}
