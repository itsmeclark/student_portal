import { displayStudent, addStudent, getSections, getStudentById as getStudentByIdModel, updateStudent as updateStudentModel, deleteStudent as deleteStudentModel } from "../../models/admin/profileManagement.model.js";

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

const parseStudentInput = (body) => {
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
        Enrollment_type,
        Status
    } = body;

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
        return { error: { status: 400, message: `Missing required fields: ${missing.join(', ')}` } };
    }

    if (isNaN(Number(Section_id))) {
        return { error: { status: 400, message: 'Invalid section selected' } };
    }

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
        return { error: { status: 400, message: 'Full name must include a first and last name (e.g. Dela Cruz, Juan)' } };
    }

    const gender = String(Gender).toUpperCase();
    if (gender !== 'MALE' && gender !== 'FEMALE') {
        return { error: { status: 400, message: 'Gender must be MALE or FEMALE' } };
    }

    const semesterWord = String(Semester).trim().split(' ')[0];
    const Semester_value = `${semesterWord} Semester`;

    const yearLevel = String(Current_year_level).trim();
    const enrollmentType = String(Enrollment_type).trim().toUpperCase();

    let status = 'ACTIVE';
    if (Status !== undefined && String(Status).trim() !== '') {
        status = String(Status).trim().toUpperCase();
        if (!['ACTIVE', 'INACTIVE', 'DROPOUT'].includes(status)) {
            return { error: { status: 400, message: 'Status must be ACTIVE or INACTIVE' } };
        }
    }

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
        Gender: gender,
        Status: status
    };

    const enrollment = {
        Section_id: Number(Section_id),
        Academic_year: String(Academic_year).trim(),
        Semester: Semester_value,
        Year_level: yearLevel,
        Enrollment_type: enrollmentType
    };

    return { student, enrollment };
};

const sendInputError = (res, err, context) => {
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
    if (err.status === 400 || err.status === 404) {
        return res.status(err.status).json({ error: err.message });
    }
    console.error(context, err);
    return res.status(500).json({ error: `Failed to ${context}` });
};

export const addStudentInfo = (req, res) => {
    const parsed = parseStudentInput(req.body);
    if (parsed.error) {
        return res.status(parsed.error.status).json({ error: parsed.error.message });
    }

    addStudent(parsed.student, parsed.enrollment, (err, result) => {
        if (err) {
            return sendInputError(res, err, 'add student');
        }

        return res.status(200).json({
            message: 'ADDED SUCCESSFULLY',
            studentId: result.studentId
        });
    });
};

export const getStudentById = (req, res) => {
    const studentId = Number(req.params.id);
    if (isNaN(studentId)) {
        return res.status(400).json({ error: 'Invalid student id' });
    }

    getStudentByIdModel(studentId, (err, result) => {
        if (err) {
            console.error('Error fetching student:', err);
            return res.status(500).json({ error: 'Failed to load student' });
        }
        if (!result) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.status(200).json(result);
    });
};

export const updateStudentInfo = (req, res) => {
    const studentId = Number(req.params.id);
    if (isNaN(studentId)) {
        return res.status(400).json({ error: 'Invalid student id' });
    }

    const parsed = parseStudentInput(req.body);
    if (parsed.error) {
        return res.status(parsed.error.status).json({ error: parsed.error.message });
    }

    updateStudentModel(studentId, parsed.student, parsed.enrollment, (err) => {
        if (err) {
            return sendInputError(res, err, 'update student');
        }

        return res.status(200).json({
            message: 'UPDATED SUCCESSFULLY',
            studentId
        });
    });
};

export const deleteStudentById = (req, res) => {
    const studentId = Number(req.params.id);
    if (isNaN(studentId)) {
        return res.status(400).json({ error: 'Invalid student id' });
    }

    deleteStudentModel(studentId, (err, result) => {
        if (err) {
            console.error('Error deleting student:', err);
            return res.status(500).json({ error: 'Failed to delete student' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.status(200).json({ message: 'DELETED SUCCESSFULLY', studentId });
    });
};
