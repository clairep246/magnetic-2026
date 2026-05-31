import { supabase } from "../../src/supabaseClient.js";

async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        alert("Could not sign out. Please try again.");
        return;
    }

    alert("Successfully signed out!");
    window.location.href = "../Login/login.html";
}

document.getElementById("signout").addEventListener("click", signOut);
