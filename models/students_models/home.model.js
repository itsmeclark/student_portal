import db from "../../config/db.js";
//QUERIES
//GET USER INFO: SELECT * from students WHERE studentID = ?

export const getUser = (student_id,callback) => {
    const sql = "SELECT * from STUDENTS WHERE Id_number = ?";
    db.query(sql, [student_id], callback);
}