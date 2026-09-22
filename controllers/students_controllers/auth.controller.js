import {findIdNumber} from "../../models/students_models/auth.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const findIdNumberController = (req, res) => {
    const { Idnumber, password} = req.body;

    findIdNumber(Idnumber, async (err, results) => {
        if (err) {
            console.error('Error fetching ID number:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if(results.length === 0) {
            return res.status(404).json({ error: 'ID number not found' });
        }

        try{
            const user = results[0];
            if(user.Student_password !== password) {
                return res.status(401).json({ error: 'Invalid password' });
            }
            const token = jwt.sign({
                id: user.Id_number,
                name: user.First_name,
                email: user.Email,
                role: user.Role
            }, process.env.JWT_SECRET, { expiresIn: '1h' });
            
            res.cookie('token', token, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 60 * 60 * 1000
            })
            return res.status(200).json({ message: 'login successful'});
        }
        catch(error) {
            console.error('Error during login:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    })
}
export const protectedRouteController = (req, res) => {
    res.status(200).json({ message: 'You have accessed a protected route!', user: req.user, isLoggedIn: true });
    console.log('Protected route accessed by user:', req.user);
}