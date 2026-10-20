import express from "express";
import {getUserController, getEnrolledSubjectsController, getAnnouncementsController, getStudentProfileController, updateProfileController, changePasswordController} from "../../controllers/students_controllers/home.controller.js";
import { getGradesController, getTermsController } from "../../controllers/students_controllers/grades.controller.js";
import { verifyToken, checkStudentRole } from "../../middlewares/student/auth.middleware.js";

const router = express.Router();

router.get("/dashboard", verifyToken, checkStudentRole, getUserController);
router.get("/subjects", verifyToken, checkStudentRole, getEnrolledSubjectsController);
router.get("/announcements", verifyToken, checkStudentRole, getAnnouncementsController);
router.get("/grades", verifyToken, checkStudentRole, getGradesController);
router.get("/terms", verifyToken, checkStudentRole, getTermsController);
router.get("/profile", verifyToken, checkStudentRole, getStudentProfileController);
router.put("/profile", verifyToken, checkStudentRole, updateProfileController);
router.post("/password", verifyToken, checkStudentRole, changePasswordController);

export default router;