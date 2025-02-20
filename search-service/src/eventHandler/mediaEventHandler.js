const Search = require("../models/Search.js");
const logger = require("../utils/logger");

const handlePostSearchEven = async (event) => {
  try {
    const { postId, userId, content, createdAt } = event;

    const newSearchPost = new Search({
      postId: postId,
      userId: userId,
      content: content,
      createdAt: createdAt,
    });
    await newSearchPost.save()
    logger.info('Search Post created Successfully')
  } catch (error) {
    logger.error(error, "Error occur when delete a file");
  }
};

const handlePostSearchDelete = async(event)=>{

  try{
    const { postId } = event;
    console.log("Delete Search event Hit success", postId);

    const DeletePostSearch = await Search.findOneAndDelete({ postId: postId });
    logger.info(`${postId} is deleted From Search Model `)


  }
  catch(err)
  {
    logger.error(err,'Error occuer when delete post')

  }
}

module.exports = { handlePostSearchEven ,handlePostSearchDelete};
