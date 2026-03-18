import express from "express";
import {
  getPublicSlides,
  getAllSlides,
  createSlide,
  updateSlide,
  deleteSlide,
  reorderSlides,
} from "../controllers/heroController.js";
import { protect } from "../middleware/auth.js";
import { uploadHero } from "../middleware/upload.js";

const router = express.Router();

// 🌐 Públicas
router.get("/public", getPublicSlides);

// 🔐 Protegidas (Admin)
router.use(protect);

router.get("/slides", getAllSlides);
router.post("/slides", uploadHero, createSlide);
router.put("/slides/:id", uploadHero, updateSlide);
router.delete("/slides/:id", deleteSlide);
router.patch("/reorder", reorderSlides);

export default router;
