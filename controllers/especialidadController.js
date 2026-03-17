// backend/controllers/especialidadController.js
import Especialidad from "../models/Especialidad.js";
import { deleteImage } from "../config/cloudinary.js";

// ✅ GET público - Para frontend (sin autenticación)
export const getPublicEspecialidades = async (req, res) => {
  try {
    const { categoria, search } = req.query;

    const query = { activo: true };
    if (categoria) query.categoria = categoria;
    if (search) {
      query.$or = [
        { nombre: { $regex: search, $options: "i" } },
        { descripcion: { $regex: search, $options: "i" } },
      ];
    }

    const especialidades = await Especialidad.find(query)
      .sort({ orden: 1, nombre: 1 })
      .select("-__v -imagen_public_id")
      .lean();

    res.status(200).json({
      success: true,
      count: especialidades.length,
      data: especialidades,
    });
  } catch (error) {
    console.error("❌ Error obteniendo especialidades públicas:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
};

// ✅ GET por ID - Público
export const getEspecialidadById = async (req, res) => {
  try {
    const { id } = req.params;

    const especialidad = await Especialidad.findOne({ _id: id, activo: true })
      .select("-__v -imagen_public_id")
      .lean();

    if (!especialidad) {
      return res.status(404).json({
        success: false,
        message: "Especialidad no encontrada",
      });
    }

    res.status(200).json({
      success: true,
      data: especialidad,
    });
  } catch (error) {
    console.error("❌ Error obteniendo especialidad:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
};

// ✅ GET todas - Para admin (protegido)
export const getAllEspecialidades = async (req, res) => {
  try {
    const { categoria, activo } = req.query;

    const query = {};
    if (categoria) query.categoria = categoria;
    if (activo !== undefined) query.activo = activo === "true";

    const especialidades = await Especialidad.find(query)
      .sort({ orden: 1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: especialidades.length,
      data: especialidades,
    });
  } catch (error) {
    console.error("❌ Error obteniendo especialidades:", error);
    res.status(500).json({
      success: false,
      message: "Error del servidor",
    });
  }
};

// ✅ POST - Crear especialidad (admin, con upload de imagen)
export const createEspecialidad = async (req, res) => {
  try {
    // Multer ya subió la imagen a Cloudinary
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "La imagen es obligatoria",
      });
    }

    // Parsear arrays desde strings (viene de FormData)
    const parseArray = (value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      try {
        return JSON.parse(value);
      } catch {
        return value
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v);
      }
    };

    const {
      nombre,
      categoria,
      duracion,
      icono,
      descripcion,
      modulos,
      salidaLaboral,
      requisitos,
      horarios,
      precio,
      proximoInicio,
      perfilIngreso,
      perfilEgreso,
      competencias,
      metodologia,
      evaluacion,
      titulacion,
      orden,
      destacado,
    } = req.body;

    const nuevaEspecialidad = await Especialidad.create({
      nombre: nombre?.trim(),
      categoria,
      duracion: duracion?.trim(),
      icono: icono?.trim(),
      descripcion: descripcion?.trim(),
      imagen_url: req.file.path, // URL de Cloudinary
      imagen_public_id: req.file.filename, // Public ID de Cloudinary
      modulos: parseArray(modulos),
      salidaLaboral: parseArray(salidaLaboral),
      requisitos: parseArray(requisitos),
      horarios: parseArray(horarios),
      precio: precio?.trim() || "Consultar en administración",
      proximoInicio: proximoInicio?.trim(),
      perfilIngreso: parseArray(perfilIngreso),
      perfilEgreso: parseArray(perfilEgreso),
      competencias: parseArray(competencias),
      metodologia: parseArray(metodologia),
      evaluacion: parseArray(evaluacion),
      titulacion: titulacion?.trim(),
      orden: orden ? parseInt(orden) : 0,
      destacado: destacado === "true",
    });

    res.status(201).json({
      success: true,
      message: "Especialidad creada exitosamente",
      data: nuevaEspecialidad,
    });
  } catch (error) {
    // Cleanup: eliminar imagen de Cloudinary si falla
    if (req.file?.filename) {
      await import("../config/cloudinary.js")
        .then(({ deleteImage }) => deleteImage(req.file.filename))
        .catch(console.error);
    }

    console.error("❌ Error creando especialidad:", error);

    // Manejar errores de validación de MongoDB
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    // Manejar duplicados
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Ya existe una especialidad con este nombre",
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || "Error creando la especialidad",
    });
  }
};

