import { getEvents, getEventsByMonth, createEvent } from "../../models/students_models/event.model.js";
import jwt from "jsonwebtoken";

export const getEventsController = (req, res) => {
    const { year, month } = req.query;

    const handleResults = (err, results) => {
        if (err) {
            console.error("Error fetching events:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.status(200).json({ events: results });
    };

    if (year && month) {
        getEventsByMonth(year, month, handleResults);
    } else {
        getEvents(handleResults);
    }
};

export const createEventController = (req, res) => {
    const decode = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    const student_id = decode.id;
    const { title, category, event_date, start_time, end_time, all_day, location } = req.body;

    if (!title || !event_date) {
        return res.status(400).json({ error: "Title and event date are required" });
    }

    createEvent(
        { title, category, event_date, start_time, end_time, all_day, location, posted_by: student_id },
        (err) => {
            if (err) {
                console.error("Error creating event:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
            res.status(201).json({ message: "Event created successfully" });
        }
    );
};