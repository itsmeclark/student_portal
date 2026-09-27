import {displayAllStudents, addStudentInfo, displaySections, getStudentById, updateStudentInfo, deleteStudentById, searchStudentsById} from '../../controllers/admin/profileManagement.controller.js'
import { verifyToken, checkAdminRole } from '../../middlewares/student/auth.middleware.js'
import express from 'express'

const router = express.Router()

router.get('/displayStudents', verifyToken, checkAdminRole, displayAllStudents)
router.get('/sections', verifyToken, checkAdminRole, displaySections)
router.get('/student/:id', verifyToken, checkAdminRole, getStudentById)
router.get('/search/:id', verifyToken, checkAdminRole, searchStudentsById)
router.post('/addStudent', verifyToken, checkAdminRole, addStudentInfo)
router.put('/updateStudent/:id', verifyToken, checkAdminRole, updateStudentInfo)
router.delete('/deleteStudent/:id', verifyToken, checkAdminRole, deleteStudentById)

export default router;