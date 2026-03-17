// backend/routes/especialidadRoutes.js
import express from "express";
import {
  getPublicEspecialidades,
  getEspecialidadById,
  getAllEspecialidades,
  createEspecialidad,
  updateEspecialidad,
  deleteEspecialidad,
  reorderEspecialidades,
} from "../controllers/especialidadController.js";
import { protect } from "../middleware/auth.js";
import { uploadEspecialidad } from "../middleware/upload.js"; // ← Importar

const router = express.Router();

// 🌐 PÚBLICAS
router.get("/public", getPublicEspecialidades);
router.get("/public/:id", getEspecialidadById);

// 🔐 ADMIN
router.use(protect);

router.get("/", getAllEspecialidades);

// ✅ Usar uploadEspecialidad (que ya es .single('imagen'))
router.post("/", uploadEspecialidad, createEspecialidad);
router.put("/:id", uploadEspecialidad, updateEspecialidad);

router.delete("/:id", deleteEspecialidad);
router.patch("/reorder", reorderEspecialidades);

export default router;
