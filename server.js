// backend/server.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { loadEnv } from "./config/env.js";

// 🔑 Cargar variables de entorno PRIMERO
loadEnv();
dotenv.config();

// 🗄️ Conectar a MongoDB
import connectDB from "./config/database.js";
connectDB();

// 🛣️ Importar rutas (con .js y accediendo a .default si es necesario)
import authRoutes from "./routes/authRoutes.js";
import heroRoutes from "./routes/heroRoutes.js";
import instalacionesRoutes from "./routes/instalacionesRoutes.js";
import especialidadRoutes from "./routes/especialidadRoutes.js";
import documentoRoutes from "./routes/documentoRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { protect } from "./middleware/auth.js";

const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors());
// 🛡️ Security middleware
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production",
  }),
);

// ⚡ Rate limiting para endpoints públicos
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite por IP
  message: {
    success: false,
    message: "Demasiadas solicitudes, intenta más tarde",
  },
});

// 🌐 CORS configuration
const frontendUrls = process.env.FRONTEND_URL?.split(",") || [
  "http://localhost:5173",
];
// Middleware CORS (Debe estar ANTES de las rutas)
app.use(
  cors({
    origin: [
      "http://xn--centrobilingepebose-hbc.com/",
      "https://pebose-backend.onrender.com",
    ], // Añade tu frontend si lo tienes deployado
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// 📦 Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 🏷️ Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// 🛣️ Register routes
// ✅ Forma correcta: import directo con export default
app.use("/api/auth", apiLimiter, authRoutes);
app.use("/api/hero", apiLimiter, heroRoutes);
app.use("/api/instalaciones", apiLimiter, instalacionesRoutes);
app.use("/api/especialidades", apiLimiter, especialidadRoutes);
app.use("/api/documentos", apiLimiter, documentoRoutes);
app.use("/api/admin", protect, adminRoutes);

// ❌ 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// 🐛 Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "El archivo excede el tamaño máximo de 5MB",
    });
  }

  // Multer general errors
  if (err.type === "file" || err.type === "field") {
    return res.status(400).json({
      success: false,
      message: `Error de subida: ${err.message}`,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Token inválido",
    });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expirado",
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Error interno del servidor",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      error: err,
    }),
  });
});

// 🎧 Start server
app.listen(PORT, () => {
  console.log("\n" + "═".repeat(50));
  console.log("🚀 PEBOSE Backend - Servidor iniciado");
  console.log("📡 Puerto:", PORT);
  console.log("🌍 Entorno:", process.env.NODE_ENV || "development");
  console.log("═".repeat(50));
  console.log("📋 Endpoints disponibles:");
  console.log("   🔐 POST /api/auth/login");
  console.log("   🎨 GET  /api/hero/public");
  console.log("   🏢 GET  /api/instalaciones/public");
  console.log("   💓 GET  /api/health");
  console.log("═".repeat(50) + "\n");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Cerrando servidor...");
  await import("mongoose").then((m) => m.default.connection.close());
  console.log("🔌 MongoDB desconectado");
  process.exit(0);
});
