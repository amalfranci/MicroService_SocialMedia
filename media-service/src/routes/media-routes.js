const express = require("express");
const multer = require("multer");
const uploadMedia = require("../controllers/media-controller");
const authMiddleWare = require("../middleware/authMiddleware");
const logger = require("../utils/logger");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("file");

router.post("/upload", authMiddleWare, (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      logger.error(`Multer error while uploading file`, err);
      return res.status(400).json({
        message: "Multer error while uploading",
        error: err.message,
        stack: err.stack,
      });
    } else if (err) {
      logger.error(`Multer error while uploading file`, err);
      return res.status(500).json({
        message: "Multer error while uploading",
        error: err.message,
        stack: err.stack,
      });
    }
    next()
  });
},uploadMedia);


module.exports = router