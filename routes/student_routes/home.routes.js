import express from "express";
import {getUserController, getEnrolledSubjectsController, getAnnouncementsController} from "../../controllers/students_controllers/home.controller.js";
import { verifyToken, checkStudentRole } from "../../middlewares/student/auth.middleware.js";

const router = express.Router();

router.get("/dashboard", verifyToken, checkStudentRole, getUserController);
router.get("/subjects", verifyToken, checkStudentRole, getEnrolledSubjectsController);
router.get("/announcements", verifyToken, checkStudentRole, getAnnouncementsController);

export default router;