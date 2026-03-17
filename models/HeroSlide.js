import mongoose from "mongoose";

const heroSlideSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
      maxlength: [100, "El título no puede exceder 100 caracteres"],
    },
    subtitulo: {
      type: String,
      trim: true,
      maxlength: [200, "El subtítulo no puede exceder 200 caracteres"],
    },
    imagen_url: {
      type: String,
      required: [true, "La URL de la imagen es obligatoria"],
    },
    imagen_public_id: {
      type: String,
      required: true,
    },
    orden: {
      type: Number,
      default: 0,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

heroSlideSchema.index({ orden: 1, activo: 1 });

export default mongoose.model("HeroSlide", heroSlideSchema);
