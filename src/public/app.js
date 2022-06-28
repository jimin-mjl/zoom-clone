const socket = io();
const events = {
  JOIN: "join",
  LEAVE: "leave",
  MESSAGE: "message",
  USERNAME: "username",
  ROOM: "room",
};
const roomForm = document.getElementById("room-form");
const msgForm = document.getElementById("message-form");
const title = document.querySelector("h2");
const subtitle = msgForm.querySelector("h3");
const chatList = document.getElementById("chat-list");
const roomList = document.getElementById("room-list");
const nameBtn = document.querySelector("button");

const getNickname = () => {
  const defaultName = "Harry Potter";
  const username = prompt("What's  your nickname?", defaultName);
  localStorage.setItem("username", username);
  return username;
};

const drawRoom = (name) => {
  roomForm.hidden = true;
  roomList.hidden = true;
  msgForm.hidden = false;
  nameBtn.hidden = false;
  title.innerHTML = `Room #${name}`;
  const username = localStorage.getItem("username");
  subtitle.innerHTML = `Hi, ${username} 👋`;
};

const drawMsg = (text) => {
  const msg = document.createElement("li");
  msg.innerHTML = text;
  chatList.append(msg);
};

const drawNotis = (text) => {
  const noti = document.getElementById("notification");
  noti.innerHTML = `💡 ${text}`;
  setTimeout(() => (noti.innerHTML = ""), 5000);
};

const drawRoomList = (rooms) => {
  if (roomList.hidden) return;
  if (rooms.length === 0) return;

  roomList.innerHTML = "";
  rooms.forEach((element) => {
    const li = document.createElement("li");
    const room = document.createElement("a");
    room.innerHTML = element;
    li.append(room);
    roomList.append(li);

    room.addEventListener("click", (e) => {
      e.preventDefault();
      socket.emit(events.JOIN, element, getNickname(), () => {
        drawRoom(element);
      });
    });
  });
};

const handleRoomFormSubmit = (e) => {
  e.preventDefault();
  const input = roomForm.querySelector("input[type='text']");
  socket.emit(events.JOIN, input.value, getNickname(), () => {
    drawRoom(input.value);
  });
};

const handleMsgFormSubmit = (e) => {
  e.preventDefault();
  const input = msgForm.querySelector("input[type='text']");
  const msg = input.value;
  socket.emit(events.MESSAGE, msg, () => {
    drawMsg(`You: ${msg}`);
  });
  input.value = "";
};

const handleNameChangeBtnClick = (e) => {
  e.preventDefault();
  const username = localStorage.getItem("username");
  const newName = prompt("Type your new nickname.", username);
  socket.emit(events.USERNAME, newName, () => {
    localStorage.setItem("username", newName);
    subtitle.innerHTML = `Hi, ${newName} 👋`;
  });
};

socket.on(events.JOIN, (user) => {
  const msg = `${user} just joined!`;
  drawNotis(msg);
});

socket.on(events.LEAVE, (user) => {
  const msg = `${user} just left!`;
  drawNotis(msg);
});

socket.on(events.MESSAGE, (user, msg) => {
  drawMsg(`${user}: ${msg}`);
});

socket.on(events.ROOM, (rooms) => {
  drawRoomList(rooms);
});

roomForm.addEventListener("submit", handleRoomFormSubmit);
msgForm.addEventListener("submit", handleMsgFormSubmit);
nameBtn.addEventListener("click", handleNameChangeBtnClick);
