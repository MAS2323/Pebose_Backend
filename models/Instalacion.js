import mongoose from "mongoose";

const instalacionSchema = new mongoose.Schema(
  {
    categoria: {
      type: String,
      required: [true, "La categoría es obligatoria"],
      trim: true,
      enum: ["Aulas", "Laboratorios", "Deportes", "Biblioteca", "Otros"],
    },
    titulo: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
      maxlength: [100, "El título no puede exceder 100 caracteres"],
    },
    descripcion: {
      type: String,
      required: [true, "La descripción es obligatoria"],
      trim: true,
      maxlength: [500, "La descripción no puede exceder 500 caracteres"],
    },
    imagenes: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
        orden: { type: Number, default: 0 },
      },
    ],
    caracteristicas: [
      {
        type: String,
        trim: true,
      },
    ],
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
  },
);

instalacionSchema.index({ categoria: 1, orden: 1 });

export default mongoose.model("Instalacion", instalacionSchema);
