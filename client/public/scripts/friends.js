import baseURL from "./baseURL.js";

function connection() {
  let socket = io(baseURL, { transports: ["websocket"] });
  return socket;
}
let socket = connection();

const urlParams = new URLSearchParams(window.location.search);
const room = urlParams.get("room");

let loggedUser = JSON.parse(localStorage.getItem("loggedUser")) || null;
let loggedname = localStorage.getItem("loggedname");

function getRaceUsername() {
  if (loggedname) return loggedname;
  const random = Math.floor(Math.random() * 9000);
  return "Guest " + random;
}

function userRaceBar(name, tag, avatar, j) {
  return `
    <tr class="race-row">
        <td class="progressBarCont">
            <div class="progressBar">
                <div id="avatar${j}" class="avatar avatar-self">
                    <div class="nameContainer">
                        <div class="client-name">${name}</div>
                        <span class="client-label">${tag}</span>
                    </div>
                    <div class="avatarContainer">
                        <img width="100%" src=${avatar} alt="avatar">
                    </div>
                </div>                            
            </div>
        </td>
        <td class="rankPanelCont">
            <div class="rankPanel">
            <div id="rank${j}" class="ranks">&nbsp;</div>
            <div id="player-${j}" class="rankWpm rankWpm-self">0 wpm</div>
            </div>
        </td>
    </tr>
    `;
}

function renderRaceUsers(users, myUsername, playerRowMap) {
  const tbody = document.querySelector("#tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  Object.keys(playerRowMap).forEach((key) => delete playerRowMap[key]);
  users.forEach((u, j) => {
    playerRowMap[u.username] = j;
    const tag = u.username === myUsername ? "you" : "racer";
    tbody.innerHTML += userRaceBar(
      u.username,
      tag,
      "../images/avatars/basic-brown.svg",
      j
    );
  });
}

function updateRaceProgress(raceObj, checkmsg, myUsername, playerRowMap, onFinish) {
  if (!checkmsg) return;

  for (const [name, stats] of Object.entries(raceObj)) {
    const row = playerRowMap[name];
    if (row === undefined) continue;

    const wpm = stats.wpm || 0;
    const progress = stats.progress || 0;
    const wpmEl = document.getElementById(`player-${row}`);
    const avatarEl = document.getElementById(`avatar${row}`);
    if (wpmEl) wpmEl.innerText = wpm + " wpm";
    if (!avatarEl) continue;

    const padding = Math.min(900, (900 / checkmsg.length) * progress);
    avatarEl.style.paddingLeft = padding + "px";
  }

  const sorted = Object.entries(raceObj)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.progress - a.progress);

  const finisher = sorted.find((p) => p.progress >= checkmsg.length);
  if (!finisher) return;

  const rank = sorted.findIndex((p) => p.name === finisher.name) + 1;
  const row = playerRowMap[finisher.name];
  const rankEl = row !== undefined ? document.getElementById(`rank${row}`) : null;
  if (rankEl) rankEl.innerText = "rank " + rank;

  if (finisher.name === myUsername) {
    onFinish(finisher.wpm || 0, rank);
  }
}

let racebody = document.getElementById("race");
let backBtn = document.getElementById("back-btn");

let checkmsg;
const myUsername = getRaceUsername();
let raceFinished = false;
const playerRowMap = {};

socket.emit("user", { username: myUsername, room: room });

socket.on("number of users", (users) => {
  renderRaceUsers(users, myUsername, playerRowMap);
  outputRoomName(users);
  outputRoomUsers(users);
});

socket.on("content", (msg) => {
  checkmsg = msg;
  const givenText = document.getElementById("ptag");
  if (givenText) givenText.innerText = msg;
});

socket.on("status", ([raceObj, flag, , typer]) => {
  if (raceFinished) return;
  const ibox = document.getElementById("ibox");
  if (typer === myUsername) {
    ibox.style.background = flag === false ? "red" : "white";
  }
  updateRaceProgress(raceObj, checkmsg, myUsername, playerRowMap, (wpm, rank) => {
    raceFinished = true;
    if (loggedUser) {
      increase_wpm_In_UserModel(loggedUser._id, wpm);
    }
    alert("You finished rank " + rank + " at " + wpm + " WPM");
    window.location.href = "/index.html";
  });
});

document.getElementById("ibox").addEventListener("input", () => {
  socket.emit("type message", document.getElementById("ibox").value);
});

backBtn.addEventListener("click", () => {
  window.location.href = "/index.html";
});

const chatMessage = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const chatForm = document.getElementById("chat-form");

socket.on("message", (msg) => {
  outputMessage(msg);
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let msg = e.target.elements.msg.value;
  msg = msg.trim();
  if (!msg) return false;
  socket.emit("msg", msg);
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  const p = document.createElement("p");
  p.classList.add("meta");
  p.innerText = message.username + " ";
  p.innerHTML += `<span>${message.time}</span>`;
  const para = document.createElement("p");
  para.classList.add("text");
  para.innerText = message.text;
  div.append(p, para);
  chatMessage.append(div);
}

function outputRoomName(users) {
  if (users.length) roomName.innerText = users[0].room;
}

function outputRoomUsers(users) {
  userList.innerHTML = "";
  users.forEach((user) => {
    const li = document.createElement("li");
    li.innerText = user.username;
    userList.append(li);
  });
}

async function increase_wpm_In_UserModel(user_id, wpm) {
  try {
    const url =
      baseURL + "/api/user/updateWPM?user_id=" + user_id + "&wpm=" + wpm;
    const res = await fetch(url);
    const data = await res.json();
    if (res.status === 200) {
      localStorage.setItem("loggedname", data.user.name);
      localStorage.setItem("loggedUser", JSON.stringify(data.user));
    }
  } catch (error) {
    console.log(error);
  }
}
