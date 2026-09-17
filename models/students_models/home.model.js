import db from "../../config/db.js";
//QUERIES
//GET USER INFO: SELECT * from students WHERE studentID = ?

export const getUser = (student_id,callback) => {
    const sql = "SELECT * from students WHERE studentID = ?";
    db.query(sql, [student_id], callback);
}