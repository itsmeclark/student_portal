import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, result) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token.' });
        }
        req.user = result;
        console.log('Token verified. User info:', req.user);
        next();
    }); 
}

export const checkStudentRole = (req, res, next) => {
    if (req.user.role !== 'STUDENT') {
        console.log('User role is not student:', req.user.role);
        return res.status(403).json({ error: 'Access denied. Students only.' });
    }
    next();
}
export const checkAdminRole = (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        console.log('User role is not admin:', req.user.role);
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
}   