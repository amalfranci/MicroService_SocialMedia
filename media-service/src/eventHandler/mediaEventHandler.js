const Media = require("../models/media.js");
const { deleteMediaFromCloudnary } = require("../utils/cloudnary");
const logger = require("../utils/logger");

const handlePostDeleted = async (event) => {
  const { postId, mediaIds } = event;

  try {
    const mediaToDelete = await Media.find({ publicId: { $in: mediaIds } });

    // Validate results
    if (!mediaToDelete.length) {
    }

    for (const media of mediaToDelete) {
      await deleteMediaFromCloudnary(media.publicId);
      await Media.findByIdAndDelete(media._id);

      logger.info(`Deleted media ${media._id} `);
    }
    logger.info(`Process delection is completed ${postId}`);
  } catch (error) {
    logger.error(error, "Error occur when delete a file");
  }
};

module.exports = { handlePostDeleted };
