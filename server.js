import express from "express";
import db from "./config/db.js";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/student_routes/auth.routes.js";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import homeRoutes from "./routes/student_routes/home.routes.js";

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});