const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
app.use(cors());

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
  console.log("mongoDb connected successfull");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server connected successfully");
});
