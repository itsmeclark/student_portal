import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Checks the login token. It accepts the token from the login cookie
// OR from the "Authorization: Bearer <token>" header, and uses the first one that is valid.
// (Before, an old expired cookie could block a valid header token, which logged people out.)
export const verifyToken = (req, res, next) => {
    const header = req.headers.authorization || '';
    const bearer = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
    const cookieToken = req.cookies ? req.cookies.token : null;

    const candidates = [cookieToken, bearer].filter((t) => t && t !== 'null' && t !== 'undefined');

    if (candidates.length === 0) {
        console.log('NO TOKEN: no cookie and no Authorization header');
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    let lastError = '';
    for (const token of candidates) {
        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET);
            return next();
        } catch (err) {
            lastError = err.message;
        }
    }

    console.log('BAD TOKEN:', lastError);
    return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
};

export const checkStudentRole = (req, res, next) => {
    const role = String(req.user.role || '').trim().toUpperCase();
    if (role !== 'STUDENT') {
        console.log('ROLE PROBLEM: role in token is:', req.user.role);
        return res.status(403).json({ error: 'Access denied. Students only.' });
    }
    next();
};

export const checkAdminRole = (req, res, next) => {
    const role = String(req.user.role || '').trim().toUpperCase();
    if (role !== 'ADMIN') {
        console.log('ROLE PROBLEM: role in token is:', req.user.role);
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
};
