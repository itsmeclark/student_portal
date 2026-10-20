import {getUser, getEnrolledSubjects, getAnnouncements, getStudentProfile, updateStudentProfile, updateStudentPassword} from "../../models/students_models/home.model.js";
import jwt from "jsonwebtoken";

export const getUserController = (req, res) => {
   const decode = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
   const student_id = decode.id;
    getUser(student_id, (err, results) => {
        if (err) {
            console.error('Error fetching user info:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if(results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userInfo = results[0];
        const {Student_password : _, ...userWithoutPassword} = userInfo
        res.status(200).json({ user: userWithoutPassword });
    });
}

// Enrolled subjects for the logged-in student (Id_number comes from the verified JWT,
// so a student can never request someone else's subjects)
export const getEnrolledSubjectsController = (req, res) => {
    const idNumber = req.user.id;
    getEnrolledSubjects(idNumber, (err, results) => {
        if (err) {
            console.error('Error fetching enrolled subjects:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // The term of the enrollment the subjects belong to (used by the class schedule page)
        const first = results[0];
        const term = first
            ? {
                academicYear: first.Academic_year ?? null,
                semester: first.Semester ?? null,
                yearLevel: first.Year_level ?? null
            }
            : null;

        res.status(200).json({ subjects: results, term });
    });
}

// Latest published announcements
export const getAnnouncementsController = (req, res) => {
    getAnnouncements((err, results) => {
        if (err) {
            console.error('Error fetching announcements:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json({ announcements: results });
    });
}

// Personal info + latest enrollment details of the logged-in student
export const getStudentProfileController = (req, res) => {
    const idNumber = req.user.id;
    getStudentProfile(idNumber, (err, results) => {
        if (err) {
            console.error('Error fetching student profile:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const { Student_password: _, ...student } = results[0];
        const enrollment = {
            Academic_year: student.Academic_year ?? null,
            Semester: student.Semester ?? null,
            Year_level: student.Year_level ?? null,
            Enrollment_type: student.Enrollment_type ?? null
        };

        res.status(200).json({ user: student, enrollment });
    });
}

// Save the logged-in student's contact information
export const updateProfileController = (req, res) => {
    const idNumber = req.user.id;
    const {
        email,
        contactNumber,
        currentAddress,
        emergencyName,
        emergencyNumber
    } = req.body;

    const text = (value) => (value === undefined || value === null ? '' : String(value).trim());

    const emailValue = text(email);
    const contactValue = text(contactNumber);
    const addressValue = text(currentAddress);
    const emergencyNameValue = text(emergencyName);
    const emergencyNumberValue = text(emergencyNumber);

    const missing = [];
    if (!emailValue) missing.push('College Email');
    if (!contactValue) missing.push('Contact Number');
    if (!addressValue) missing.push('Current Address');
    if (!emergencyNameValue) missing.push('Emergency Contact Name');
    if (!emergencyNumberValue) missing.push('Emergency Contact Number');

    if (missing.length > 0) {
        return res.status(400).json({ error: `Please fill in: ${missing.join(', ')}.` });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue) || emailValue.length > 150) {
        return res.status(400).json({ error: 'Please enter a valid college email address.' });
    }

    // Numbers only (a leading +, spaces and dashes are allowed)
    const phonePattern = /^[0-9+\-\s()]{7,20}$/;
    if (!phonePattern.test(contactValue)) {
        return res.status(400).json({ error: 'Please enter a valid contact number (7 to 20 digits).' });
    }
    if (!phonePattern.test(emergencyNumberValue)) {
        return res.status(400).json({ error: 'Please enter a valid emergency contact number (7 to 20 digits).' });
    }

    if (addressValue.length > 255) {
        return res.status(400).json({ error: 'Current Address is too long (maximum 255 characters).' });
    }
    if (emergencyNameValue.length > 150) {
        return res.status(400).json({ error: 'Emergency Contact Name is too long (maximum 150 characters).' });
    }

    const profile = {
        email: emailValue,
        contactNumber: contactValue,
        currentAddress: addressValue,
        emergencyName: emergencyNameValue,
        emergencyNumber: emergencyNumberValue
    };

    updateStudentProfile(idNumber, profile, (err, result) => {
        if (err) {
            // Email has a UNIQUE key in the database
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'That email is already used by another student.' });
            }
            console.error('Error updating student profile:', err);
            return res.status(500).json({ error: 'Failed to update your contact information.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.status(200).json({
            message: 'Contact information updated successfully.',
            profile
        });
    });
};

// Change the logged-in student's password
export const changePasswordController = (req, res) => {
    const idNumber = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Please fill in all the fields.' });
    }

    if (String(newPassword).length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    }

    getUser(idNumber, (err, results) => {
        if (err) {
            console.error('Error fetching user for password change:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const user = results[0];
        if (user.Student_password !== currentPassword) {
            return res.status(401).json({ error: 'Current password is incorrect.' });
        }

        updateStudentPassword(idNumber, newPassword, (err) => {
            if (err) {
                console.error('Error updating password:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.status(200).json({ message: 'Password changed successfully.' });
        });
    });
}