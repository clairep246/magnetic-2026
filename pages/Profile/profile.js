import { supabase } from "../../src/supabaseClient.js";

//sign out
async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            alert("Error signing out: " + error.message);
            return;
        }

        alert("Successfully signed out!");
        window.location.href = "../Login/login.html";
    } catch (error) {
        console.log(error);
        alert("Failed to sign out, please try again")
    }
}

//change password and email
const open = document.getElementById("change");
const close = document.getElementById("close");
const changePopup = document.getElementById("changeEmailPassword");
const navBar = document.querySelector(".navbar");
const mainSection = document.querySelector(".Page")

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

//display profile details
async function displayProfile() {
    try {
        const {data: { user }, error: authError} = await supabase.auth.getUser();
    
    if (authError || !user) {
        throw authError;
    }
    
    const {data: profiles, error: getError} = await supabase
        .from("Profile")
        .select("*")
        .eq("created_by", user.id);

    if (getError) {
            throw getError;
        }

    const profile = profiles[0];

    if (!profile) {
        console.log("No profile found for current user");
        return;
    }

    document.getElementById("name").textContent = profile.name || "";
    document.getElementById("about").textContent = profile.about || "";
    document.getElementById("telegram").textContent = profile.telegram || "";
    document.getElementById("residences").textContent = profile.residences || "";
    document.getElementById("year").textContent = profile.year_of_study || "";
    document.getElementById("major").textContent = profile.major || "";
    document.getElementById("interests").textContent = Array.isArray(profile.interest)
        ? profile.interest.join(", ")
        : "";

    console.log("Profile loaded successfully");
    } catch (error) {
        console.log("Failed to load profile:", error);
    }
}

document.getElementById("signout").addEventListener("click", signOut);
displayProfile();
