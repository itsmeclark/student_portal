import express from "express";
import db from "../../config/db.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
    try {
        const studentId = req.params.id;
        console.log("Fetching profile for ID:", studentId); // Check your terminal to see if this logs!

        const query = `
            SELECT * 
            FROM students 
            WHERE Id_number = ?
        `;

        const [rows] = await db.query(query, [studentId]);

        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: "Student not found." });
        }

        return res.json(rows[0]);
    } catch (err) {
        console.error("Error fetching profile:", err.message);
        return res.status(500).json({ error: "Server error while fetching profile." });
    }
});

// 2. PUT ROUTE: Update student profile
router.put("/update", async (req, res) => {
    try {
        const studentId = req.session?.studentId || req.body.Id_number;
        const { Contact_number, Address } = req.body;

        const query = `
            UPDATE students 
            SET Contact_number = ?, Address = ? 
            WHERE Id_number = ?
        `;

        await db.query(query, [Contact_number, Address, studentId]);

        return res.json({ success: true, message: "Profile updated successfully!" });
    } catch (err) {
        console.error("Error updating profile:", err.message);
        return res.status(500).json({ error: "Server error while updating profile." });
    }
});

export default router;