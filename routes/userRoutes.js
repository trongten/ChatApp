const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
  addFriend,
  update,
  getUserByEmail,
  generateQRCode,
  getUserById,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(protect, allUsers);
router.route("/addfriend").put(protect, addFriend);
router.route("/").post(registerUser);
router.post("/login", authUser);
router.route("/update").put(protect, update);
router.post("/:email", getUserByEmail);
router.post("/:userId/qrcode", generateQRCode);
router.get("/:userId/id", getUserById);
module.exports = router;
