const asyncHandler = require("express-async-handler");
const FriendRequest = require("../models/friendRequestModel");
const Friend = require("../models/friendModel");

const sendFriendRequest = asyncHandler(async (req, res) => {
  const isExists = await FriendRequest.findOne({
    senderId: req.user._id,
    receiverId: req.params.friendRequestId,
  });
  const isExists2 = await FriendRequest.findOne({
    receiverId: req.user._id,
    senderId: req.params.friendRequestId,
  });

  if (!isExists && !isExists2 && req.user._id != req.params.friendRequestId) {
    await FriendRequest.create({
      senderId: req.user._id,
      receiverId: req.params.friendRequestId,
    })
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.send(err);
      });
  } else {
    res.send("FriendRequestExists!");
  }
});

const acceptFriendRequest = asyncHandler(async (req, res) => {
  const isExists = await FriendRequest.findOne({
    senderId: req.params.friendRequestId,
    receiverId: req.user._id,
  });

  if (isExists) {
    await FriendRequest.deleteOne({
      receiverId: req.user._id,
      senderId: req.params.friendRequestId,
    })
      .then(() => {
        Friend.create({
          userIds: [req.user._id, req.params.friendRequestId],
        })
          .then((data) => {
            res.json(data);
          })
          .catch((err) => {
            res.send(err);
          });
      })
      .catch((err) => {
        res.send(err);
      });
  } else {
    res.send("FriendRequestNotExists!");
  }
});

const deniedFriendRequest = asyncHandler(async (req, res) => {
  const isExists = await FriendRequest.findOne({
    senderId: req.params.friendRequestId,
    receiverId: req.user._id,
  });

  if (isExists) {
    await FriendRequest.deleteOne({
      receiverId: req.user._id,
      senderId: req.params.friendRequestId,
    }).then((data) => {
      res.send(data);
    });
  } else {
    res.send("FriendRequestNotExists!");
  }
});

const getListFriendRequest = asyncHandler(async (req, res) => {
  await FriendRequest.aggregate([
    { $match: { receiverId: req.user._id } },
    { $project: { _id: 0, senderId: 1 } },
    {
      $lookup: {
        from: "users",
        localField: "senderId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $replaceWith: "$user" },
    {
      $project: {
        _id: 1,
        username: 1,
        fullname: 1,
        email: 1,
        pic: 1,
        statusOnline: 1,
      },
    },
  ])

    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.send(err);
    });
});

const getListRequestSended = asyncHandler(async (req, res) => {
  await FriendRequest.aggregate([
    { $match: { senderId: req.user._id } },
    { $project: { _id: 0, receiverId: 1 } },
    {
      $lookup: {
        from: "users",
        localField: "receiverId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $replaceWith: "$user" },
    {
      $project: {
        _id: 1,
        username: 1,
        fullname: 1,
        email: 1,
        pic: 1,
        statusOnline: 1,
      },
    },
  ])

    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.send(err);
    });
});

const deleteRequestSended = asyncHandler(async (req, res) => {
  await FriendRequest.deleteOne({
    senderId: req.user._id,
    receiverId: req.params.friendRequestId,
  })
    .then(() => {
      res.send("FriendRequestDeleted!");
    })
    .catch((err) => {
      res.send(err);
    });
});

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  deniedFriendRequest,
  getListFriendRequest,
  getListRequestSended,
  deleteRequestSended,
};
