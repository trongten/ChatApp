const express = require("express");
const {
  allMessages,
  sendMessage,
  deleteMessage,
  pageMessages,
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);
router.route("/delete").put(protect, deleteMessage);
router.route("/:chatId/:pageNumber").get(protect, pageMessages);
module.exports = router;
