const express = require("express");
const {
  sendFriendRequest,
  acceptFriendRequest,
  deniedFriendRequest,
  getListFriendRequest,
  getListRequestSended,
  deleteRequestSended,
} = require("../controllers/friendRequestController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.route("/request").get(protect, getListFriendRequest);
router.route("/sended").get(protect, getListRequestSended);
router
  .route("/deletesended/:friendRequestId")
  .post(protect, deleteRequestSended);
router.route("/:friendRequestId").post(protect, sendFriendRequest);
router.route("/accept/:friendRequestId").post(protect, acceptFriendRequest);
router.route("/denied/:friendRequestId").post(protect, deniedFriendRequest);
module.exports = router;
