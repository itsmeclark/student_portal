import { findIdNumberController, protectedRouteController } from "../../controllers/students_controllers/auth.controller.js";
import express from "express";
import { verifyToken } from "../../middlewares/student/auth.middleware.js";

const router = express.Router();

router.post("/login", findIdNumberController);
router.get("/protected", verifyToken, protectedRouteController);
router.post("/logout", (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
});
export default router;