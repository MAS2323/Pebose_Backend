import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No autorizado - Token requerido",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await Admin.findById(decoded.id).select("+password");

    if (!req.admin || !req.admin.activo) {
      return res.status(401).json({
        success: false,
        message: "No autorizado - Usuario no válido",
      });
    }

    next();
  } catch (error) {
    console.error("❌ Error en auth middleware:", error);
    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado",
    });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.admin?.rol !== "superadmin" && req.admin?.rol !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Acceso denegado - Requiere rol de administrador",
    });
  }
  next();
};
