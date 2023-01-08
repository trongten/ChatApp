const mongoose = require("mongoose");
const commmentSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    content: { type: String, trim: true },

    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
   
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commmentSchema);
module.exports = Comment;