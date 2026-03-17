import mongoose from "mongoose";
import { loadEnv } from "./env.js";

// Cargar variables ANTES de usarlas
loadEnv();

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error(
        "❌ MONGODB_URI no está definida. Revisa tu archivo .env",
      );
    }

    await mongoose.connect(uri);
    console.log("✅ MongoDB conectado");

    // Optional: Log de conexión para debug
    if (process.env.NODE_ENV === "development") {
      console.log("📡 MongoDB:", uri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@"));
    }
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;
