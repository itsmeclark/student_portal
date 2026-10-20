import express from 'express'
import { findAdmin, getDashboardStats } from '../../controllers/admin/dashboard.controller.js';
import { verifyToken, checkAdminRole } from '../../middlewares/student/auth.middleware.js';
const router = express.Router()

router.get('/dashboard', verifyToken, checkAdminRole, findAdmin)
router.get('/stats', verifyToken, checkAdminRole, getDashboardStats)

export default router;
