import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import authRoutes from "./routes/student_routes/auth.routes.js";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import homeRoutes from "./routes/student_routes/home.routes.js";
import adminRoutes from "./routes/admin/auth.admin.routes.js";
import adminDashboard from "./routes/admin/dashboard.admin.routes.js";
import studentRoutes from "./routes/student_routes/student.routes.js";
import profileRoutes from "./routes/student_routes/profile.routes.js";
dotenv.config();

const app = express();
const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/profile", studentRoutes);        // old route, dashboard keeps using this
app.use("/api/profile", profileRoutes);    // new secure route, for testing
app.use("/home", homeRoutes);
app.use("/auth/admin", adminRoutes);
app.use("/admin", adminDashboard);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});