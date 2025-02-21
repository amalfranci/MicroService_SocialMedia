const logger = require("../utils/logger.js");
const jwt = require("jsonwebtoken");

const authMiddleWare = (req, res, next) => {
  const userId = req.headers["x-user-id"];
  logger.info("User id", userId);
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  req.user = { userId };
  next();
};

module.exports = authMiddleWare;
