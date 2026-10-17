import express from "express";
import { getTermsController, getStudentGradesController, saveGradeController } from "../../controllers/admin/grades.controller.js";
import { verifyToken, checkAdminRole } from "../../middlewares/student/auth.middleware.js";

const router = express.Router();

router.get("/terms", verifyToken, checkAdminRole, getTermsController);
router.get("/student", verifyToken, checkAdminRole, getStudentGradesController);
router.post("/save", verifyToken, checkAdminRole, saveGradeController);

export default router;
