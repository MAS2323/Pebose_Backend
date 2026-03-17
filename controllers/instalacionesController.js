import Instalacion from "../models/Instalacion.js";
import { deleteImage } from "../config/cloudinary.js";

// ✅ GET público - Para frontend
export const getPublicInstalaciones = async (req, res) => {
  try {
    const { categoria } = req.query;

    const query = { activo: true };
    if (categoria) query.categoria = categoria;

    const instalaciones = await Instalacion.find(query)
      .sort({ orden: 1, createdAt: -1 })
      .select("-__v")
      .lean();

    res.status(200).json({
      success: true,
      count: instalaciones.length,
      data: instalaciones,
    });
  } catch (error) {
    console.error("❌ Error obteniendo instalaciones:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
};

// ✅ GET todos - Para admin
export const getAllInstalaciones = async (req, res) => {
  try {
    const instalaciones = await Instalacion.find()
      .sort({ orden: 1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: instalaciones.length,
      data: instalaciones,
    });
  } catch (error) {
    console.error("❌ Error obteniendo instalaciones:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};

// ✅ POST - Crear instalación
export const createInstalacion = async (req, res) => {
  try {
    const {
      categoria,
      titulo,
      descripcion,
      caracteristicas,
      orden,
      destacado,
    } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Al menos una imagen es obligatoria",
      });
    }

    const imagenes = req.files.map((file, index) => ({
      url: file.path,
      public_id: file.filename,
      orden: index,
    }));

    const newInstalacion = await Instalacion.create({
      categoria,
      titulo: titulo?.trim(),
      descripcion: descripcion?.trim(),
      caracteristicas: caracteristicas ? JSON.parse(caracteristicas) : [],
      imagenes,
      orden: orden ? parseInt(orden) : 0,
      destacado: destacado === "true",
    });

    res.status(201).json({
      success: true,
      message: "Instalación creada exitosamente",
      data: newInstalacion,
    });
  } catch (error) {
    if (req.files?.length) {
      for (const file of req.files) {
        await deleteImage(file.filename).catch(console.error);
      }
    }
    console.error("❌ Error creando instalación:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Error creando la instalación",
    });
  }
};

// ✅ PUT - Actualizar instalación
export const updateInstalacion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      categoria,
      titulo,
      descripcion,
      caracteristicas,
      orden,
      activo,
      destacado,
    } = req.body;

    const instalacion = await Instalacion.findById(id);
    if (!instalacion) {
      return res.status(404).json({
        success: false,
        message: "Instalación no encontrada",
      });
    }

    const updateData = {
      ...(categoria && { categoria }),
      ...(titulo && { titulo: titulo.trim() }),
      ...(descripcion && { descripcion: descripcion.trim() }),
      ...(caracteristicas && { caracteristicas: JSON.parse(caracteristicas) }),
      ...(orden !== undefined && { orden: parseInt(orden) }),
      ...(activo !== undefined && { activo: activo === "true" }),
      ...(destacado !== undefined && { destacado: destacado === "true" }),
    };

    // Manejar nuevas imágenes
    if (req.files?.length) {
      // Eliminar imágenes antiguas
      for (const img of instalacion.imagenes) {
        if (img.public_id) {
          await deleteImage(img.public_id).catch(console.error);
        }
      }

      updateData.imagenes = req.files.map((file, index) => ({
        url: file.path,
        public_id: file.filename,
        orden: index,
      }));
    }

    const updatedInstalacion = await Instalacion.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: "Instalación actualizada exitosamente",
      data: updatedInstalacion,
    });
  } catch (error) {
    console.error("❌ Error actualizando instalación:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Error actualizando la instalación",
    });
  }
};

// ✅ DELETE - Eliminar instalación
export const deleteInstalacion = async (req, res) => {
  try {
    const { id } = req.params;

    const instalacion = await Instalacion.findByIdAndDelete(id);

    if (!instalacion) {
      return res.status(404).json({
        success: false,
        message: "Instalación no encontrada",
      });
    }

    // Eliminar imágenes de Cloudinary
    for (const img of instalacion.imagenes) {
      if (img.public_id) {
        await deleteImage(img.public_id).catch(console.error);
      }
    }

    res.status(200).json({
      success: true,
      message: "Instalación eliminada exitosamente",
    });
  } catch (error) {
    console.error("❌ Error eliminando instalación:", error);
    res.status(500).json({
      success: false,
      message: "Error eliminando la instalación",
    });
  }
};
