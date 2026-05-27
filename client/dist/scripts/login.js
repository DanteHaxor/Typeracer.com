
// import navbar from "./navbar.js"
import baseURL from "./baseURL.js"
// document.getElementById("navbar").innerHTML=navbar();


let form = document.querySelector("form");
form.addEventListener("submit",(event)=>{       
    event.preventDefault();
    let obj={
        email: form.email.value,
        password: form.password.value
    }
    console.log(obj)
    loginFromDb(obj);
})

async function loginFromDb(obj){
    try {
        let url = baseURL+"/api/user/login"
        let res = await fetch(url,{
            method:"POST",
            headers: {
                "Content-Type": "application/json"
            },
            body:JSON.stringify(obj)
        });
        let data = await res.json();

        if(res.status==200){
            alert(data.msg);
            console.log(data.token,data.user);
            let token= data.token;
            let loggedUser= data.user;
            let loggedname=data.user.name;
            localStorage.setItem("loggedname",loggedname);
            localStorage.setItem("token",token);
            localStorage.setItem("loggedUser",JSON.stringify(loggedUser));
            window.location.assign("/");

        }else if(res.status==409){
            alert(data.msg);
            window.location.assign("/pages/signup.html"); 
        }else{
            alert(data.msg);
        }

    } catch (error) {
        alert(error.message);
    }
};
// let token = localStorage.getItem("token");
// let adminToken = localStorage.getItem("adminToken");

// let dropdown_content= document.getElementById("nav-dropdown-content");
// if(token || adminToken){   
//     dropdown_content.innerHTML= `
//     <button id="nav-mid-dropdown-btn1" onclick="location.href='/frontend/update_user.html'">Account Details</button>
//     <button id="nav-mid-dropdown-btn2" onclick="location.href='/frontend/order_history.html'">Order History</button>
//     <button id="nav-mid-dropdown-btn3">Log out</button>
//     `;
//     let logout_btn = document.getElementById("nav-mid-dropdown-btn3");
    
//     logout_btn.addEventListener("click",()=>{
//         localStorage.clear();
//         dropdown_content.innerHTML= `
//         <button id="nav-mid-dropdown-btn1" onclick="location.href='/frontend/login.html'">Sign In</button>
//         <button id="nav-mid-dropdown-btn2" onclick="location.href='/frontend/signup.html'">Create Account</button>
//         `;
//         window.location.assign("/index.html");
//     })
// }

// getUserName();
// async function getUserName(){
//     try {
//         let url = baseURL+"/username"
//         let res = await fetch(url,{
//             headers: {
//                 "token":token
//             }
//         });
//         let data = await res.json();
//         if(data.user){
//             localStorage.setItem("loggedUser",data.user)
//         }else{
//             localStorage.setItem("loggedUser","Guest")
//         }
        
//     } catch (error) {
//         alert(error.message)
//     }
// }
