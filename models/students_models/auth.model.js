import db from "../../config/db.js";

export const findIdNumber = (Idnumber, callback) => {
    const query = "SELECT * FROM students WHERE studentID = ?";
    db.query(query, [Idnumber], callback);
}