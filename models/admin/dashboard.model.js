import db from "../../config/db.js";

export const getAdminName = (admin_name, callback) => {
    const sql = "SELECT * FROM ADMIN WHERE Admin_name = ?";
    db.query(sql, [admin_name], callback)
}