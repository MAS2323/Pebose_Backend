import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { loadEnv } from "./config/env.js";

// 🔑 Cargar variables de entorno
loadEnv();
dotenv.config();

// 🗄️ Conectar a MongoDB
import connectDB from "./config/database.js";
connectDB();

// ️ Importar rutas
import authRoutes from "./routes/authRoutes.js";
import heroRoutes from "./routes/heroRoutes.js";
import instalacionesRoutes from "./routes/instalacionesRoutes.js";
import especialidadRoutes from "./routes/especialidadRoutes.js";
import documentoRoutes from "./routes/documentoRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { protect } from "./middleware/auth.js";

const app = express();
const PORT = process.env.PORT || 4000;

// 🌐 CONFIGURACIÓN CORS CORREGIDA
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://xn--centrobilingepebose-hbc.com", // ✅ Codificado correctamente (ü → u)
  "https://www.xn--centrobilingepebose-hbc.com", // ✅ Con www
  "https://pebose-backend.onrender.com", // ✅ Sin espacio al final
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("🔍 Origen recibido:", origin); // DEBUG
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ CORS bloqueado para origen:", origin);
        callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// 🛡️ Security middleware
app.use(helmet({ contentSecurityPolicy: false }));

// ⚡ Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Demasiadas solicitudes" },
});

// 📦 Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 🏷️ Health check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Servidor CEEP funcionando 🚀",
    timestamp: new Date().toISOString(),
    endpoints: {
      login: "/api/auth/login",
      docs: "/api/documentos/upload",
    },
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 🛣️ Register routes (TODOS CON /api)
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
  console.error("❌ Error global:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Error interno del servidor",
  });
});

// 🎧 Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || "development"}`);
  console.log(`✅ Rutas montadas con prefijo: /api`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Cerrando servidor...");
  const mongoose = await import("mongoose");
  await mongoose.default.connection.close();
  process.exit(0);
});

export default app;
