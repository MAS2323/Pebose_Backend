// backend/routes/adminRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import Documento from "../models/Documento.js";
// ✅ IMPORTAR HeroSlide si lo vas a usar:
import HeroSlide from "../models/HeroSlide.js";

const router = express.Router();

// ✅ Endpoint de estadísticas para dashboard
router.get("/stats", protect, async (req, res) => {
  try {
    // ✅ Ahora HeroSlide está definido porque lo importamos arriba
    const totalSlides = await HeroSlide.countDocuments({ activo: true });

    // Ejemplo con Documentos (si quieres usarlo):
    // const totalDocumentos = await Documento.countDocuments({ activo: true });

    res.json({
      success: true,
      data: {
        // ← Clave "data" requerida
        stats: {
          contactos_pendientes: 0, // totalContactos || 0
          inscripciones_mes: 0,
          visitas_web: 0,
          especialidades_activas: totalSlides, // ← Ahora funciona
        },
      },
    });
  } catch (error) {
    console.error("❌ Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
});

export default router;
