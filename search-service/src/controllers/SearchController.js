const Search = require("../models/Search");
const logger = require("../utils/logger");

const SerachPostController = async (req, res) => {
  try {
    const { query } = req.query;


    const cacheKey = `Search:${query}`
    const cacheSearchPost = await req.redisClient.get(cacheKey);

    if(cacheSearchPost)
    {
      return res.json(JSON.parse(cacheSearchPost))
    }

    const result = await Search.find(
      {
        $text: { $search: query },
      },
      {
        score: { $meta: "textScore" },
      }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);

      await req.redisClient.set(cacheKey,JSON.stringify(result),'EX',6000)
      res.json(result)

  } catch (error) {
    logger.error(error, "Server Internal Error");
    res.status(500).json({
      messgae: "Internal Server Error",
      success: false,
    });
  }
};

module.exports = { SerachPostController };
