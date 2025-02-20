const Media = require("../models/media.js");
const { uploadImageCloudnary } = require("../utils/cloudnary.js");
const logger = require("../utils/logger.js");

const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.json({
        message: "file not found",
      });
    }

    const { originalName, mimetype, buffer } = req.file;
    const userId = req.user.userId;

    const cloudinaryUploadResult = await uploadImageCloudnary(req.file);
    const uploadData = new Media({
      publicId: cloudinaryUploadResult.public_id,
      originalName,
      url:cloudinaryUploadResult.secure_url,
      mimeType: mimetype,
      userId
    });

    await uploadData.save();

    res.status(201).json({
      message:'Image uploaded successfully',
      success:true
    })
  } catch (error) {
    logger.error("Upload media error:", error);
    res.json({
      message: error.message,
    });
  }
};

module.exports = uploadMedia;
