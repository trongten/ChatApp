const asyncHandler = require("express-async-handler");
const Friend = require("../models/friendModel");

const getFriendList = asyncHandler(async (req, res) => {
  await Friend.aggregate([
    { $project: { _id: 0, userIds: 1 } },
    {
      $match: {
        userIds: { $in: [req.user._id] },
      },
    },
    { $unwind: "$userIds" },
    {
      $match: {
        userIds: { $ne: req.user._id },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userIds",
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

const deleteFriend = asyncHandler(async (req, res) => {
  await Friend.deleteOne({ userId: [req.user._id] })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.send(err);
    });
});

module.exports = { getFriendList, deleteFriend };
