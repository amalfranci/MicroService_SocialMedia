const mongoose = require("mongoose");
const mediaSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
    },
    orginalName: {
      type: String,
    },
    mimeType: {
      type: String,
      required: true,
    },
    url: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  
  { timestamps: true }
);
const Media = mongoose.model("Media", mediaSchema);
module.exports = Media;