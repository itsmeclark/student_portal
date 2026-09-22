import express from "express";
import {getUserController} from "../../controllers/students_controllers/home.controller.js";
import { verifyToken, checkStudentRole } from "../../middlewares/student/auth.middleware.js";

const router = express.Router();

router.get("/dashboard", verifyToken, checkStudentRole, getUserController);

export default router;