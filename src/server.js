import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);
const events = {
  JOIN: "join",
  LEAVE: "leave",
  MESSAGE: "message",
  USERNAME: "username",
  ROOM: "room",
};

const getPublicRooms = () => {
  const {
    sockets: {
      adapter: { rooms, sids },
    },
  } = wsServer;
  const publicRooms = [];

  rooms.forEach((v, k) => {
    if (!sids.get(k)) {
      publicRooms.push(k);
    }
  });
  return publicRooms;
};

wsServer.on("connection", (socket) => {
  console.log("New Socket Connected 🔥");
  const publicRooms = getPublicRooms();

  socket.emit(events.NEW_ROOM, publicRooms);

  socket.on(events.JOIN, (room, user, done) => {
    socket.join(room);
    socket["room"] = room;
    socket["username"] = user;
    socket.to(room).emit(events.JOIN, user);
    done();
  });

  socket.on("disconnecting", () => {
    socket.to(socket.room).emit(events.LEAVE, socket.username);
  });

  socket.on(events.MESSAGE, (text, done) => {
    if (socket.room) {
      const user = socket.username ?? "Anon";
      socket.to(socket.room).emit(events.MESSAGE, user, text);
    }
    done();
  });

  socket.on(events.USERNAME, (name, done) => {
    socket["username"] = name;
    done();
  });
});

wsServer.of("/").adapter.on("create-room", (room) => {
  wsServer.emit(events.ROOM, getPublicRooms());
});

wsServer.of("/").adapter.on("delete-room", (room) => {
  wsServer.emit(events.ROOM, getPublicRooms());
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(process.env.PORT, handleListen);
