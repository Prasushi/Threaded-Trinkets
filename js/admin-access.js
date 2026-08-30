document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("adminLoginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const loginError = document.getElementById("loginError");

    const ADMIN_USERNAME = "threaded__trinkets";
    const ADMIN_PASSWORD = "Pranitha@246";

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            sessionStorage.setItem("threadedTrinketsAdminAuthenticated", "true");
            window.location.href = "admin.html";
            return;
        }

        loginError.textContent = "Incorrect username or password.";
        passwordInput.value = "";
        passwordInput.focus();
    });
});
