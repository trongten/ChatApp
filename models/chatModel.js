const mongoose = require("mongoose");
const chatSchema= mongoose.Schema(
  {
    chatName: { type: "string", trim: true },

    isGroupChat: { type: "boolean", default: false },
    
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    
    chatAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },

  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;