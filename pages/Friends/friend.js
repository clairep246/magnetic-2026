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

//change password and email
const open = document.getElementById("change");
const close = document.getElementById("close");
const changePopup = document.getElementById("changeEmailPassword");
const navBar = document.querySelector(".navbar");
const mainSection = document.querySelector(".friendPage")

open.addEventListener("click", () => {
    changePopup.style.display = "flex";
    changePopup.style.flexDirection = "column";
    navBar.style.opacity = "50%";
    mainSection.style.opacity = "50%";
});
close.addEventListener("click", () => {
    changePopup.style.display = "none";
    navBar.style.opacity = "100%";
    mainSection.style.opacity = "100%";
});

document.getElementById("signout").addEventListener("click", signOut);

async function find_matches() {
    const {data: { user }, error: authError} = await supabase.auth.getUser();
    if (authError) {
        throw authError;
    }

    const { data: profile, error: getError } = await supabase
        .from("Profile")
        .select("embedding")
        .eq("created_by", user.id)
        .single();

    if (getError) {
        throw getError;
    }
    const { data: matches } = await supabase.rpc('match_profiles', {
            query_embedding: profile.embedding, // Pass the embedding you want to compare
            match_threshold: 0.7, // Choose an appropriate threshold for your data
            match_count: 3, // Choose the number of matches
            current_user_id: user.id,
    })
    console.log(matches);
}

find_matches()