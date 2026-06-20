import { supabase } from "../../src/supabaseClient.js";

/* generating friend code for each user */
function generateFriendCode() {
  return Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();
}

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
                name: name
            }
        }
    });

    if (error) {
        alert(error.message);
        return;
    }

    const user = data.user;

    const friend_code = generateFriendCode();

    const { error: profileError } = await supabase
        .from("Profile")
        .insert([
        {
            created_by: user.id,
            friend_code: friend_code,
            name: name
        }
    ]);

  if (profileError) {
    alert(profileError.message);
    return;
  }


    alert("Signup successful!");
    window.location.href = "../EditProfile/edit.html";
}

document.getElementById("signUp").addEventListener("click", () => signup());