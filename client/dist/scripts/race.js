import connection from "/main.js";
import baseURL from "./baseURL.js";

let socket;
function getSocket() {
  if (!socket) socket = connection();
  return socket;
}

const app = document.getElementById("app");

let loggedname = localStorage.getItem("loggedname");
let loggedUser = JSON.parse(localStorage.getItem("loggedUser")) || null;

function getRaceUsername() {
  if (loggedname) return loggedname;
  const random = Math.floor(Math.random() * 9000);
  return "Guest " + random;
}

function mainContent() {
  return `
  <div id="race-global">
        <div id="race-global-body">
          <div id="race-logo">
            <img alt="logo" src="/images/flash - Edited (1).png" />
          </div>
          <div id="race-global-text">
            <h2>Type Battle - The Global Typing Competition</h2>
            <p>Increase your typing speed while racing against others!</p>
          </div>
        </div>
        <button id="race-global-btn">Enter a Typing Race</button>
      </div>

      <div id="race-pvt">
        <div id="race-practice">
          <div id="race-practice-text">
              <h3>Typing Test</h3>
              <p>Improve your typing skills on your own</p>
          </div>
          <button id="race-practice-btn">Practice Yourself</button>
        </div>

        <div id="race-friends">
          <div id="race-friends-text">
            <h3>Race your friends</h3>
            <p>Create your own racetrack and play with friends</p>
        </div>
        <button id="race-friends-btn">Create Racetrack</button>
        </div>

      </div>
  `;
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

app.innerHTML = `
<div id="race">
${mainContent()}
</div>
`;

let racebody = document.getElementById("race");

let raceGlobalBtn = document.getElementById("race-global-btn");
raceGlobalBtn.addEventListener("click", () => {
  if (loggedUser) {
    increase_Races_In_UserModel(loggedUser._id);
  }

  const myUsername = getRaceUsername();

  racebody.innerHTML = `
  <div class="race-cont">
        <div class="race-status">The race is on. Type the text below:</div>
        <div class="race-body">
            <table>
                <tbody id="tbody">
                </tbody>
            </table>
        </div>
        <div class="race-text-cont">
            <div class="given-text">
                <p id="ptag">Loading race text...</p>
            </div>
            <div class="input-text">
                <input id="ibox" autocomplete="off" />
            </div>
        </div>
        <button id="back-btn">Back to Main Menu</button>
    </div>
  `;

  let checkmsg;
  let raceFinished = false;
  const playerRowMap = {};

  getSocket().emit("user", { username: myUsername, room: "guest" });

  getSocket().on("number of users", (users) => {
    renderRaceUsers(users, myUsername, playerRowMap);
  });

  getSocket().on("content", (msg) => {
    checkmsg = msg;
    document.getElementById("ptag").innerText = msg;
  });

  getSocket().on("status", ([raceObj, flag, , typer]) => {
    if (raceFinished) return;
    const ibox = document.getElementById("ibox");
    if (typer === myUsername) {
      ibox.style.background = flag === false ? "red" : "white";
    }
    updateRaceProgress(raceObj, checkmsg, myUsername, playerRowMap, (wpm, rank) => {
      raceFinished = true;
      if (loggedUser) {
        document.querySelector("#nav-wpm span").innerHTML = wpm;
        increase_wpm_In_UserModel(loggedUser._id, wpm);
      }
      swal({
        text: "You finished rank " + rank + " at " + wpm + " WPM",
        icon: "success",
        button: "ok",
        timer: 2000,
      });
      setTimeout(() => {
        window.location.href = "/index.html";
      }, 2000);
    });
  });

  document.getElementById("ibox").addEventListener("input", () => {
    getSocket().emit("type message", document.getElementById("ibox").value);
  });

  document.getElementById("back-btn").addEventListener("click", () => {
    window.location.href = "/index.html";
  });
});

let racepracticeBtn = document.getElementById("race-practice-btn");
racepracticeBtn.addEventListener("click", () => {
  const displayName = loggedname || "Guest";

  racebody.innerHTML = `
  <div class="race-cont">
  <div class="race-status">The race is on. Type the text below:</div>
  <div class="race-body">
      <table>
          <tbody>
              <tr class="race-row">
                  <td class="progressBarCont">
                      <div class="progressBar">
                          <div class="avatar avatar-self" id="practice-avatar">
                              <div class="nameContainer">
                                  <div class="client-name">${displayName}</div>
                                  <span class="client-label">(you)</span>
                              </div>
                              <div class="avatarContainer">
                                  <img width="100%" src="../images/avatars/basic-blue.svg" alt="avatar">
                              </div>
                          </div>                            
                      </div>
                  </td>
                  <td class="rankPanelCont">
                      <div class="rankPanel">
                          <div class="rank">&nbsp;</div>
                          <div id="practice-wpm" class="rankWpm rankWpm-self">0 wpm</div>
                      </div>
                  </td>
              </tr>
          </tbody>
      </table>
  </div>
  <div class="race-text-cont">
      <div class="given-text">
          <p id="ptag">Loading race text...</p>
      </div>
      <div class="input-text">
          <input id="ibox" autocomplete="off" />
      </div>
  </div>
  <button id="back-btn">Back to Main Menu</button>
</div>
  `;

  let checkmsg;
  let practiceStart = Date.now();

  getSocket().emit("user enter in room", { username: displayName });

  getSocket().on("content", (msg) => {
    checkmsg = msg;
    document.getElementById("ptag").innerText = msg;
    practiceStart = Date.now();
  });

  document.getElementById("ibox").addEventListener("input", () => {
    const value = document.getElementById("ibox").value;
    let progress = 0;
    let flag = true;
    const ibox = document.getElementById("ibox");
    ibox.style.background = "white";

    for (let i = 0; i < value.length; i++) {
      if (checkmsg && value[i] !== checkmsg[i]) {
        ibox.style.background = "red";
        flag = false;
      } else if (flag) {
        progress++;
      }
    }

    const elapsedMin = Math.max((Date.now() - practiceStart) / 60000, 1 / 60);
    const wpm = Math.max(0, Math.round(progress / 5 / elapsedMin));
    document.getElementById("practice-wpm").innerText = wpm + " wpm";

    if (checkmsg) {
      const padding = Math.min(900, (900 / checkmsg.length) * progress);
      document.getElementById("practice-avatar").style.paddingLeft = padding + "px";
    }
  });

  document.getElementById("back-btn").addEventListener("click", () => {
    window.location.href = "/index.html";
  });
});

let racefriendsBtn = document.getElementById("race-friends-btn");
racefriendsBtn.addEventListener("click", () => {
  window.location.href = "/pages/roomNo.html";
});

async function increase_Races_In_UserModel(user_id) {
  try {
    const url = baseURL + "/api/user/updateRaceCount/" + user_id;
    const res = await fetch(url);
    const data = await res.json();
    if (res.status === 200) {
      localStorage.setItem("loggedname", data.user.name);
      localStorage.setItem("loggedUser", JSON.stringify(data.user));
      loggedUser = data.user;
    } else {
      alert(data.msg);
    }
  } catch (error) {
    alert(error.message);
  }
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
      loggedUser = data.user;
    }
  } catch (error) {
    console.log(error);
  }
}
