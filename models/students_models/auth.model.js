import db from "../../config/db.js";

export const findIdNumber = (Idnumber, callback) => {
    const query = "SELECT * FROM STUDENTS WHERE Id_number = ?";
    db.query(query, [Idnumber], callback);
}