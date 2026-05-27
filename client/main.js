import baseURL from './public/scripts/baseURL';
import './style.css'

// Navbar import
document.querySelector('#navbar').innerHTML = `
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
`

// get user from localStorage
let loggedname=localStorage.getItem("loggedname");
let loggedUser=JSON.parse(localStorage.getItem("loggedUser"));
console.log(loggedUser)
if(loggedname){
  document.querySelector("#nav-wpm span").innerHTML=loggedUser.wpm;
  document.querySelector("#nav-races span").innerHTML=loggedUser.races;
}

if(loggedname){
  document.getElementById("loggedname").innerText=loggedname;
  document.getElementById("nav-acc-btn").classList.add("div-hide");
  document.getElementById("nav-login-btn").innerText="LOG OUT";
}else{
  document.getElementById("loggedname").innerText="Guest";
  document.getElementById("nav-acc-btn").classList.remove("div-hide");
  document.getElementById("nav-login-btn").innerText="SIGN IN";
}



const latest_tbody=document.querySelector("#latest");
const myscores_tbody=document.querySelector("#my-scores");
const hof_tbody=document.querySelector("#hof");

// Display Latest scores
function displayLatest(arr) {
  latest_tbody.innerHTML="";
  arr.forEach(function(elem,index){
      let row=document.createElement("tr");
      let td1=document.createElement("td");
      let no=1;
      td1.innerText=no++;
      let td2=document.createElement("td");
      td2.innerText=elem.name;
      let td3=document.createElement("td");
      td3.innerText=elem.speed;
      let td4=document.createElement("td");
      td4.innerText=elem.time;
      row.append(td1,td2,td3,td4);
      latest_tbody.append(row);
  });
}

// Display users scores
function displayMyscores(arr) {
  myscores_tbody.innerHTML="";
  arr.forEach(function(elem,index){
      let row=document.createElement("tr");
      let td1=document.createElement("td");
      let no=1;
      td1.innerText=no++;
      let td2=document.createElement("td");
      td2.innerText=elem.speed;
      let td3=document.createElement("td");
      td3.innerText=elem.accuracy;
      let td4=document.createElement("td");
      td4.innerText=elem.date;
      row.append(td1,td2,td3,td4);
      myscores_tbody.append(row);
  });
}

function displayhof(arr) {
  hof_tbody.innerHTML="";
  arr.forEach(function(elem,index){
      let row=document.createElement("tr");
      let td1=document.createElement("td");
      let no=1;
      td1.innerText=no++;
      let td2=document.createElement("td");
      td2.innerText=elem.name;
      let td3=document.createElement("td");
      td3.innerText=elem.avgspeed;
      let td4=document.createElement("td");
      td4.innerText=elem.races;
      row.append(td1,td2,td3,td4);
      hof_tbody.append(row);
  });
}

// let content=""
// //socket:-
// let socket = io("https://type-battle.onrender.com",{transports:["websocket"]});
//friend join the room
// socket.emit("user",{username,room});

// //chat message
// socket.on("message",(msg)=>{
// console.log(msg);
// })

// //broadcast
// socket.on("content",(msg)=>{
// content=msg;
// });


//redirection//
let create_account_btn = document.getElementById("nav-acc-btn");
create_account_btn.addEventListener("click",(e)=>{
  e.preventDefault();
  window.location.href="/pages/signup.html"
})
let signin_btn = document.getElementById("nav-login-btn")
signin_btn.addEventListener("click",(e)=>{
  e.preventDefault();
  if(signin_btn.innerText=="SIGN IN"){
    window.location.href="/pages/login.html"
  }else{
    let token=localStorage.getItem("token");
    fetch(baseURL+"/api/user/logout",{
      headers:{
        "Authorization":`${token}`,
        "Content-type": "application/json"
      },
    }); 
    localStorage.removeItem("loggedname");
    localStorage.removeItem("token");
    localStorage.removeItem("loggedUser");
    alert("Log out Succesfull");
    window.location.href="index.html";
  }
})

let logo_btn = document.querySelector(".nav-logo")
 logo_btn.addEventListener("click",(e)=>{
  e.preventDefault();
  window.location.href="../index.html"
 })
 
//  -----------------------------SOCKET WORKING----------------------------------//
function connection(){
  let socket = io(baseURL, { transports: ["websocket"] });
  return socket;
}

export default connection;

