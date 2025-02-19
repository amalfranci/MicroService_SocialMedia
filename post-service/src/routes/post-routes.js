const express = require("express");
const { createPost, getPosts, deletePost, getPost } = require("../controllers/postController.js");
const authMiddleWare = require("../middleware/authMiddleWare.js");


const router = express.Router();
router.use(authMiddleWare);

router.post("/create-post", createPost);
router.get("/get-all-posts", getPosts);
router.get("/get-post/:postId", getPost);
router.delete("/delete-post/:postId", deletePost);


module.exports = router;