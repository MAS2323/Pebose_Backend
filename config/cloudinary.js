import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Sube una imagen a Cloudinary en una carpeta específica.
 */
export const uploadImage = async (filePath, folderName) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folderName,
      transformation: [
        { width: 1920, height: 1080, crop: "limit" },
        { quality: "auto:good" },
      ],
    });
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("❌ Error al subir la imagen a Cloudinary:", error);
    throw error;
  }
};

/**
 * Elimina una imagen de Cloudinary.
 */
export const deleteImage = async (public_id) => {
  try {
    return await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.error("❌ Error al eliminar la imagen de Cloudinary:", error);
    throw error;
  }
};

/**
 * Actualiza una imagen en Cloudinary.
 */
export const updateImage = async (public_id, filePath, folderName) => {
  try {
    await cloudinary.uploader.destroy(public_id);
    const result = await cloudinary.uploader.upload(filePath, {
      public_id,
      folder: folderName,
    });
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("❌ Error al actualizar la imagen en Cloudinary:", error);
    throw error;
  }
};

export default cloudinary;
