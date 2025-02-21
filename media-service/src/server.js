const express = require("express");
const logger =  require("./utils/logger.js")
const helmet = require("helmet");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const Redis = require("ioredis");
const { rateLimit } = require("express-rate-limit");
const { RateLimiterRedis } = require("rate-limiter-flexible");

const app = express();
const cors = require("cors");
const { RedisStore } = require("rate-limit-redis");
const errorHandler = require("./middleware/errorHandler.js");
const PORT = process.env.PORT || 3003;
const mediaRoutes = require('../src/routes/media-routes.js');
const { connectRabbitMq, consumeEvent } = require("./utils/rabbitmq.js");
const { handlePostDeleted } = require("./eventHandler/mediaEventHandler.js");


mongoose
  .connect(process.env.MONGODBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection failed:', error.message));
  
  
  const redisClient = new Redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Recived ${req.method}  reqest to to ${req.url}`);
  logger.info(`Reqest Body ${req.body} `);
  next();
});

//DDos protection and rate limiting
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

app.use('/api/media',mediaRoutes)

app.use(errorHandler);

async function startServer() {
  try {
    await connectRabbitMq();

    await consumeEvent('post.deleted',handlePostDeleted)
    app.listen(PORT, () => {
      logger.info(`Media service is running on port http://localhost:${PORT}`);
      console.log(
        `Post service connected on http://localhost:${PORT} SUCCESSFULLY`
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
