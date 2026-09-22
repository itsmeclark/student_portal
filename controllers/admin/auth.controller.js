import {findAdmin} from "../../models/admin/auth.model.js";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const adminLoginController = (req, res) => {
    const {adminName, password} = req.body;

    console.log('Admin login attempt:', adminName);
    findAdmin(adminName, (err, results) => {
        if(err){
            console.error('Error fetching admin:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if(results.length === 0) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        try{
            const admin = results[0];
            if(admin.Admin_password !== password) {
                return res.status(401).json({ error: 'Invalid password' });
            }
            const token = jsonwebtoken.sign({
                id: admin.Admin_id,
                name: admin.Admin_name,
                role: admin.Role
            }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.cookie('token', token, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 60 * 60 * 1000
            })
            return res.status(200).json({ message: 'login successful'
            })
        }catch(error) {
            console.error('Error during admin login:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    })
}
export const protectedRoutes = (req, res) => {
    res.status(200).json({ message: 'You have accessed a protected route!', user: req.user, isLoggedIn: true });
    console.log('Protected route accessed by user:', req.user);
}