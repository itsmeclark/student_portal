import {displayAllStudents, addStudentInfo, displaySections} from '../../controllers/admin/profileManagement.controller.js'
import { verifyToken, checkAdminRole } from '../../middlewares/student/auth.middleware.js'
import express from 'express'

const router = express.Router()

router.get('/displayStudents', verifyToken, checkAdminRole, displayAllStudents)
router.get('/sections', verifyToken, checkAdminRole, displaySections)
router.post('/addStudent', verifyToken, checkAdminRole, addStudentInfo)

export default router;