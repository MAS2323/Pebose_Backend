import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");

// Cargar variables según el entorno
export const loadEnv = () => {
  const env = process.env.NODE_ENV || "development";
  const envPath = resolve(__dirname, `../.env.${env}`);

  // Intentar cargar .env.local primero, luego .env, luego .env.{environment}
  config({ path: resolve(__dirname, "../.env.local") });
  config({ path: resolve(__dirname, "../.env") });
  config({ path: envPath });

  // Validar variables críticas
  const required = ["MONGODB_URI", "CLOUDINARY_CLOUD_NAME", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn("⚠️ Variables de entorno faltantes:", missing.join(", "));
    console.warn("💡 Revisa tu archivo .env");
  }
};

export default loadEnv;
