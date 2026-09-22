import express from "express";
import {
    getAnnouncementsController,
    getAnnouncementByIdController,
    createAnnouncementController,
} from "../../controllers/students_controllers/announcement.controller.js";
import { verifyToken, checkStudentRole } from "../../middlewares/student/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, checkStudentRole, getAnnouncementsController);
router.get("/:id", verifyToken, checkStudentRole, getAnnouncementByIdController);
router.post("/", verifyToken, checkStudentRole, createAnnouncementController);

export default router;