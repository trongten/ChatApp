const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");
const QRCode = require("qrcode");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const UserOTPVerification = require("../models/userOTPVarification");
dotenv.config();
//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { username: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  console.log(req.user);
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

//@description     Register new user
//@route           POST /api/user/
//@access          Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, fullname, email, password, pic } = req.body;

  if (!username || !email || !password || !fullname) {
    res.status(400);
    throw new Error("Please Enter all the Feilds");
  }

  const userExists = await User.findOne({ email }).catch((err) => {
    console.log(err);
  });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  } else {
    sendEmail();
  }

  const user = await User.create({
    username,
    fullname,
    email,
    password,
    pic,
    verify: false,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      //isAdmin: user.isAdmin,
      pic: user.pic,
      verify: user.verify,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

//@description     Auth the user
//@route           POST /api/users/login
//@access          Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

const addFriend = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const added = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { friends: userId } },
    { new: true }
  );

  if (!added) {
    res.status(404);
    throw new Error(`Post not found`);
  } else {
    res.json({
      _id: added._id,
      username: added.username,
      fullname: added.fullname,
      email: added.email,
      friends: added.friends,
      pic: added.pic,
    });
  }
});

// sửa thông tin user(username, fullname)
const update = asyncHandler(async (req, res) => {
  const { _id, username, fullname, pic } = req.body;

  const updateInfo = await User.findByIdAndUpdate(
    _id,
    {
      username,
      fullname,
      pic,
    },
    {
      new: true,
    }
  );

  if (!updateInfo) {
    res.status(400);
    throw new Error("User not found");
  } else {
    res.json({
      _id: updateInfo._id,
      username: updateInfo.username,
      fullname: updateInfo.fullname,
      email: updateInfo.email,
      pic: updateInfo.pic,
      token: generateToken(updateInfo._id),
    });
  }
});
//@description    get user by Email
//@route           get /api/user/:email
//@access          Public
const getUserByEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    res.json(user);
  }
  if (!user) {
    res.json("a");
  }
});

const generateQRCode = asyncHandler(async (req, res) => {
  let data = req.params.userId;

  // Converting the data into String format
  let stringdata = JSON.stringify(data);

  // Print the QR code to terminal
  QRCode.toString(stringdata, { type: "terminal" }, (err, QRcode) => {
    if (err) return console.log(err);
  });
  // Converting the data into base64
  QRCode.toDataURL(stringdata, (err, code) => {
    if (err) return console.log(err);
    res.json(code);
    // Printing the code
    console.log(code);
  });
});
const registerUser1 = asyncHandler(async (req, res) => {
  const { username, fullname, email, password, pic } = req.body;

  const otp = Math.floor(1000 + Math.random() * 9000);

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USERNAME, // generated ethereal user
      pass: process.env.MAIL_PASSWORD, // generated ethereal password
    },
  });

  const info = {
    from: process.env.MAIL_FROM_ADDRESS, // sender address
    to: JSON.stringify(email), // list of receivers
    subject: "Verify Your Email ✔", // Subject line
    text: "Hello world?", // plain text body
    html: `<h2>${otp}</h2>`, // html body
  };

  if (!username || !email || !password || !fullname) {
    res.status(400);
    throw new Error("Please Enter all the Feilds");
  }

  const userExists = await User.findOne({ email }).catch((err) => {
    console.log(err);
  });

  if (userExists && userExists.verify === false) {
    transporter.sendMail(info);
    // const userVerify = await UserVerify.create({
    //   email: JSON.stringify(email),
    //   otp: otp,
    // });
    const userid = userExists._id.toHexString();
    const verify = await UserOTPVerification.create({
      userId: userid,
      otp: otp,
    });
    if (verify) {
      res.json(verify);
    }
  }
  if (userExists && userExists.verify === true) {
    res.status(400);
    throw new Error("User already exists");
  }
  if (!userExists) {
    const user = await User.create({
      username,
      fullname,
      email,
      password,
      pic,
      verify: false,
    });
    // transporter.sendMail(info);
    // const userVerify = await UserVerify.create({
    //   email: JSON.stringify(email),
    //   otp: otp,
    // });
    const userid = user._id.toHexString();
    await UserOTPVerification.create({
      userId: userid,
      otp: otp,
    });
    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        //isAdmin: user.isAdmin,
        pic: user.pic,
        verify: user.verify,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("User not found");
    }
  }
});

const sendEmail = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;

  await UserOTPVerification.findOne({ userId: userId }).then((data) => {
    console.log(data);
    const otpdata = data.otp;

    console.log(typeof otpdata);
    console.log(typeof otp);
    if (otp == otpdata) {
      User.findByIdAndUpdate(userId, { verify: true })
        .then((data) => {
          res.json("Verify Success");
        })
        .catch((err) => {
          console.log(err);
        });
      console.log("true");
    } else {
      console.log("False");
    }
  });
});

const getOTPById = asyncHandler(async (req, res) => {
  const { id } = req.body;
  await User.findOne({ id })
    .then((data) => {
      res.json(data);
    })
    .catch((err) => console.log(err));
});

const getUserById = asyncHandler(async (req, res) => {
  const id = req.body;
  const user = await User.findOne(id);
  if (user) {
    res.json(user);
  }
  if (!user) {
    res.json("No search user");
  }
});
module.exports = {
  getUserByEmail,
  allUsers,
  registerUser,
  sendEmail,
  authUser,
  addFriend,
  generateQRCode,
  getOTPById,
  getUserById,
  update,
};
