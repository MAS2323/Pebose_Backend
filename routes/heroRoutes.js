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

router.get("/", getAllSlides);
router.post("/", uploadHero, createSlide);
router.put("/:id", uploadHero, updateSlide);
router.delete("/:id", deleteSlide);
router.patch("/reorder", reorderSlides);

export default router;
