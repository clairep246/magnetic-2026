import { supabase } from "../../src/supabaseClient.js";

//sign out
async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        alert("Error signing out: " + error.message);
        return;
    }

    alert("Successfully signed out!");
    window.location.href = "../Login/login.html";
}

//display profile details
async function displayProfile() {
    try {
        const {data: { user }, error: authError} = await supabase.auth.getUser();
    
    if (authError || !user) {
        throw new Error("User not authenticated");
    }
    
    const {data: profiles, error: getError} = await supabase
        .from("Profile")
        .select("*")
        .eq("created_by", user.id);

    if (getError) {
            throw new Error("Failed to load profile");
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
