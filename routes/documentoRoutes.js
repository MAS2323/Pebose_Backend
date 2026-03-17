import express from "express";
import multer from "multer"; // 1. IMPORTAR MULTER
import { protect } from "../middleware/auth.js";
import {
  uploadDocumento,
  getDocumentosByUser,
  getAllDocumentos,
  getDocumentoById,
  updateDocumento,
  deleteDocumento,
  getDocumentosStats,
} from "../controllers/documentoController.js";

const router = express.Router();

// 2. CONFIGURAR MULTER (Guarda temporalmente en carpeta 'uploads')
const upload = multer({ dest: "uploads/" });

// --- RUTAS PÚBLICAS ---

// ✅ CORRECCIÓN:
// - Usamos upload.single("documento") para procesar el archivo.
// - El nombre "documento" debe coincidir con data.append("documento", ...) del frontend.
// - Solo llamamos a uploadDocumento UNA vez.
router.post("/upload", upload.single("documento"), uploadDocumento);

router.get("/user/:email", getDocumentosByUser);

// --- RUTAS PROTEGIDAS (ADMIN) ---
router.use(protect);

router.get("/", getAllDocumentos);
router.get("/stats", getDocumentosStats);
router.get("/:id", getDocumentoById);
router.patch("/:id", updateDocumento);
router.delete("/:id", deleteDocumento);

export default router;
