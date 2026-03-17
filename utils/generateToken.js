// backend/utils/generateToken.js
import jwt from "jsonwebtoken";

/**
 * Genera un token JWT para autenticación de administrador
 * @param {string} adminId - ID del administrador
 * @returns {string} Token JWT firmado
 */
export const generateToken = (adminId) => {
  return jwt.sign({ id: adminId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
    issuer: "pebose-api",
    audience: "pebose-admin",
  });
};

// Exportación por defecto (opcional, para compatibilidad)
export default generateToken;
