import fs from "fs";
import Documento from "../models/Documento.js";
import { v2 as cloudinary } from "cloudinary";

// ✅ GET público - Obtener documentos por email del usuario
export const getDocumentosByUser = async (req, res) => {
  try {
    const { email } = req.params;

    const documentos = await Documento.find({
      email: email.toLowerCase(),
      activo: true,
    })
      .sort({ createdAt: -1 })
      .select("-__v")
      .lean();

    res.status(200).json({
      success: true,
      count: documentos.length,
      documentos,
    });
  } catch (error) {
    console.error("❌ Error obteniendo documentos:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};

// ✅ GET admin - Obtener todos los documentos con filtros
// backend/controllers/documentoController.js
export const getAllDocumentos = async (req, res) => {
  try {
    const { categoria, estado, search, page = 1, limit = 20 } = req.query;

    const query = { activo: true };
    if (categoria) query.categoria = categoria;
    if (estado) query.estado = estado;
    if (search) {
      query.$or = [
        { nombreOriginal: { $regex: search, $options: "i" } },
        { nombreUsuario: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [documentos, total] = await Promise.all([
      Documento.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select("-__v")
        .lean(),
      Documento.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: documentos.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      documentos,
    });
  } catch (error) {
    console.error("❌ Error obteniendo documentos:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};
// ✅ GET admin - Obtener documento por ID
export const getDocumentoById = async (req, res) => {
  try {
    const { id } = req.params;

    const documento = await Documento.findById(id).select("-__v").lean();

    if (!documento) {
      return res.status(404).json({
        success: false,
        message: "Documento no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      documento,
    });
  } catch (error) {
    console.error("❌ Error obteniendo documento:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};

// ✅ POST - Subir documento (público, con upload middleware)
export const uploadDocumento = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "El archivo es obligatorio" });
    }

    const { nombreUsuario, email, telefono, categoria, especialidad } =
      req.body;
    if (!nombreUsuario || !email || !categoria) {
      return res
        .status(400)
        .json({ success: false, message: "Datos incompletos" });
    }

    // 1. Determinar tipo y resource_type
    const extension = req.file.originalname.split(".").pop().toLowerCase();
    const extensionesImagen = ["jpg", "jpeg", "png", "gif", "webp"];
    const resourceType = extensionesImagen.includes(extension)
      ? "image"
      : "raw";

    // 2. SUBIR A CLOUDINARY
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: resourceType,
      folder: "ceep_documentos", // Opcional: organiza tus archivos en una carpeta
      public_id: null, // Deja que Cloudinary genere el ID único, o pon uno propio si quieres
    });

    // 3. GUARDAR EN BD CON LOS DATOS CORRECTOS DE CLOUDINARY
    const nuevoDocumento = await Documento.create({
      nombreOriginal: req.file.originalname,
      nombreServidor: req.file.filename, // Este es el temporal, déjalo si quieres por referencia
      url: result.secure_url, // ✅ CLAVE: URL real HTTPS de Cloudinary
      publicId: result.public_id, // ✅ CLAVE: El ID REAL (ej: "ceep_documentos/d4b79...")
      tipo:
        extension === "pdf"
          ? "pdf"
          : extensionesImagen.includes(extension)
            ? "jpg"
            : "other",
      tamaño: req.file.size,
      nombreUsuario: nombreUsuario.trim(),
      email: email.toLowerCase().trim(),
      telefono: telefono?.trim(),
      categoria,
      especialidad: especialidad?.trim(),
      estado: "pendiente",
      resourceType,
      activo: true,
    });

    // 4. Eliminar archivo local temporal
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error borrando temporal:", err);
    });

    res
      .status(201)
      .json({ success: true, message: "Documento subido", nuevoDocumento });
  } catch (error) {
    console.error("❌ Error subiendo documento:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ PATCH - Actualizar estado/notas de documento (admin)
export const updateDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, notas } = req.body;

    const updateData = {};
    if (estado) updateData.estado = estado;
    if (notas !== undefined) updateData.notas = notas.trim();

    const documento = await Documento.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .select("-__v")
      .lean();

    if (!documento) {
      return res.status(404).json({
        success: false,
        message: "Documento no encontrado",
      });
    }

    res.status(200).json({
      success: true,
      message: "Documento actualizado",
      documento,
    });
  } catch (error) {
    console.error("❌ Error actualizando documento:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Error actualizando el documento",
    });
  }
};

// ✅ DELETE - Eliminar documento (admin) ← ¡ESTA ES LA QUE FALTABA!
export const deleteDocumento = async (req, res) => {
  try {
    const { id } = req.params;

    const documento = await Documento.findByIdAndDelete(id);

    if (!documento) {
      return res.status(404).json({
        success: false,
        message: "Documento no encontrado",
      });
    }

    // Eliminar archivo de Cloudinary
    if (documento.publicId) {
      await cloudinary.uploader
        .destroy(documento.publicId)
        .catch(console.error);
    }

    res.status(200).json({
      success: true,
      message: "Documento eliminado exitosamente",
    });
  } catch (error) {
    console.error("❌ Error eliminando documento:", error);
    res.status(500).json({
      success: false,
      message: "Error eliminando el documento",
    });
  }
};

// ✅ GET admin - Estadísticas de documentos para dashboard
export const getDocumentosStats = async (req, res) => {
  try {
    const stats = await Documento.aggregate([
      { $match: { activo: true } },
      {
        $group: {
          _id: "$estado",
          count: { $sum: 1 },
          totalSize: { $sum: "$tamaño" },
        },
      },
    ]);

    const totalDocumentos = await Documento.countDocuments({ activo: true });
    const totalSize = stats.reduce(
      (acc, curr) => acc + (curr.totalSize || 0),
      0,
    );

    res.status(200).json({
      success: true,
      data: {
        totalDocumentos,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        porEstado: stats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};
