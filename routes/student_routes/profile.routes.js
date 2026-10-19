import express from "express";
import bcrypt from "bcrypt";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import db from "../../config/db.js";
import { verifyToken, checkStudentRole } from "../../middlewares/student/auth.middleware.js";
import { passwordMatches } from "../../controllers/students_controllers/auth.controller.js";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "../../public/uploads");

// Every route here needs a logged-in student
router.use(verifyToken, checkStudentRole);

// ------------------------------------------------------------------
// GET /api/profile/me : the logged-in student's profile (never the password)
// ------------------------------------------------------------------
router.get("/me", async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT id_number                AS Id_number,
                    first_name               AS First_name,
                    last_name                AS Last_name,
                    course                   AS Course,
                    year_level               AS Current_year_level,
                    year_level               AS Year_level,
                    email                    AS Email,
                    role                     AS Role,
                    contact_number           AS Contact_num,
                    address                  AS Current_address,
                    emergency_contact_name   AS Emergency_contact_name,
                    emergency_contact_number AS Emergency_contact_num,
                    photo_path               AS Profile_photo,
                    academic_year            AS Academic_year,
                    semester                 AS Semester,
                    enrollment_type          AS Enrollment_type
             FROM STUDENTS
             WHERE id_number = ?`,
            [req.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Student not found" });
        }
        return res.json(rows[0]);
    } catch (err) {
        console.error("Profile load error:", err);
        return res.status(500).json({ error: "Database error occurred" });
    }
});

// ------------------------------------------------------------------
// PUT /api/profile/me/contact : update contact info
// ------------------------------------------------------------------
const PH_MOBILE = /^09\d{9}$/;

router.put("/me/contact", async (req, res) => {
    const body = req.body || {};
    const clean = (v) => (typeof v === "string" ? v.trim() : "");
    const contactNum    = clean(body.contactNum);
    const address       = clean(body.address);
    const emergencyNum  = clean(body.emergencyNum);
    const emergencyName = clean(body.emergencyName);

    if (!PH_MOBILE.test(contactNum)) {
        return res.status(400).json({ error: "Contact Number must be 11 digits starting with 09." });
    }
    if (!PH_MOBILE.test(emergencyNum)) {
        return res.status(400).json({ error: "Emergency Contact Number must be 11 digits starting with 09." });
    }
    if (address.length > 255) {
        return res.status(400).json({ error: "Address is too long (max 255 characters)." });
    }
    if (emergencyName.length > 150) {
        return res.status(400).json({ error: "Emergency Contact Name is too long (max 150 characters)." });
    }

    try {
        await db.query(
            `UPDATE STUDENTS
             SET contact_number = ?, address = ?, emergency_contact_name = ?, emergency_contact_number = ?
             WHERE id_number = ?`,
            [contactNum, address, emergencyName, emergencyNum, req.user.id]
        );
        return res.json({
            message: "Contact information updated.",
            contact: { contactNum, address, emergencyNum, emergencyName }
        });
    } catch (err) {
        console.error("Contact update error:", err);
        return res.status(500).json({ error: "Database error occurred" });
    }
});

// ------------------------------------------------------------------
// POST /api/profile/me/photo : upload a new profile photo
// The browser sends the image file itself as the request body (JPG or PNG, max 2 MB).
// ------------------------------------------------------------------
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

router.post(
    "/me/photo",
    express.raw({ type: ["image/jpeg", "image/png"], limit: MAX_PHOTO_BYTES }),
    async (req, res) => {
        const buf = req.body;
        if (!Buffer.isBuffer(buf) || buf.length === 0) {
            return res.status(400).json({ error: "Please choose a JPG or PNG image." });
        }

        // Check the real file type from its first bytes (don't trust the file name)
        const isJpg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
        const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
        if (!isJpg && !isPng) {
            return res.status(400).json({ error: "Only JPG or PNG images are allowed." });
        }

        try {
            await fs.mkdir(UPLOAD_DIR, { recursive: true });
            const safeId = String(req.user.id).replace(/[^a-zA-Z0-9_-]/g, "");
            const fileName = `${safeId}-${Date.now()}.${isPng ? "png" : "jpg"}`;
            await fs.writeFile(path.join(UPLOAD_DIR, fileName), buf);
            const photoUrl = `/uploads/${fileName}`;

            // Remember the old photo so it can be deleted after saving the new one
            const [old] = await db.query("SELECT photo_path AS Profile_photo FROM STUDENTS WHERE id_number = ?", [req.user.id]);
            await db.query("UPDATE STUDENTS SET photo_path = ? WHERE id_number = ?", [photoUrl, req.user.id]);

            const oldUrl = old[0] && old[0].Profile_photo;
            if (oldUrl && oldUrl.startsWith("/uploads/")) {
                await fs.unlink(path.join(UPLOAD_DIR, path.basename(oldUrl))).catch(() => {});
            }

            return res.json({ message: "Profile photo updated.", photo: photoUrl });
        } catch (err) {
            console.error("Photo upload error:", err);
            return res.status(500).json({ error: "Could not save the photo." });
        }
    }
);

// ------------------------------------------------------------------
// PUT /api/profile/me/password : change password
// Rules: at least 8 characters, at least one number, different from the current one.
// The new password is saved hashed with bcrypt (in the "password" column).
// ------------------------------------------------------------------
router.put("/me/password", async (req, res) => {
    const body = req.body || {};
    const currentPassword = String(body.currentPassword || "");
    const newPassword     = String(body.newPassword || "");
    const confirmPassword = String(body.confirmPassword || "");

    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ error: "Please fill in all three fields." });
    }
    if (newPassword.length < 8) {
        return res.status(400).json({ error: "New password must be at least 8 characters." });
    }
    if (!/\d/.test(newPassword)) {
        return res.status(400).json({ error: "New password must contain at least one number." });
    }
    if (newPassword.length > 72) {
        return res.status(400).json({ error: "New password is too long (max 72 characters)." });
    }
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: "New passwords do not match." });
    }
    if (newPassword === currentPassword) {
        return res.status(400).json({ error: "New password must be different from the current one." });
    }

    try {
        const [rows] = await db.query("SELECT password AS Student_password FROM STUDENTS WHERE id_number = ?", [req.user.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Student not found" });
        }

        const ok = await passwordMatches(currentPassword, rows[0].Student_password);
        if (!ok) {
            return res.status(400).json({ error: "Current password is incorrect." });
        }

        const hash = await bcrypt.hash(newPassword, 10);
        await db.query("UPDATE STUDENTS SET password = ? WHERE id_number = ?", [hash, req.user.id]);
        return res.json({ message: "Password changed." });
    } catch (err) {
        console.error("Password change error:", err);
        return res.status(500).json({ error: "Database error occurred" });
    }
});

// Friendly errors for uploads that are too big or the wrong type
router.use((err, req, res, next) => {
    if (err && err.type === "entity.too.large") {
        return res.status(413).json({ error: "Image is too large (max 2 MB)." });
    }
    console.error("Profile route error:", err);
    return res.status(500).json({ error: "Something went wrong." });
});

export default router;
