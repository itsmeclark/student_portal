import db from "../../config/db.js";

// Column names match the real database (lowercase: id_number, password, role ...).
// The "AS" names keep the rest of the code working the same way.
export const findIdNumber = async (Idnumber) => {
    const [rows] = await db.query(
        `SELECT id_number  AS Id_number,
                first_name AS First_name,
                email      AS Email,
                role       AS Role,
                password   AS Student_password
         FROM STUDENTS
         WHERE id_number = ?`,
        [Idnumber]
    );
    return rows;
};
