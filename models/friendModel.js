const mongoose = require("mongoose");
const friendSchema = mongoose.Schema({
  userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});
const Friend = mongoose.model("Friend", friendSchema);
module.exports = Friend;
