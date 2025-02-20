const logger = require("../utils/logger.js");
const Post = require("../models/Post.js");
const validatePostCreate = require("../utils/validation.js");
const { publishEvent } = require("../utils/rabbitmq.js");

const validateCache = async (req, input) => {
  const cacheKey = `posts:${input}`;
  await req.redisClient.del(cacheKey);

  const keys = await req.redisClient.keys("posts:*");
  if (keys.length > 0) {
    await req.redisClient.del(keys);
  }
};
const createPost = async (req, res) => {
  try {
    const validatePost = validatePostCreate(req.body);
    if (validatePost.error) {
      logger.warn("Validation error", validatePost.error.details[0].message);
      return res.status(400).json({
        success: false,
        message: validatePost.error.details[0].message,
      });
    }

    const { content, mediaIds } = req.body;
    const { userId } = req.user;

    const newpost = new Post({ content, mediaIds, user: userId });
    await newpost.save();
    logger.info("Post saved successfully", newpost._id);
    await validateCache(req, newpost._id.toString());
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

const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 10);
    const startIndex = (page - 1) * limit;

    const cacheKey = `posts:${page}:${limit}`;

    console.log(cacheKey);
    const chachedPosts = await req.redisClient.get(cacheKey);
    if (chachedPosts) {
      return res.json(JSON.parse(chachedPosts));
    }

    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);
    const totalNumberOfPosts = await Post.countDocuments();

    const result = {
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalNumberOfPosts / limit),
      totalNumberOfPosts,
    };

    await req.redisClient.set(cacheKey, JSON.stringify(result), "EX", 6000);
    res.json(result);
  } catch (error) {
    logger.error("get post error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error occurred",
    });
  }
};

const getPost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const cacheKey = `posts:${postId}`;
    const chachedPost = await req.redisClient.get(cacheKey);
    if (chachedPost) {
      return res.json(JSON.parse(chachedPost));
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    await req.redisClient.set(cacheKey, JSON.stringify(post), "EX", 6000);
    res.json(post);
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
    const post = await Post.findOneAndDelete({
      _id: req.params.postId,
      user: req.user.userId,
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    //  piblish post delete
    await publishEvent("post.deleted", {
      postId: post._id.toString(),
      userId: req.user.userId,
      mediaIds: post.mediaIds,
    });

    await validateCache(req, req.params.postId.toString());
    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    logger.error("Delete post error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error occurred",
    });
  }
};

module.exports = { createPost, getPosts, deletePost, getPost };
