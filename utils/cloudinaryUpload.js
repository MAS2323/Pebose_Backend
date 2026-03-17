import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = async (filePath, folder, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `${process.env.CLOUDINARY_UPLOAD_FOLDER}/${folder}`,
      transformation: [
        { width: 1920, height: 1080, crop: "limit" },
        { quality: "auto:good" },
      ],
      ...options,
    });

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error("❌ Error subiendo a Cloudinary:", error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === "ok",
      message: result.result,
    };
  } catch (error) {
    console.error("❌ Error eliminando de Cloudinary:", error);
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};
