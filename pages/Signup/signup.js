import { supabase } from "../../src/supabaseClient.js";

async function signup() {
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
    
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                name: name,
            },
        },
    });

    if (error) {
        alert(error.message);
        return;
    }

    alert("Signup successful!");

}
document.getElementById("signupBtn")
.addEventListener("click", () => {
    signup();
});

