const express = require("express");
const {
    accessPost,
    createPost,
    deletePost,
    updatePost,
    likePost
  } = require("../controllers/postControllers")
  const { protect } = require("../middleware/authMiddleware")

  const router = express.Router();


router.route("/").get(accessPost);
router.route("/").post(protect,createPost);
router.route("/update").put(protect,updatePost);
router.route("/").delete(protect,deletePost);
router.route("/like").put(protect,likePost);

module.exports = router;

