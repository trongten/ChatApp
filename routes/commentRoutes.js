const express = require("express");
const {
    getAllComments,
    createComment,
    deleteComment
} = require("../controllers/commentControllers");
const { sendMessage } = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");


const router = express.Router();

router.route("/:postId").get(protect, getAllComments);
router.route("/").post(protect, createComment);
router.route("/").delete(protect, deleteComment);

module.exports = router;