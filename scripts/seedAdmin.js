import mongoose from "mongoose";
import { loadEnv } from "../config/env.js";
import Admin from "../models/Admin.js";
import connectDB from "../config/database.js";

// Cargar variables de entorno PRIMERO
loadEnv();

const seedAdmin = async () => {
  console.log("🌱 Iniciando seed de admin...");

  try {
    await connectDB();

    // Verificar si ya existe
    const existing = await Admin.findOne({ username: "admin" });
    if (existing) {
      console.log('⚠️ El usuario "admin" ya existe');
      console.log("💡 Para resetear, elimina el documento manualmente o usa:");
      console.log("   db.admins.deleteMany({})");
      process.exit(0);
    }

    // Crear admin
    const admin = await Admin.create({
      username: "admin",
      password: "admin123", // Se encriptará con bcrypt automáticamente
      nombre: "Administrador Principal",
      email: "admin@pebose.edu",
      rol: "superadmin",
      activo: true,
    });

    console.log("✅ Admin creado exitosamente:");
    console.log("   👤 Usuario: admin");
    console.log("   🔑 Contraseña: admin123");
    console.log("   🔄 Cambia la contraseña después del primer login");
  } catch (error) {
    console.error("❌ Error en seed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Conexión cerrada");
    process.exit(0);
  }
};

seedAdmin();
