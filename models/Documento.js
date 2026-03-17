// backend/models/Documento.js
import mongoose from "mongoose";

const documentoSchema = new mongoose.Schema(
  {
    // Información del archivo
    nombreOriginal: {
      type: String,
      required: [true, "El nombre del archivo es obligatorio"],
      trim: true,
    },
    nombreServidor: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
      unique: true,
    },
    tipo: {
      type: String,
      required: true,
      enum: ["pdf", "doc", "docx", "jpg", "jpeg", "png", "zip", "rar", "other"],
    },
    tamaño: {
      type: Number, // en bytes
      required: true,
    },

    // Información del usuario/solicitud
    nombreUsuario: {
      type: String,
      required: [true, "El nombre del usuario es obligatorio"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      lowercase: true,
      trim: true,
    },
    telefono: {
      type: String,
      trim: true,
    },

    // Categoría del documento
    categoria: {
      type: String,
      required: [true, "La categoría es obligatoria"],
      enum: [
        "documentacion_personal",
        "credenciales",
        "certificados",
        "solicitud_inscripcion",
        "otros",
      ],
    },

    // Especialidad relacionada (opcional)
    especialidad: {
      type: String,
      trim: true,
    },

    // Estado del documento
    estado: {
      type: String,
      enum: ["pendiente", "revisado", "aprobado", "rechazado"],
      default: "pendiente",
    },

    // Notas del admin
    notas: {
      type: String,
      trim: true,
    },

    // Metadatos
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Índices para búsquedas eficientes
documentoSchema.index({ email: 1, createdAt: -1 });
documentoSchema.index({ categoria: 1, estado: 1 });
documentoSchema.index({ especialidad: 1 });

export default mongoose.model("Documento", documentoSchema);
