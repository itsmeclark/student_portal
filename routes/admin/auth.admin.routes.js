import express from "express";
import {adminLoginController, protectedRoutes} from "../../controllers/admin/auth.controller.js";
import { verifyToken, checkAdminRole} from "../../middlewares/student/auth.middleware.js";

const router = express.Router();

router.post("/login", adminLoginController);
router.get("/protected", verifyToken, checkAdminRole, protectedRoutes)
router.post("/logout", (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
})
export default router;