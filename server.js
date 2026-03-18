// backend/server.js - Solo cambia la sección de CORS

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { loadEnv } from "./config/env.js";
import connectDB from "./config/database.js";

// Importar rutas
import authRoutes from "./routes/authRoutes.js";
import heroRoutes from "./routes/heroRoutes.js";
import instalacionesRoutes from "./routes/instalacionesRoutes.js";
import especialidadRoutes from "./routes/especialidadRoutes.js";
import documentoRoutes from "./routes/documentoRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { protect } from "./middleware/auth.js";

const app = express();
const PORT = process.env.PORT || 4000;

// 🌐 CORS PERMISSIVE - Como en tu código que funciona
app.use(cors());

// O si necesitas credentials, usa:
// app.use(cors({
//   origin: true,
//   credentials: true
// }));

// Resto de tu código...
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Demasiadas solicitudes" },
});

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Servidor PEBOSE funcionando 🚀",
    timestamp: new Date().toISOString(),
  });
});

// Rutas API
app.use("/api/auth", apiLimiter, authRoutes);
app.use("/api/hero", apiLimiter, heroRoutes);
app.use("/api/instalaciones", apiLimiter, instalacionesRoutes);
app.use("/api/especialidades", apiLimiter, especialidadRoutes);
app.use("/api/documentos", apiLimiter, documentoRoutes);
app.use("/api/admin", protect, adminRoutes);

// Error handlers
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Error interno del servidor",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

export default app;
