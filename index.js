const express = require("express");

const dotenv = require("dotenv");
const app = new express();
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
dotenv.config();

connectDB();

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const friendRoutes = require("./routes/friendRoutes");
const friendRequestRoutes = require("./routes/friendRequestRoutes");

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/post", postRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/friend", friendRoutes);
app.use("/api/friendRequest", friendRequestRoutes);

const PORT = 5000;
const server = app.listen(
  PORT,
  console.log(`server listening on port ${PORT}`.yellow.bold)
);
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

/////////////////////////////////////////
const User = require("./models/userModel");
/////////////////////////////////////////

io.on("connection", (socket) => {
  console.log("connected to socket:" + socket.id);
  let user;
  //create a new socket where frontend join  data
  socket.on("setup", async (userData) => {
    user = userData._id;
    //Thay doi status
    const i = await User.findByIdAndUpdate(userData._id, {
      statusOnline: true,
    });

    console.log("user data:", userData);
    socket.join(userData._id);
    socket.emit("connected", socket.id);

    console.log("status", i);
  });

  //user join a chat socket
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user joind room: " + room);
  });

  socket.on("outchat", (room) => {
    console.log("user out room: " + room);
    socket.leave(room);
  });

  //tying indicator socket
  socket.on("typing", (room) => socket.in(room).emit("typing"));

  //stop tying indicator socket
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    let chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("chat.users is empty");
    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.on("call", (newMessageRecieved) => {
    let chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("chat.users is empty");
    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
      socket.in(user._id).emit("answer", newMessageRecieved.sender._id);
    });
  });

  socket.off("setup", async () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });

  socket.on("disconnect", async () => {
    //Thay doi status
    await User.findByIdAndUpdate(user, { statusOnline: false });
  });
});
