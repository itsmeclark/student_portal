import express from "express";
import db from "../../config/db.js";
const router = express.Router();

// Define route to fetch student details by ID number
router.get('/:id', async (req, res) => {
    try {
        const studentId = req.params.id;
        const query = 'SELECT * FROM STUDENTS WHERE Id_number = ?';

        const [results] = await db.query(query, [studentId]);

        if (!results || results.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Return the student object
        return res.json(results[0]);
    } catch (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ error: 'Database error occurred' });
    }
});

export default router;