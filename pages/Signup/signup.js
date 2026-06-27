import { supabase } from "../../src/supabaseClient.js";

async function signup() {
    try {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!name) {
        alert("Please enter your name");
        return;
    }

    if (!email) {
        alert("Please enter your email");
        return;
    }

    if (!password) {
        alert("Please enter your password");
        return;
    }

    const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                name: name
            }
        }
    });

    if (error) {
        alert(error.message);
        return;
    }

    alert("Signup successful!");
    window.location.href = "../EditProfile/edit.html";

} catch (error) {
    console.error("Error during signup:", error);
    alert("An error occurred during signup. Please try again.");
}
}

document.getElementById("signUp").addEventListener("click", () => signup());