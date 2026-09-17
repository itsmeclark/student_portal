import express from "express";
import {getUserController} from "../../controllers/students_controllers/home.controller.js";
import { verifyToken } from "../../middlewares/student/auth.middleware.js";

const router = express.Router();

router.get("/dashboard", verifyToken, getUserController);

export default router;