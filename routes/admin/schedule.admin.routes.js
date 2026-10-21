import { displaySchedules, displaySections, addSchedule, editSchedule, removeSchedule } from '../../controllers/admin/schedule.controller.js'
import { verifyToken, checkAdminRole } from '../../middlewares/student/auth.middleware.js'
import express from 'express'

const router = express.Router()

router.get('/list', verifyToken, checkAdminRole, displaySchedules)
router.get('/sections', verifyToken, checkAdminRole, displaySections)
router.post('/add', verifyToken, checkAdminRole, addSchedule)
router.put('/update/:id', verifyToken, checkAdminRole, editSchedule)
router.delete('/delete/:id', verifyToken, checkAdminRole, removeSchedule)

export default router;
