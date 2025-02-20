const cloudinary = require("cloudinary").v2;
const logger = require("./logger.js");
const dotenv = require('dotenv')
dotenv.config()

cloudinary.config({
  cloud_name: "dswd4mkqr",
  api_key: 441411524772134,
  api_secret: "H75owZrdSjhlA0dNg4En2jGtURI",
});

const uploadImageCloudnary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          logger.error("Error occured while uploading image", error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(file.buffer);
  });
};

const deleteMediaFromCloudnary = async(publicId)=>{
  try{
   const result =  await cloudinary.uploader.destroy(publicId)
   logger.info('media deleted successfully',publicId)
   return result
  }
  catch(err)
  {
    throw err
  }

}

module.exports = { uploadImageCloudnary ,deleteMediaFromCloudnary};