// ✅ PUT - Actualizar especialidad
export const updateEspecialidad = async (req, res) => {
  try {
    const { id } = req.params;

    const especialidad = await Especialidad.findById(id);
    if (!especialidad) {
      return res.status(404).json({
        success: false,
        message: "Especialidad no encontrada",
      });
    }

    // Parsear arrays
    const parseArray = (value) => {
      if (!value) return undefined;
      if (Array.isArray(value)) return value;
      try {
        return JSON.parse(value);
      } catch {
        return value
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v);
      }
    };

    const updateData = {
      ...(req.body.nombre && { nombre: req.body.nombre.trim() }),
      ...(req.body.categoria && { categoria: req.body.categoria }),
      ...(req.body.duracion && { duracion: req.body.duracion.trim() }),
      ...(req.body.icono && { icono: req.body.icono.trim() }),
      ...(req.body.descripcion && { descripcion: req.body.descripcion.trim() }),
      ...(req.body.modulos && { modulos: parseArray(req.body.modulos) }),
      ...(req.body.salidaLaboral && {
        salidaLaboral: parseArray(req.body.salidaLaboral),
      }),
      ...(req.body.requisitos && {
        requisitos: parseArray(req.body.requisitos),
      }),
      ...(req.body.horarios && { horarios: parseArray(req.body.horarios) }),
      ...(req.body.precio !== undefined && { precio: req.body.precio.trim() }),
      ...(req.body.proximoInicio && {
        proximoInicio: req.body.proximoInicio.trim(),
      }),
      ...(req.body.perfilIngreso && {
        perfilIngreso: parseArray(req.body.perfilIngreso),
      }),
      ...(req.body.perfilEgreso && {
        perfilEgreso: parseArray(req.body.perfilEgreso),
      }),
      ...(req.body.competencias && {
        competencias: parseArray(req.body.competencias),
      }),
      ...(req.body.metodologia && {
        metodologia: parseArray(req.body.metodologia),
      }),
      ...(req.body.evaluacion && {
        evaluacion: parseArray(req.body.evaluacion),
      }),
      ...(req.body.titulacion !== undefined && {
        titulacion: req.body.titulacion.trim(),
      }),
      ...(req.body.orden !== undefined && { orden: parseInt(req.body.orden) }),
      ...(req.body.destacado !== undefined && {
        destacado: req.body.destacado === "true",
      }),
      ...(req.body.activo !== undefined && {
        activo: req.body.activo === "true",
      }),
    };

    // Si se subió nueva imagen, actualizar URLs
    if (req.file) {
      // Eliminar imagen anterior de Cloudinary
      if (especialidad.imagen_public_id) {
        await deleteImage(especialidad.imagen_public_id).catch(console.error);
      }
      updateData.imagen_url = req.file.path;
      updateData.imagen_public_id = req.file.filename;
    }

    const updated = await Especialidad.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    res.status(200).json({
      success: true,
      message: "Especialidad actualizada exitosamente",
      data: updated,
    });
  } catch (error) {
    console.error("❌ Error actualizando especialidad:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Ya existe una especialidad con este nombre",
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || "Error actualizando la especialidad",
    });
  }
};

// ✅ DELETE - Eliminar especialidad
export const deleteEspecialidad = async (req, res) => {
  try {
    const { id } = req.params;

    const especialidad = await Especialidad.findByIdAndDelete(id);

    if (!especialidad) {
      return res.status(404).json({
        success: false,
        message: "Especialidad no encontrada",
      });
    }

    // Eliminar imagen de Cloudinary
    if (especialidad.imagen_public_id) {
      await deleteImage(especialidad.imagen_public_id).catch(console.error);
    }

    res.status(200).json({
      success: true,
      message: "Especialidad eliminada exitosamente",
    });
  } catch (error) {
    console.error("❌ Error eliminando especialidad:", error);
    res.status(500).json({
      success: false,
      message: "Error eliminando la especialidad",
    });
  }
};

// ✅ PATCH - Reordenar especialidades
export const reorderEspecialidades = async (req, res) => {
  try {
    const { items } = req.body; // Array de { id, orden }

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: "Se requiere un array de items con id y orden",
      });
    }

    const bulkOps = items.map(({ id, orden }) => ({
      updateOne: {
        filter: { _id: id },
        update: { orden },
      },
    }));

    await Especialidad.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: "Orden actualizado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error reordenando especialidades:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Error reordenando especialidades",
    });
  }
};
