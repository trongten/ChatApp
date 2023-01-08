const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const Message = require("../models/messageModel");

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  //last message
  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "username fullname pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    let chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});
/**
 * @description Fetch all chats to a user
 * @route GET /api/chat/
 * @access Protected
 */
const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("chatAdmin", "-password")
      .populate("latestMessage")
      .sort({ updateAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "username fullname pic email",
        });

        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please fill all the field" });
  }

  let users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res.status(400).send("More than two users required");
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      chatAdmin: req.user,
    });
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("chatAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    throw new Error(error.message);
  }
});

const renameGroupChat = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName,
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("chatAdmin", "-password");
  if (!updatedChat) {
    res.status(404);
    throw new Error(`Chat not found`);
  } else {
    res.json(updatedChat);
  }
});

const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  const added = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("chatAdmin", "-password");
  if (!added) {
    res.status(404);
    throw new Error(`Chat not found`);
  } else {
    res.json(added);
  }
});

const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  const removed = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("chatAdmin", "-password");
  if (!removed) {
    res.status(404);
    throw new Error(`Chat not found`);
  } else {
    res.json(removed);
  }
});

const deleteGroup = asyncHandler(async (req, res) => {
  const findchat = await Chat.findById(req.body.chatId);
  if (!findchat) {
    res.send("Not found group");
  } else {
    if (findchat.isGroupChat == true) {
      await Chat.findOneAndDelete({
        _id: req.body.chatId,
        chatAdmin: req.user._id,
      }).then((data) => {
        if (data) {
          Message.deleteMany({ chat: req.body.chatId }).then((data) => {
            console.log(data);
          });
          res.send(data);
        } else res.send("You are not chat admin");
      });
    } else {
      await Chat.findByIdAndDelete({ _id: req.body.chatId }).then((data) => {
        if (data) {
          Message.deleteMany({ chat: req.body.chatId }).then((data) => {
            console.log(data);
          });
          res.send(data);
        } else res.send("error delete");
      });
    }
  }
});

const deleteMe = asyncHandler(async (req, res) => {
  Message.deleteMany({ chat: req.body.chatId }).then((data) => {
    res.send(data);
  });
});

const changAdmin = asyncHandler(async (req, res) => {
  const findchat = await Chat.findById(req.body.chatId);
  if (!findchat) {
    res.send("Not found group");
  } else {
    const up = await Chat.findOneAndUpdate(
      { _id: req.body.chatId, chatAdmin: req.user._id },
      { chatAdmin: req.body.userId }
    );
    if (up) {
      res.send(up);
    } else {
      res.send("er");
    }
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  addToGroup,
  removeFromGroup,
  deleteGroup,
  deleteMe,
  changAdmin,
};
