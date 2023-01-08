const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected

const allMessages = asyncHandler(async (req, res) => {
  try {
    let messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "username pic email")
      .populate("chat")
      .populate("response");
    messages = await User.populate(messages, {
      path: "response.sender",
      select: "username pic email fullname ",
    });
    res.json(messages);
  } catch (error) {
    throw new Error(error.message);
  }
});
const pageMessages = asyncHandler(async (req, res) => {
  const limit = 20;
  const skip = limit * (req.params.pageNumber - 1);

  let messages = await Message.find({ chat: req.params.chatId })
    .sort([["createdAt", -1]])
    .skip(skip)
    .limit(limit)
    .populate("sender", "username pic email")
    .populate("chat")
    .populate("response");
  messages = await User.populate(messages, {
    path: "response.sender",
    select: "username pic email fullname ",
  })
    .then((dat) => res.json(dat.reverse()))
    .catch((error) => {
      throw new Error(error);
    });
});
//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId, response, multiMedia } = req.body;

  if ((!content && !multiMedia) || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  let newMessage = {
    sender: req.user._id,
    content: content,
    isRead: false,
    chat: chatId,
    response: response,
    multiMedia: multiMedia,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "username pic");
    message = await (await message.populate("chat")).populate("response");
    message = await User.populate(message, {
      path: "chat.users",
      select: "username pic email fullname",
    });
    message = await User.populate(message, {
      path: "response.sender",
      select: "username pic email fullname ",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
/**
 *
 */
const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.body;
  Message.findByIdAndUpdate(messageId, {
    content: "deleted",
    multiMedia: "",
    response: null,
  }).then((message) => {
    res.send(message);
  });
});

module.exports = { allMessages, sendMessage, deleteMessage, pageMessages };
