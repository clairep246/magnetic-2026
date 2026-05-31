import { supabase } from "../../src/supabaseClient.js";

async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        alert("Error signing out: " + error.message);
        return;
    }

    alert("Successfully signed out!");
    window.location.href = "../Login/login.html";
}

document.getElementById("signout").addEventListener("click", signOut);
