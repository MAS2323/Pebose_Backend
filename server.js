// backend/server.js

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

// Carga variables de entorno temprano
loadEnv(); // o dotenv.config() si lo usas directamente

const PORT = process.env.PORT || 4000;

// ────────────────────────────────────────────────
// 🌐 CORS CONFIGURACIÓN ROBUSTA PARA RAILWAY + CREDENCIALES
// ────────────────────────────────────────────────
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Lista de orígenes permitidos (agrega tu frontend de Railway si tiene .railway.app temporal)
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://xn--centrobilingepebose-hbc.com",
    "https://www.xn--centrobilingepebose-hbc.com",
    // Si usas el dominio temporal de Railway para pruebas: "https://tu-proyecto.railway.app"
  ];

  // Refleja el origin exacto si está permitido (necesario con credentials: true)
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (!origin) {
    // Permite requests sin origin (Postman, curl, mobile)
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Accept, X-Requested-With",
  );

  // Manejo inmediato de preflight OPTIONS (muy importante para uploads multipart)
  if (req.method === "OPTIONS") {
    console.log(`Preflight OPTIONS desde origin: ${origin || "sin origin"}`);
    return res.sendStatus(204);
  }

  next();
});

// Alternativa con paquete cors (puedes usar una o la otra; el manual arriba es más controlable)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowed = [
        "http://localhost:5173",
        "https://xn--centrobilingepebose-hbc.com",
        "https://www.xn--centrobilingepebose-hbc.com",
      ];

      if (allowed.includes(origin)) {
        callback(null, origin);
      } else {
        callback(null, false); // o callback(new Error("Not allowed"))
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  }),
);

// ────────────────────────────────────────────────
// OTROS MIDDLEWARES (después de CORS)
// ────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: {
    success: false,
    message: "Demasiadas solicitudes, intenta más tarde",
  },
});

// Health check (para verificar que el servidor vive)
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Servidor PEBOSE funcionando 🚀 en Railway",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
  });
});

// Rutas API
app.use("/api/auth", apiLimiter, authRoutes);
app.use("/api/hero", apiLimiter, heroRoutes);
app.use("/api/instalaciones", apiLimiter, instalacionesRoutes);
app.use("/api/especialidades", apiLimiter, especialidadRoutes);
app.use("/api/documentos", apiLimiter, documentoRoutes);
app.use("/api/admin", protect, adminRoutes);

// ────────────────────────────────────────────────
// ERROR HANDLERS (al final)
// ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error("❌ Error global:", err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Error interno del servidor",
  });
});

// ────────────────────────────────────────────────
// INICIO: CONECTA DB PRIMERO, LUEGO LISTEN
// ────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ Base de datos conectada correctamente");

    app.listen(PORT, () => {
      console.log(
        `🚀 Servidor corriendo en puerto ${PORT} - Entorno: ${process.env.NODE_ENV || "development"}`,
      );
    });
  } catch (err) {
    console.error("❌ Falló al iniciar servidor (problema con DB):", err);
    process.exit(1); // Railway reiniciará automáticamente si falla
  }
};

startServer();

export default app;
