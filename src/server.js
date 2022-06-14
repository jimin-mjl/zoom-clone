import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

server.listen(process.env.PORT, handleListen);

wss.on("connection", (socket) => {
  console.log("🔥 New Connection Created");
  socket.on("close", () => {
    console.log("💔 Socket disconnected from Client");
  });
  socket.on("message", (str) => {
    const data = JSON.parse(str);
    switch (data.type) {
      case "nickname":
        socket["nickname"] = data.content;
        break;
      case "message":
        wss.clients.forEach((each) => {
          if (each === socket) {
            each.send(`You: ${data.content}`);
          } else {
            const nickname = socket.nickname ?? "Anon";
            each.send(`${nickname}: ${data.content}`);
          }
        });
        break;
    }
  });
});
