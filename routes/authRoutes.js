import express from "express";
import { login, getProfile, logout } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.get("/profile", protect, getProfile);
router.post("/logout", protect, logout);
router.post("/admin/login", login);
export default router;
