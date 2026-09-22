import express from "express";
import { getEventsController, createEventController } from "../../controllers/students_controllers/event.controller.js";
import { verifyToken, checkStudentRole } from "../../middlewares/student/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, checkStudentRole, getEventsController);
router.post("/", verifyToken, checkStudentRole, createEventController);

export default router;