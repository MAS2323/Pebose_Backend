// backend/middleware/uploadDocumento.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Configuración CORRECTA para documentos
const documentoStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const extension = file.originalname.split(".").pop().toLowerCase();

    // Determinar resource_type según el tipo de archivo
    let resourceType = "raw"; // Para PDFs, DOCs, ZIPs
    let folder = "pebose/documentos";

    // Si es imagen, usar resource_type 'image'
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
      resourceType = "image";
      folder = "pebose/documentos-imagenes";
    }

    return {
      folder,
      resource_type: resourceType, // ← Importante: 'raw' o 'image'
      allowed_formats: [
        "pdf",
        "doc",
        "docx",
        "jpg",
        "jpeg",
        "png",
        "zip",
        "rar",
      ],
      public_id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      format: extension,
    };
  },
});

const documentoFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|zip|rar/;
  const isValidType =
    allowedTypes.test(file.mimetype) ||
    allowedTypes.test(file.originalname.toLowerCase().split(".").pop());

  if (isValidType) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Tipo de archivo no permitido. Solo: PDF, DOC, DOCX, JPG, PNG, ZIP, RAR",
      ),
      false,
    );
  }
};

export const uploadDocumento = multer({
  storage: documentoStorage,
  fileFilter: documentoFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
}).single("documento");

export default uploadDocumento;
