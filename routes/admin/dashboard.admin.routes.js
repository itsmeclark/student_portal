import express from 'express'
import { findAdmin } from '../../controllers/admin/dashboard.controller.js';
import { verifyToken, checkAdminRole } from '../../middlewares/student/auth.middleware.js';
const router = express.Router()

router.get('/dashboard', verifyToken, checkAdminRole, findAdmin)

export default router;