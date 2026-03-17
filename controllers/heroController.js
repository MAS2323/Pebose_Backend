import mongoose from "mongoose";
import HeroSlide from "../models/HeroSlide.js";
import { deleteImage } from "../config/cloudinary.js";

// ✅ GET público - Para tu frontend React
export const getPublicSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find({ activo: true })
      .sort({ orden: 1, createdAt: -1 })
      .select("titulo subtitulo imagen_url orden")
      .lean();

    res.status(200).json({
      success: true,
      count: slides.length,
      data: slides,
    });
  } catch (error) {
    console.error("❌ Error obteniendo slides:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
};

// ✅ GET todos - Para admin panel
export const getAllSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find()
      .sort({ orden: 1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: slides.length,
      data: slides,
    });
  } catch (error) {
    console.error("❌ Error obteniendo slides:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};

// ✅ POST - Crear slide (debe devolver URL de Cloudinary, NO ruta local)
export const createSlide = async (req, res) => {
  try {
    // Manejar tanto JSON como FormData
    let { titulo, subtitulo, orden, activo, imagen_url, imagen_public_id } =
      req.body;

    // Si es FormData, los campos vienen como strings
    if (typeof orden === "string") orden = parseInt(orden);
    if (typeof activo === "string") activo = activo === "true";

    // Si se subió imagen via multer, usar esa
    if (req.file) {
      imagen_url = req.file.path;
      imagen_public_id = req.file.filename;
    }

    // Validar que tenemos la imagen
    if (!imagen_url || !imagen_public_id) {
      return res.status(400).json({
        success: false,
        message: "La imagen es obligatoria (imagen_url y imagen_public_id)",
      });
    }

    const newSlide = await HeroSlide.create({
      titulo: titulo?.trim(),
      subtitulo: subtitulo?.trim(),
      imagen_url,
      imagen_public_id,
      orden: orden || 0,
      activo: activo ?? true,
    });

    res.status(201).json({
      success: true,
      message: "Slide creado exitosamente",
      newSlide,
    });
  } catch (error) {
    console.error("❌ Error creando slide:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Error creando el slide",
    });
  }
};
// ✅ PUT - Actualizar slide
export const updateSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, subtitulo, orden, activo } = req.body;

    const updateData = {
      ...(titulo && { titulo: titulo.trim() }),
      ...(subtitulo && { subtitulo: subtitulo.trim() }),
      ...(orden !== undefined && { orden: parseInt(orden) }),
      ...(activo !== undefined && { activo }),
    };

    if (req.file) {
      const slide = await HeroSlide.findById(id);
      if (slide?.imagen_public_id) {
        await deleteImage(slide.imagen_public_id).catch(console.error);
      }
      updateData.imagen_url = req.file.path;
      updateData.imagen_public_id = req.file.filename;
    }

    const updatedSlide = await HeroSlide.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedSlide) {
      return res.status(404).json({
        success: false,
        message: "Slide no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      message: "Slide actualizado exitosamente",
      data: updatedSlide,
    });
  } catch (error) {
    console.error("❌ Error actualizando slide:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Error actualizando el slide",
    });
  }
};

// ✅ DELETE - Eliminar slide
export const deleteSlide = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Backend SÍ puede validar con mongoose
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de slide inválido",
      });
    }

    const slide = await HeroSlide.findByIdAndDelete(id);

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: "Slide no encontrado",
      });
    }

    // Eliminar imagen de Cloudinary
    if (slide.imagen_public_id) {
      await deleteImage(slide.imagen_public_id).catch(console.error);
    }

    res.status(200).json({
      success: true,
      message: "Slide eliminado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error eliminando slide:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error eliminando el slide",
    });
  }
};

// ✅ PATCH - Reordenar slides
export const reorderSlides = async (req, res) => {
  try {
    const { slides } = req.body;

    if (!Array.isArray(slides)) {
      return res.status(400).json({
        success: false,
        message: "Se requiere un array de slides",
      });
    }

    const bulkOps = slides.map(({ id, orden }) => ({
      updateOne: {
        filter: { _id: id },
        update: { orden },
      },
    }));

    await HeroSlide.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: "Orden actualizado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error reordenando slides:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Error reordenando slides",
    });
  }
};
