const login = document.querySelector("#login");
const username = document.querySelector("#username");
const error = document.querySelector("#error");

login.addEventListener("submit", (e) => {
  e.preventDefault();

  if (username.value === "") {
    error.innerHTML = "Username is required";
  } else {
    window.location.replace(
      `http://localhost:5000/pages/chat.html?username=${username.value}`
    );
  }
});
