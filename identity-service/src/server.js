const express = require("express");
const logger = require("./utils/logger");
const helmet = require('helmet')
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Redis =require('ioredis')
const { rateLimit } = require('express-rate-limit')
const {RateLimiterRedis} = require('rate-limiter-flexible')
dotenv.config();
const app = express();
const cors = require('cors')
const {RedisStore}= require('rate-limit-redis')
const routes = require('./routes/identity-service.js');
const errorHandler = require("./middleware/errorHandler");

const PORT = process.env.PORT || 3001

mongoose
  .connect(process.env.MONGODBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection failed:', error.message));
  const redisClient = new Redis(process.env.REDIS_URL)
  
  app.use(helmet())
  app.use(cors())
  app.use(express.json())


  app.use((req,res,next)=>{
    logger.info(`Recived ${req.method}  reqest to to ${req.url}`)
    logger.info(`Reqest Body ${req.body} `)
    next()
  })

  //DDos protection and rate limiting

  const rateLimiter = new RateLimiterRedis({
    storeClient:redisClient,
    keyPrefix: 'middleware',
    points: 10,
    duration:1
  })

  app.use((req,res,next)=>{
    rateLimiter.consume(req.ip).then(()=>next()).catch(()=>{
        logger.warn(`Rate limit request exceeds for Ip:  ${req.ip}`)
        res.status(429).json({
            success:false,
            message:"To many request"

        })
    })
  })

  // ip based rate limitunf for senstive routes
const senestiveEndPointsLimiter = rateLimit({
    windowMs:15 * 60 *1000,
    max:50,
    standardHeaders:true,
    legacyHeaders:false,
    handler:(req,res)=>{

        logger.warn(`sensitive endpoints rate limit exceeds for IP: ${req.ip}`)
        res.status(429).json({
            success:false,
            message:"To many request"

        })
    },
    store:new RedisStore({
        sendCommand:(...args)=>redisClient.call(...args),
    })
})
app.get("/", (req, res) => {
    res.send("Hello welcome to backend ,WOW!");
  });
  

// apply this senstitive for route

app.use('/api/auth/register',senestiveEndPointsLimiter)
app.use('/api/auth',routes)



app.use(errorHandler)

app.listen(PORT,()=>{
    logger.info(`Identity service is running on port http://localhost:${PORT}`)
    console.log(`Identity server connected on http://localhost:${PORT} SUCCESSFULLY`)

})

process.on('unhandledRejection',(reason,promise)=>{
    logger.error('unhandledRejection at',promise,'reason:',reason)
})