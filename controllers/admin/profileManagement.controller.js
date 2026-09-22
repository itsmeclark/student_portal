import { displayStudent, addStudent} from "../../models/admin/profileManagement.model.js";

export const displayAllStudents = (req, res) => {
    displayStudent((err, results)=>{
        if(err) console.log(err)
        const students = results
        console.log(results)
        res.status(200).json({students})
    })
}

export const addStudentInfo = (req, res) => {
    const {
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
    } = req.body;

    addStudent(
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
        Emergency_contact_num,
        (err, results) => {
            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "Failed to add student",
                    error: err.message
                });
            }

            return res.status(200).json({
                message: "ADDED SUCCESSFULLY",
                results
            });
        }
    );
};
