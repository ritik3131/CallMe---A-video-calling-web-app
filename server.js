const express = require("express");

const app = express();

const { v4: uuidv4 } = require("uuid");

server = app.listen(3030);

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static("public"));

app.use("/peerjs", peerServer);

app.get("/", (req, res, next) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res, next) => {
  res.render("room", { roomId: req.params.room });
});

const users={};
const io = require("socket.io")(server);
io.on("connection", (socket) => {
  socket.on("user-joined", (roomId, userId, name) => {
    socket.join(roomId);
    users[socket.id] = name;

    socket.to(roomId).emit("user-connected", userId, name);

    socket.on("send", (msg) => {
      socket.to(roomId).emit("receive", {
        message: msg,
        name: users[socket.id],
      });
    });

    socket.on("disconnect", (msg) => {
      socket.to(roomId).emit("leave", users[socket.id],userId);
    });
  });
});
