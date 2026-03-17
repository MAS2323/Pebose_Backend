import express from "express";
import {
  getPublicInstalaciones,
  getAllInstalaciones,
  createInstalacion,
  updateInstalacion,
  deleteInstalacion,
} from "../controllers/instalacionesController.js";
import { protect } from "../middleware/auth.js";
import { uploadInstalacion } from "../middleware/upload.js";

const router = express.Router();

// 🌐 Públicas
router.get("/public", getPublicInstalaciones);

// 🔐 Protegidas (Admin)
router.use(protect);

router.get("/", getAllInstalaciones);
router.post("/", uploadInstalacion, createInstalacion);
router.put("/:id", uploadInstalacion, updateInstalacion);
router.delete("/:id", deleteInstalacion);

export default router;
