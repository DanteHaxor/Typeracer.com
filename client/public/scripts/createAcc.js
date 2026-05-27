const createacc = document.getElementById("create-acc-sec");
const loggedname = localStorage.getItem("loggedname");
const loggedUser = JSON.parse(localStorage.getItem("loggedUser") || "null");

if (loggedname && loggedUser) {
  createacc.innerHTML = "";
  createacc.style.display = "none";
} else {
  createacc.innerHTML = `
    <div id="create-acc">
      <div id="create-acc-img">
        <img src="/images/cars-sherrif.png" alt="sherriff">
      </div>
      <div id="create-acc-text">
        <h2>Record your races with a Type Battle Account!</h2>
        <p>Save your race history and scores. It's free, why not?</p>
      </div>
      <button id="create-acc-btn">Create Your Account</button>
    </div>
  `;

  document.getElementById("create-acc-btn").addEventListener("click", () => {
    window.location.href = "/pages/signup.html";
  });
}
