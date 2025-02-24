const dotenv = require("dotenv");
dotenv.config();

const logger = require("./utils/logger.js");

const express = require("express");
const cors = require("cors");
const Redis = require("ioredis");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const proxy = require("express-http-proxy");
const errorHandler = require("./middleware/errorHandle.js");
const validatedToken = require("./middleware/authMiddleware.js");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/",(req,res)=>{
  res.send("wow from the BaCKEND AMAL")
})

const redisClient = new Redis(process.env.REDIS_URL);
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Recived ${req.method}  reqest to to ${req.url}`);
  logger.info(`Reqest Body ${req.body} `);
  next();
});

// rate limiting

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`sensitive endpoints rate limit exceeds for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: "To many request",
    });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

app.use(rateLimiter);

const proxyOption = {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler: function (err, res, next) {
    logger.error(`proxy error: ${err.message}`);
    res.status(500).json({
      success: false,
      message: "Interval server error",
      error: err.message,
    });
  },
};

// setting up proxy for out identity service

app.use(
  "/v1/auth",
  proxy(process.env.IDENTITY_SERVICE_URL, {
    ...proxyOption,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      // you can change the method
      // proxyReqOpts.method = 'GET';
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response recived from identity service :${proxyRes.statusCode}`
      );

      return proxyResData;
    },
  })
);

// setting up proxy for out post service

app.use(
  "/v1/posts",
  validatedToken,
  proxy(process.env.POST_SERVICE_URL, {
    ...proxyOption,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;

      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(`Response recived from postservice :${proxyRes.statusCode}`);

      return proxyResData;
    },
  })
);

// setting up proxy for out Media service

app.use(
  "/v1/media",
  validatedToken,
  proxy(process.env.MEDIA_SERVICE_URL, {
    ...proxyOption,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
      if (!srcReq.headers["content-type"].startsWith("multipart/form-data")) {
        proxyReqOpts.headers["Content-Type"] = "application/json";
      }
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response recived from Media  service :${proxyRes.statusCode}`
      );

      return proxyResData;
    },
    parseReqBody: false,
  })
);

// setting up proxy for out Search service

app.use(
  "/v1/search",
  validatedToken,
  proxy(process.env.SEARCH_SERVICE_URL, {
    ...proxyOption,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;

      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response recived from Search  service :${proxyRes.statusCode}`
      );

      return proxyResData;
    },
  })
);

app.use(errorHandler);
app.listen(PORT, () => {
  logger.info(`API Gateway is runnig on port ${PORT}`);
  logger.info(
    `Identity service is  runnig on port ${process.env.IDENTITY_SERVICE_URL}`
  );

  logger.info(`Redis Url is runnig on port ${process.env.REDIS_URL}`);
});
