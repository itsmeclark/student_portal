import { findIdNumber } from "../../models/students_models/auth.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

// Passwords changed on the profile page are saved hashed (they start with "$2").
// Older accounts still have plain-text passwords, so both kinds are accepted.
export const passwordMatches = async (typed, stored) => {
    const saved = String(stored || "");
    if (saved.startsWith("$2")) {
        return bcrypt.compare(String(typed || ""), saved);
    }
    return saved === String(typed || "");
};

export const findIdNumberController = async (req, res) => {
    const { Idnumber, password } = req.body || {};
    try {
        const results = await findIdNumber(Idnumber);
        if (results.length === 0) {
            return res.status(404).json({ error: 'ID number not found' });
        }

        const user = results[0];
        const ok = await passwordMatches(password, user.Student_password);
        if (!ok) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const token = jwt.sign({
            id: user.Id_number,
            name: user.First_name,
            email: user.Email,
            role: user.Role
        }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 });
        console.log('LOGIN OK for', user.Id_number, 'role:', user.Role);
        return res.status(200).json({ message: 'login successful', token });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const protectedRouteController = (req, res) => {
    res.status(200).json({ message: 'You have accessed a protected route!', user: req.user, isLoggedIn: true });
    console.log('Protected route accessed by user:', req.user);
};
