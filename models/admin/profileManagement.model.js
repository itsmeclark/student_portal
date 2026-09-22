import db from '../../config/db.js'

export const displayStudent= (callback) => {
    const sql = "SELECT * FROM STUDENTS";
    db.query(sql, callback)
}
export const addStudent =(callback) =>{
    const sql = `INSERT INTO STUDENTS(
    First_name, 
    Last_name, 
    Course, 
    Current_year_level, 
    Id_number, 
    Email,
    Current_section_num, 
    Student_password, 
    Contact_num, 
    Current_address,
    Emergency_contact_name, 
    Emergency_contact_num
    )
     VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

    db.query(sql,
        [
        First_name, 
        Last_name, 
        Course, 
        Current_year_level, 
        Id_number, 
        Email,
        Current_section_num, 
        Student_password, 
        Contact_num, 
        Current_address,
        Emergency_contact_name, 
        Emergency_contact_num
    ],
        callback)
}