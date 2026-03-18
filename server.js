// backend/server.js

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { loadEnv } from "./config/env.js"; // si lo usas, sino quítalo
import connectDB from "./config/database.js";

// Rutas
import authRoutes from "./routes/authRoutes.js";
import heroRoutes from "./routes/heroRoutes.js";
import instalacionesRoutes from "./routes/instalacionesRoutes.js";
import especialidadRoutes from "./routes/especialidadRoutes.js";
import documentoRoutes from "./routes/documentoRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { protect } from "./middleware/auth.js";

const app = express();

dotenv.config(); // Carga .env (o usa loadEnv si es custom)
const PORT = process.env.PORT || 4000;

// Lista de orígenes permitidos – agrega variaciones comunes
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://xn--centrobilingepebose-hbc.com",
  "https://www.xn--centrobilingepebose-hbc.com", // por si usas www
  // Si pruebas con dominio temporal de Railway: "https://tu-proyecto.up.railway.app"
];

// ────────────────────────────────────────────────
// CORS: Lo más arriba posible
// ────────────────────────────────────────────────
// En server.js
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        "https://xn--centrobilingepebose-hbc.com",
        "https://www.xn--centrobilingepebose-hbc.com",
      ];
      if (!origin || allowed.includes(origin)) {
        callback(null, origin);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.options("*", cors());

// ────────────────────────────────────────────────
// Middlewares adicionales
// ────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Demasiadas solicitudes, espera un momento",
  },
});

// Health check simple para verificar que el servidor responde
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Servidor PEBOSE activo 🚀",
    timestamp: new Date().toISOString(),
  });
});

// Rutas protegidas con limiter
app.use("/api/auth", apiLimiter, authRoutes);
app.use("/api/hero", apiLimiter, heroRoutes);
app.use("/api/instalaciones", apiLimiter, instalacionesRoutes);
app.use("/api/especialidades", apiLimiter, especialidadRoutes);
app.use("/api/documentos", apiLimiter, documentoRoutes);
app.use("/api/admin", protect, adminRoutes);

// 404 y errores
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error("[ERROR GLOBAL]:", err.message, err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Error interno del servidor",
  });
});

// Inicio del servidor: DB primero
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB conectado");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error al iniciar:", err);
    process.exit(1);
  }
};

startServer();

export default app;
