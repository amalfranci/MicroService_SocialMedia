require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const logger = require("./utils/logger.js");
const mongoose = require("mongoose");
const Redis = require("ioredis");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const errorHandler = require("./middleware/errorHandler.js");
const { connectRabbitMq } = require("./utils/rabbitmq.js");
const app = express();
const PORT = process.env.PORT || 3004;

mongoose
  .connect(process.env.MONGODBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection failed:", error.message));
const redisClient = new Redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());
const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "middleware",
    points: 10,
    duration: 1,
  });
  
  app.use((req, res, next) => {
    rateLimiter
      .consume(req.ip)
      .then(() => next())
      .catch(() => {
        logger.warn(`Rate limit request exceeds for Ip:  ${req.ip}`);
        res.status(429).json({
          success: false,
          message: "To many request",
        });
      });
  });

  
  app.use(errorHandler);

async function startServer() {
  try {
    await connectRabbitMq();
    app.listen(PORT, () => {
      logger.info(`Search service is running on port http://localhost:${PORT}`);
      console.log(
        `Search service connected on http://localhost:${PORT} SUCCESSFULLY`
      );
    });
  } catch (error) {
    logger.error(`Failed to connect to server`, error);
    process.exit(1);
  }
}
startServer()

process.on("unhandledRejection", (reason, promise) => {
  logger.error("unhandledRejection at", promise, "reason:", reason);
});
