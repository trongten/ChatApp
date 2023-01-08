const mongoose = require("mongoose");
const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },

    isRead: { type: Boolean, default: false },

    multiMedia: { type: String, default: "" },

    content: { type: String, trim: true },

    response: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
