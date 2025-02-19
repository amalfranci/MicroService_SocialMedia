require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const logger = require("./utils/logger.js");
const mongoose = require("mongoose");
const Redis = require("ioredis"); 
const postRoutes = require("./routes/post-routes.js");
const errorHandler = require("./middleware/errorHandler.js");