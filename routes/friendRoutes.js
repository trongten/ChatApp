const express = require("express");
const {
  getFriendList,
  deleteFriend,
} = require("../controllers/friendControllers");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.route("/").get(protect, getFriendList);
router.route("/deletefriend/:friendRequestId").post(protect, deleteFriend);
module.exports = router;
