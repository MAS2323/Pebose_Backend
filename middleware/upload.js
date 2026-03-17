// backend/middleware/upload.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

/**
 * Crea configuración de almacenamiento para Cloudinary
 * @param {string} folder - Subcarpeta dentro de CLOUDINARY_UPLOAD_FOLDER
 */
const createStorage = (folder) => {
  return new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder: `${process.env.CLOUDINARY_UPLOAD_FOLDER || "pebose"}/${folder}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [
        { width: 1920, height: 1080, crop: "limit" },
        { quality: "auto:good" },
      ],
      public_id: `${folder}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    }),
  });
};

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = /jpeg|jpg|png|webp/;
  const isValidMimeType = allowedMimeTypes.test(file.mimetype);
  const isValidExtension = allowedMimeTypes.test(
    file.originalname.toLowerCase(),
  );

  if (isValidMimeType && isValidExtension) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes: JPG, JPEG, PNG, WebP"), false);
  }
};

// ============================================================================
// 🎨 UPLOAD PARA HERO SLIDER (1 imagen)
// ============================================================================
export const uploadHero = multer({
  storage: createStorage("hero"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("imagen");

// ============================================================================
// 🏢 UPLOAD PARA INSTALACIONES (múltiples imágenes)
// ============================================================================
export const uploadInstalacion = multer({
  storage: createStorage("instalaciones"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
}).array("imagenes", 10);

// ============================================================================
// 🎓 UPLOAD PARA ESPECIALIDADES (1 imagen) ← NUEVO
// ============================================================================
export const uploadEspecialidad = multer({
  storage: createStorage("especialidades"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("imagen");

// ============================================================================
// 📦 UPLOAD GENÉRICO
// ============================================================================
export const createUploader = (folder, fieldName = "file", maxFiles = 1) => {
  const config = {
    storage: createStorage(folder),
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024,
      ...(maxFiles > 1 && { files: maxFiles }),
    },
  };
  return maxFiles === 1
    ? multer(config).single(fieldName)
    : multer(config).array(fieldName, maxFiles);
};

// Exportación por defecto (actualizada)
export default {
  uploadHero,
  uploadInstalacion,
  uploadEspecialidad, // ← Agregado
  createUploader,
};
