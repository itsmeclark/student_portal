import express from "express";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/student_routes/auth.routes.js";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import homeRoutes from "./routes/student_routes/home.routes.js";
import adminRoutes from "./routes/admin/auth.admin.routes.js";
import adminDashboard from './routes/admin/dashboard.admin.routes.js'
import profileManagement from './routes/admin/profileManagement.routes.js'
dotenv.config();

const app = express();
const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/home", homeRoutes);

app.use("/auth/admin", adminRoutes);
app.use('/admin', adminDashboard)
app.use('/profileManagement', profileManagement)
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});