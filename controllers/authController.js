import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { generateToken } from "../utils/generateToken.js";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Usuario y contraseña son requeridos",
      });
    }

    const admin = await Admin.findOne({ username }).select("+password");

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    if (!admin.activo) {
      return res.status(403).json({
        success: false,
        message: "Cuenta desactivada - Contacta al administrador",
      });
    }

    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      message: "Login exitoso",
      data: {
        admin: {
          id: admin._id,
          username: admin.username,
          nombre: admin.nombre,
          email: admin.email,
          rol: admin.rol,
        },
        token,
      },
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("-password");

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    console.error("❌ Error obteniendo perfil:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
};

export const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Sesión cerrada exitosamente",
  });
};
