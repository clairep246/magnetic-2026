import { supabase } from "../../src/supabaseClient.js";

console.log("JS CONNECTED");

export async function login() {

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

// Check if the button exists before attaching the listener
const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
    loginBtn.addEventListener("click", () => {
        login();
    });
}