import baseURL from "./baseURL.js";

let user_Obj;
let registration_form = document.getElementById("registration");
let otp_form = document.getElementById("otp_form");
let registration_otp = document.getElementById("registration_otp");
let reg_form = document.querySelector("#registration_form");

registration_otp.style.display = "none";

reg_form.addEventListener("submit", (event) => {
  event.preventDefault();
  const obj = {
    name: `${reg_form.fname.value} ${reg_form.lname.value}`,
    email: reg_form.email.value,
    password: reg_form.password.value,
  };
  send_Reg_Req(obj);
});

async function send_Reg_Req(obj) {
  try {
    const url = baseURL + "/api/user/register_validate";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    });

    const data = await res.json();

    if (res.status === 200) {
      if (data.devMode && data.devOtp) {
        console.log("%c[Type Battle] Dev OTP:", "color:#005894;font-weight:bold;font-size:14px", data.devOtp);
        console.log("[Type Battle] Use this code on the verification screen (email not sent in dev mode).");
      }
      alert(data.msg);
      user_Obj = {
        name: obj.name,
        email: obj.email,
      };
      registration_form.style.display = "none";
      registration_otp.style.display = "block";
    } else {
      alert(data.msg);
    }
  } catch (error) {
    alert("Something went wrong!");
    console.log(error);
  }
}

otp_form.addEventListener("submit", (event) => {
  event.preventDefault();
  const otp_entered = document.getElementById("otp").value.trim();
  user_Reg({ ...user_Obj, otp: otp_entered });
});

async function user_Reg(payload) {
  try {
    const url = baseURL + "/api/user/register";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (res.status === 200) {
      alert(data.msg);
      window.location.assign("/pages/login.html");
    } else {
      alert(data.msg);
    }
  } catch (error) {
    alert("Something went wrong!");
    console.log(error);
  }
}
