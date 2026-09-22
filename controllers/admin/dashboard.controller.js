import {getAdminName} from '../../models/admin/dashboard.model.js'
import jwt from 'jsonwebtoken'

export const findAdmin = (req, res) => {
    const decode = jwt.verify(req.cookies.token, process.env.JWT_SECRET)
    const admin_name = decode.admin_name

    getAdminName(admin_name, (err, results)=>{
        if (err) {
            console.error('Error fetching user info:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if(results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userInfo = results[0];
        const {Admin_password : _, ...userWithoutPassword} = userInfo
        res.status(200).json({ user: userWithoutPassword });
    })
}