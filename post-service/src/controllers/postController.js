const logger = require("../utils/logger.js");
const Post = require("../models/Post.js");

const createPost = async (req, res) => {
  try {
    const { content, mediaIds } = req.body;

    const newpost = new Post({ content, mediaIds, user: req.user._id });
    await newpost.save();
    logger.info("Post saved successfully", newpost._id);
    res.status(201).json({
      success: true,
      message: "Post created successfully",
    });
  } catch (error) {
    logger.error("Create post error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error occurred",
    });
  }
};

const getPost = async (req, res) => {
  try {
    const { content, mediaIds } = req.body;
  } catch (error) {
    logger.error("get post error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error occurred",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const { content, mediaIds } = req.body;
  } catch (error) {
    logger.error("Delete post error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error occurred",
    });
  }
};

module.exports = { createPost, getPost, deletePost };