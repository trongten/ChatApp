const mongoose = require("mongoose");
const postSchema= mongoose.Schema(
  {
    content: { type: "string", trim: true },

    pic: {
        type: String,
        default:
          "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]

  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;