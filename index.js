const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const connection = require("./config/db");
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const {
  content_msg,
  formatemessage,
  content_check,
  resetuser,
} = require("./socket functions/message");
const { userjoin, getRoomuser, deleteuser } = require("./socket functions/user");
app.use(cors());
app.use(express.json());

app.get("/urls.config.js", (req, res) => {
  res.sendFile(path.resolve(__dirname, "urls.config.js"));
});

app.use(express.static(path.join(__dirname, "client", "dist")));

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
});

app.get("/admin", (req, res) => {
  app.use(express.static(path.join(__dirname, "client", "dist", "Admin")));
  res.sendFile(
    path.resolve(__dirname, "client", "dist", "Admin", "login.html")
  );
});

app.get("/api", (req, res) => {
  res.send({ msg: "welcome" });
});
app.use("/api/user", require("./router/userrouter"));
app.use("/api/admin", require("./router/adminrouter"));

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("user enter in room", ({ username }) => {
    const room = "practice-" + socket.id;
    const user = userjoin(socket.id, username || "Practice", room);
    if (!user) return;
    socket.join(user.room);
    socket.emit("content", content_msg(user.username, user.room));

    socket.on("type message", (char) => {
      const result = content_check(char, user.username, user.room);
      socket.emit("status", result);
    });
  });

  socket.on("user", ({ username, room }) => {
    const user = userjoin(socket.id, username, room);
    if (user === "") {
      socket.emit("roomFull", "Maximum users have joined the race");
      return;
    }

    socket.join(user.room);
    socket.emit(
      "message",
      formatemessage(user.username, "welcome to type battle")
    );
    socket.emit("number of users", getRoomuser(user.room));
    socket.emit("content", content_msg(user.username, user.room));
    socket.broadcast.to(user.room).emit("number of users", getRoomuser(user.room));

    socket.on("type message", (char) => {
      const result = content_check(char, user.username, user.room);
      io.to(user.room).emit("status", result);
    });

    socket.on("msg", (msg) => {
      io.to(user.room).emit(
        "message",
        formatemessage(user.username, msg)
      );
    });

    socket.on("disconnect", () => {
      socket.broadcast
        .to(user.room)
        .emit(
          "message",
          formatemessage(user.username, `${user.username} has left the race`)
        );
      resetuser(user.username, user.room);
      deleteuser(user.username);
      io.to(user.room).emit("number of users", getRoomuser(user.room));
      console.log("user disconnected");
    });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(process.env.PORT, async () => {
  try {
    await connection;
    console.log("db connection established");
  } catch (error) {
    console.log(error.message, "not connected");
  }
  console.log("listening on *:" + process.env.PORT);
});
