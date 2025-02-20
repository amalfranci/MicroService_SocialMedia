const Media = require("../models/media.js")
const { deleteMediaFromCloudnary } = require("../utils/cloudnary")
const logger = require("../utils/logger")

const handlePostDeleted =  async(event)=>{
    console.log(event,"eventeventevent")
    const {postId,mediaIds} = event
    console.log("postId===============>",postId ,"mediaIDS================>",mediaIds)

    try{
       
        const mediaToDelete = await Media.find({ publicId: { $in: mediaIds } });
  
        // Validate results
        if (!mediaToDelete.length) {
          console.log("Amal ERORRRRRRRRRRRRRRRRRRR=>",mediaToDelete)
        }
        console.log("mediaToDelete=============>",mediaToDelete)

        for (const media of mediaToDelete){
            await deleteMediaFromCloudnary(media.publicId)
            await Media.findByIdAndDelete(media._id)

            logger.info(`Deleted media ${media._id} `)
        }
        logger.info(`Process delection is completed ${postId}`)

    }
    catch(error)
    {
        logger.error(error,'Error occur when delete a file')
    }
}

module.exports={handlePostDeleted}