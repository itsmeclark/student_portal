import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verifyToken = (req, res, next) => {
    // Accept the token from the cookie OR from the Authorization header
    const header = req.headers.authorization || '';
    const bearer = header.startsWith('Bearer ') ? header.slice(7) : null;
    const token = req.cookies.token || bearer;

    if (!token) {
        console.log('NO TOKEN: no cookie and no Authorization header');
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, result) => {
        if (err) {
            console.log('BAD TOKEN:', err.message);
            return res.status(401).json({ error: 'Invalid token.' });
        }
        req.user = result;
        console.log('Token verified. User info:', req.user);
        next();
    });
}

export const checkStudentRole = (req, res, next) => {
    const role = String(req.user.role || '').trim().toUpperCase();
    if (role !== 'STUDENT') {
        console.log('ROLE PROBLEM: role in database is:', req.user.role);
        return res.status(403).json({ error: 'Access denied. Students only.' });
    }
    next();
}

export const checkAdminRole = (req, res, next) => {
    const role = String(req.user.role || '').trim().toUpperCase();
    if (role !== 'ADMIN') {
        console.log('ROLE PROBLEM: role in database is:', req.user.role);
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
}