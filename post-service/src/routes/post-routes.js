const express = require("express");
const { createPost, getPost, deletePost } = require("../controllers/postController.js");
const authMiddleWare = require("../middleware/authMiddleWare.js");


const router = express.Router();
router.use(authMiddleWare);

router.post("/create-post", createPost);
router.get("/get-all-posts", getPost);


module.exports = router;