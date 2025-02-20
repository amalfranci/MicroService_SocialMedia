const Search = require("../models/Search");
const logger = require("../utils/logger");

const SerachPostController = async (req, res) => {
  try {
    const { query } = req.query;
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
