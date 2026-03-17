// backend/models/Especialidad.js
import mongoose from "mongoose";

const especialidadSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre de la especialidad es obligatorio"],
      trim: true,
      unique: true,
      maxlength: [100, "El nombre no puede exceder 100 caracteres"],
    },
    categoria: {
      type: String,
      required: [true, "La categoría es obligatoria"],
      enum: [
        "Salud",
        "Administración",
        "Comercio",
        "Tecnología",
        "Servicios",
        "Idiomas",
        "Técnica",
        "Diseño",
        "Otros",
      ],
    },
    duracion: {
      type: String,
      required: [true, "La duración es obligatoria"],
      trim: true,
    },
    icono: {
      type: String,
      required: [true, "El icono es obligatorio"],
      trim: true,
      description:
        "Nombre del icono de lucide-react (ej: Stethoscope, FlaskConical)",
    },
    descripcion: {
      type: String,
      required: [true, "La descripción es obligatoria"],
      trim: true,
      maxlength: [500, "La descripción no puede exceder 500 caracteres"],
    },
    imagen_url: {
      type: String,
      required: [true, "La imagen es obligatoria"],
    },
    imagen_public_id: {
      type: String,
      required: true,
    },
    modulos: [
      {
        type: String,
        trim: true,
      },
    ],
    salidaLaboral: [
      {
        type: String,
        trim: true,
      },
    ],
    requisitos: [
      {
        type: String,
        trim: true,
      },
    ],
    horarios: [
      {
        type: String,
        trim: true,
      },
    ],
    precio: {
      type: String,
      trim: true,
      default: "Consultar en administración",
    },
    proximoInicio: {
      type: String,
      trim: true,
    },
    // Campos opcionales avanzados
    perfilIngreso: [
      {
        type: String,
        trim: true,
      },
    ],
    perfilEgreso: [
      {
        type: String,
        trim: true,
      },
    ],
    competencias: [
      {
        type: String,
        trim: true,
      },
    ],
    metodologia: [
      {
        type: String,
        trim: true,
      },
    ],
    evaluacion: [
      {
        type: String,
        trim: true,
      },
    ],
    titulacion: {
      type: String,
      trim: true,
    },
    // Metadatos
    orden: {
      type: Number,
      default: 0,
    },
    activo: {
      type: Boolean,
      default: true,
    },
    destacado: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Índices para búsquedas eficientes
especialidadSchema.index({ categoria: 1, orden: 1 });
especialidadSchema.index({ nombre: "text", descripcion: "text" });

// Virtual para URL completa (opcional)
especialidadSchema.virtual("url").get(function () {
  return `/ceep/especialidad/${this._id}`;
});

export default mongoose.model("Especialidad", especialidadSchema);
