import { supabase } from "../../src/supabaseClient.js";

console.log("JS CONNECTED");

async function login() {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email) {
        alert("Please enter your email");
        return;
    }

    if (!password) {
        alert("Please enter your password");
        return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        alert(error.message);
        return;
    }

    alert("Login successful!");

    window.location.href = "../Profile/profile.html";
}

document.getElementById("loginBtn")
.addEventListener("click", () => {
    login();
});