import baseURL from "./scripts/baseURL.js";

document.querySelector("#navbar").innerHTML = `
<nav>
  <div class="nav-logo">
    <img src="/images/logo.png" alt="logo">
  </div>
  <div id="nav-menu">
      <li><a href="">Pit Stop</a></li>
      <li><a href="">Updates</a></li>
      <li><a href="">Discord</a></li>
      <li><a href="/pages/about.html">About</a></li>
      <li><a href="">Merch</a></li>
  </div>
  <div id="nav-user">
    <div id="nav-user-avatar">
      <img src="/images/helmet.png" alt="user-avatar">
    </div>
    <div id="nav-user-details">
      <h4 id="loggedname" style="color:white; margin-bottom: 3px;" >Guest</h4>
      <div id="nav-user-auth">
        <button id="nav-acc-btn">CREATE ACCOUNT</button>
        <button id="nav-login-btn">SIGN IN</button>
        <div id="nav-wpm"><span>0</span>&nbsp;WPM</div>
        <div id="nav-races"><span>0</span>&nbsp;Races</div>
      </div>
    </div>
  </div>
</nav>
`;

let loggedname = localStorage.getItem("loggedname");
let loggedUser = JSON.parse(localStorage.getItem("loggedUser") || "null");

if (loggedname && loggedUser) {
  document.querySelector("#nav-wpm span").innerHTML = loggedUser.wpm ?? 0;
  document.querySelector("#nav-races span").innerHTML = loggedUser.races ?? 0;
  document.getElementById("loggedname").innerText = loggedname;
  document.getElementById("nav-acc-btn").classList.add("div-hide");
  document.getElementById("nav-login-btn").innerText = "LOG OUT";
} else {
  document.getElementById("loggedname").innerText = "Guest";
  document.getElementById("nav-acc-btn").classList.remove("div-hide");
  document.getElementById("nav-login-btn").innerText = "SIGN IN";
}

let create_account_btn = document.getElementById("nav-acc-btn");
create_account_btn.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "/pages/signup.html";
});

let signin_btn = document.getElementById("nav-login-btn");
signin_btn.addEventListener("click", (e) => {
  e.preventDefault();
  if (signin_btn.innerText === "SIGN IN") {
    window.location.href = "/pages/login.html";
  } else {
    let token = localStorage.getItem("token");
    fetch(baseURL + "/api/user/logout", {
      headers: {
        Authorization: `${token}`,
        "Content-type": "application/json",
      },
    });
    localStorage.removeItem("loggedname");
    localStorage.removeItem("token");
    localStorage.removeItem("loggedUser");
    alert("Log out Succesfull");
    window.location.href = "/index.html";
  }
});

let logo_btn = document.querySelector(".nav-logo");
logo_btn.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "/index.html";
});

function connection() {
  let socket = io(baseURL, { transports: ["websocket"] });
  return socket;
}

export default connection;
