import { displayStudent, addStudent, getSections } from "../../models/admin/profileManagement.model.js";

export const displayAllStudents = (req, res) => {
    displayStudent((err, results) => {
        if (err) {
            console.error('Error fetching students:', err);
            return res.status(500).json({ error: 'Failed to load students' });
        }
        res.status(200).json({ students: results });
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

export const addStudentInfo = (req, res) => {
    const {
        Full_name,
        Course,
        Current_year_level,
        Id_number,
        Email,
        Section_id,
        Student_password,
        Contact_num,
        Current_address,
        Emergency_contact_name,
        Emergency_contact_num,
        Gender,
        Academic_year,
        Semester,
        Enrollment_type
    } = req.body;

    // --- Validation: required fields ---
    const required = {
        Full_name,
        Course,
        Current_year_level,
        Id_number,
        Email,
        Section_id,
        Student_password,
        Contact_num,
        Current_address,
        Emergency_contact_name,
        Emergency_contact_num,
        Gender,
        Academic_year,
        Semester,
        Enrollment_type
    };
    const missing = Object.entries(required)
        .filter(([, value]) => value === undefined || value === null || String(value).trim() === '')
        .map(([key]) => key);

    if (missing.length > 0) {
        return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    if (isNaN(Number(Section_id))) {
        return res.status(400).json({ error: 'Invalid section selected' });
    }

    // --- Split Full Name -> First_name / Last_name ---
    // Supports "Last name, First name" (with comma) and "First name Last name" (no comma)
    const trimmedName = String(Full_name).trim().replace(/\s+/g, ' ');
    let First_name, Last_name;
    if (trimmedName.includes(',')) {
        const parts = trimmedName.split(',');
        Last_name = parts[0].trim();
        First_name = parts.slice(1).join(',').trim();
    } else {
        const spaceIndex = trimmedName.indexOf(' ');
        First_name = spaceIndex === -1 ? trimmedName : trimmedName.slice(0, spaceIndex);
        Last_name = spaceIndex === -1 ? '' : trimmedName.slice(spaceIndex + 1).trim();
    }
    if (!First_name || !Last_name) {
        return res.status(400).json({ error: 'Full name must include a first and last name (e.g. Dela Cruz, Juan)' });
    }

    // --- Normalize formats to match existing data ---
    const gender = String(Gender).toUpperCase();
    if (gender !== 'MALE' && gender !== 'FEMALE') {
        return res.status(400).json({ error: 'Gender must be MALE or FEMALE' });
    }

    const semesterWord = String(Semester).trim().split(' ')[0]; // "1st" | "1st Semester" | "1"
    const Semester_value = `${semesterWord} Semester`;

    const yearLevel = String(Current_year_level).trim();
    const enrollmentType = String(Enrollment_type).trim().toUpperCase();

    const student = {
        First_name,
        Last_name,
        Course: String(Course).trim(),
        Current_year_level: yearLevel,
        Id_number: String(Id_number).trim(),
        Email: String(Email).trim(),
        Student_password: String(Student_password),
        Contact_num: String(Contact_num).trim(),
        Current_address: String(Current_address).trim(),
        Emergency_contact_name: String(Emergency_contact_name).trim(),
        Emergency_contact_num: String(Emergency_contact_num).trim(),
        Gender: gender
    };

    const enrollment = {
        Section_id: Number(Section_id),
        Academic_year: String(Academic_year).trim(),
        Semester: Semester_value,
        Year_level: yearLevel,
        Enrollment_type: enrollmentType
    };

    addStudent(student, enrollment, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                const message = err.sqlMessage || '';
                if (message.includes('Id_number')) {
                    return res.status(409).json({ error: 'A student with that ID number already exists' });
                }
                if (message.includes('Email')) {
                    return res.status(409).json({ error: 'A student with that email already exists' });
                }
                return res.status(409).json({ error: 'Duplicate student record' });
            }
            if (err.status === 400) {
                return res.status(400).json({ error: err.message });
            }
            console.error('Error adding student:', err);
            return res.status(500).json({ error: 'Failed to add student' });
        }

        return res.status(200).json({
            message: 'ADDED SUCCESSFULLY',
            studentId: result.studentId
        });
    });
};
