import {getUser} from "../../models/students_models/home.model.js";
import jwt from "jsonwebtoken";

export const getUserController = (req, res) => {
   const decode = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
   console.log('Decoded token:', decode);
   const student_id = decode.id;
    getUser(student_id, (err, results) => {
        if (err) {
            console.error('Error fetching user info:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if(results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userInfo = results[0];
        const {student_password : _, ...userWithoutPassword} = userInfo
        res.status(200).json({ user: userWithoutPassword });
    });
}