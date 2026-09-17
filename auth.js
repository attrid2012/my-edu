function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please enter your email and password.");
        return;
    }

    // Demo login for the static GitHub version
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("userEmail", email);

    window.location.href = "dashboard.html";
}

function logout() {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userEmail");

    window.location.href = "index.html";
}
