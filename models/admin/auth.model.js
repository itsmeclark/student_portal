import db from "../../config/db.js";

export const findAdmin = (admin_name, callback) => {
    const query = "SELECT * FROM ADMIN WHERE Admin_name = ?";
    db.query(query, [admin_name], callback);
}