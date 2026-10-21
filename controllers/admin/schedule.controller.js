import {
    getSchedules,
    getSections,
    getScheduleById,
    findRoomConflicts,
    createSchedule as createScheduleModel,
    updateSchedule as updateScheduleModel,
    deleteSchedule as deleteScheduleModel,
    parseDays,
    timeToMinutes,
    describeSchedule
} from "../../models/admin/schedule.model.js";

// ---------- HELPERS ----------

// Turns the request body into a clean schedule row.
// Returns { error } when the input cannot be used.
const parseScheduleInput = (body) => {
    const text = (value) => (value === undefined || value === null ? '' : String(value).trim());

    const Subject_code = text(body.Subject_code).toUpperCase();
    const Subject_name = text(body.Subject_name);
    const Edp_code = text(body.Edp_code);
    const Instructor_name = text(body.Instructor_name);
    const Room = text(body.Room);
    const Start_time = text(body.Start_time);
    const End_time = text(body.End_time);

    // Days arrive either as an array of letters or as one "MWF" string
    const rawDays = Array.isArray(body.Schedule_days)
        ? body.Schedule_days
        : String(body.Schedule_days || '').split('');
    const days = parseDays(rawDays.join(''));

    const sectionId = text(body.Section_id);

    if (!Subject_code) return { error: 'Subject code is required.' };
    if (!Subject_name) return { error: 'Subject name is required.' };
    if (!Instructor_name) return { error: 'Instructor is required.' };
    if (!Room) return { error: 'Room is required.' };
    if (days.length === 0) return { error: 'Pick at least one meeting day.' };
    if (!sectionId) return { error: 'Pick a section for this schedule.' };

    const start = timeToMinutes(Start_time);
    const end = timeToMinutes(End_time);
    if (start === null || end === null) {
        return { error: 'Enter the start and end time as HH:MM.' };
    }
    if (start >= end) {
        return { error: 'The end time must be later than the start time.' };
    }

    return {
        schedule: {
            Subject_code,
            Subject_name,
            Edp_code,
            Instructor_name,
            Room,
            Schedule_days: days.join(''),
            Start_time,
            End_time,
            Section_id: Number(sectionId)
        }
    };
};

// Rejects the save when the room is already taken on one of the days
const checkRoomAvailability = (schedule, excludeSubjectId, callback) => {
    findRoomConflicts({
        room: schedule.Room,
        days: schedule.Schedule_days,
        start: schedule.Start_time,
        end: schedule.End_time,
        excludeSubjectId
    }, (err, clashes) => {
        if (err) return callback(err);

        if (clashes.length > 0) {
            const error = new Error(
                `Room ${schedule.Room} is already occupied on ${describeSchedule(clashes[0])}.`
            );
            error.status = 409;
            error.conflict = clashes[0];
            return callback(error);
        }

        callback(null);
    });
}

// ---------- CONTROLLERS ----------

export const displaySchedules = (req, res) => {
    getSchedules((err, results) => {
        if (err) {
            console.error('Error fetching schedules:', err);
            return res.status(500).json({ error: 'Failed to load schedules' });
        }
        res.status(200).json({ schedules: results });
    });
}

export const displaySections = (req, res) => {
    getSections((err, results) => {
        if (err) {
            console.error('Error fetching sections:', err);
            return res.status(500).json({ error: 'Failed to load sections' });
        }
        res.status(200).json({ sections: results });
    });
}

export const addSchedule = (req, res) => {
    const parsed = parseScheduleInput(req.body || {});
    if (parsed.error) {
        return res.status(400).json({ error: parsed.error });
    }

    const { schedule } = parsed;

    checkRoomAvailability(schedule, null, (err) => {
        if (err) {
            if (err.status === 409) {
                return res.status(409).json({ error: err.message, conflict: err.conflict });
            }
            console.error('Error checking room availability:', err);
            return res.status(500).json({ error: 'Failed to save the schedule' });
        }

        createScheduleModel(schedule, (err) => {
            if (err) {
                console.error('Error creating schedule:', err);
                return res.status(500).json({ error: 'Failed to save the schedule' });
            }
            res.status(201).json({ message: 'Schedule saved.', schedule });
        });
    });
}

export const editSchedule = (req, res) => {
    const subjectId = Number(req.params.id);
    if (!Number.isInteger(subjectId) || subjectId <= 0) {
        return res.status(400).json({ error: 'Invalid schedule id.' });
    }

    const parsed = parseScheduleInput(req.body || {});
    if (parsed.error) {
        return res.status(400).json({ error: parsed.error });
    }

    const { schedule } = parsed;

    getScheduleById(subjectId, (err, rows) => {
        if (err) {
            console.error('Error loading schedule:', err);
            return res.status(500).json({ error: 'Failed to load the schedule' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Schedule not found.' });
        }

        checkRoomAvailability(schedule, subjectId, (err) => {
            if (err) {
                if (err.status === 409) {
                    return res.status(409).json({ error: err.message, conflict: err.conflict });
                }
                console.error('Error checking room availability:', err);
                return res.status(500).json({ error: 'Failed to save the schedule' });
            }

            updateScheduleModel(subjectId, schedule, (err) => {
                if (err) {
                    console.error('Error updating schedule:', err);
                    return res.status(500).json({ error: 'Failed to save the schedule' });
                }
                res.status(200).json({ message: 'Schedule updated.', schedule });
            });
        });
    });
}

export const removeSchedule = (req, res) => {
    const subjectId = Number(req.params.id);
    if (!Number.isInteger(subjectId) || subjectId <= 0) {
        return res.status(400).json({ error: 'Invalid schedule id.' });
    }

    deleteScheduleModel(subjectId, (err) => {
        if (err) {
            console.error('Error deleting schedule:', err);
            return res.status(500).json({ error: 'Failed to delete the schedule' });
        }
        res.status(200).json({ message: 'Schedule deleted.' });
    });
}
