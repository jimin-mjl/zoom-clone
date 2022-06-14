const msgForm = document.getElementById("message-form");
const nicknameForm = document.getElementById("nickname-form");
const main = document.querySelector("main");
const title = document.querySelector("h2");
const socket = new WebSocket("ws://" + window.location.host);

const SerializeMsg = (type, text) => {
  const data = {
    type: type,
    content: text,
  };
  return JSON.stringify(data);
};

socket.addEventListener("open", (e) => {
  console.log("🔥 Socket connected to Server");
});

socket.addEventListener("close", (e) => {
  console.log("💔 Socket disconnected from Server");
});

socket.addEventListener("message", (e) => {
  const chatList = document.getElementById("chat-list");
  const newMsg = document.createElement("li");
  newMsg.innerHTML = e.data;
  chatList.appendChild(newMsg);
});

msgForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = msgForm.querySelector("input[type='text']");
  socket.send(SerializeMsg("message", input.value));
});

nicknameForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = nicknameForm.querySelector("input[type='text']");
  title.innerHTML = `Hi, ${input.value} 👋`;
  msgForm.style.display = "block";
  main.removeChild(nicknameForm);
  socket.send(SerializeMsg("nickname", input.value));
});
