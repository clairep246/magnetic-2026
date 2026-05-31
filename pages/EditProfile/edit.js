import { supabase } from "../../src/supabaseClient.js";

let store = [];
let isEditing = false;

// Selecting of interests buttons to be stored
function selectedInterests(button) {
    const interest = button.textContent;
    button.classList.toggle("selected");

    if (store.includes(interest)) {
        store = store.filter(x => x !== interest);
    } else {
        store.push(interest);
    }
}

// For editing mode
async function loadProfileDetails() {
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            throw new Error("User not authenticated");
        }

        const { data, error: getError } = await supabase
            .from("Profile")
            .select("*")
            .eq("created_by", user.id);

        if (getError) {
            throw new Error("Failed to get profile details");
        }

        if (data.length > 0) {
            isEditing = true; 
        } else {
            isEditing = false;
        }

        const profile = data[0];
        if (profile == null) {
            return;
        }

        // Pre-fill profile details
        document.getElementById("name").value = profile.name || "";
        document.getElementById("about").value = profile.about || "";
        document.getElementById("telegramHandle").value = profile.telegram || "";
        document.getElementById("residence").value = profile.residences || "";
        document.getElementById("year").value = profile.year_of_study || "";
        document.getElementById("major").value = profile.major || "";

        store = profile.interest

        document.querySelectorAll(".interests button").forEach(button => {
            if (store.includes(button.textContent)) {
                button.classList.add("selected");
            }
        });

    } catch (error) {
        console.log("Failed to load profile details:" + error);
    }
}

// Saving profile
async function saveProfile() {
    const saveButton = document.getElementById("save");
    saveButton.textContent = isEditing ? "Updating..." : "Saving...";

    try {
        // UserID
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            throw new Error("User not authenticated");
        }

        // Profile data
        const name = document.getElementById("name").value;
        const about = document.getElementById("about").value;
        const telegramHandle = document.getElementById("telegramHandle").value;
        const residence = document.getElementById("residence").value;
        const year = document.getElementById("year").value;
        const major = document.getElementById("major").value;

        const profileData = {
            created_by: user.id,
            name: name,
            about: about,
            telegram: telegramHandle,
            residences: residence,
            year_of_study: year,
            major: major,
            interest: store,
        };

        if (!name) {
            alert("Please enter your name");
            return;
        }

        if (!residence) {
            alert("Please select your residence");
            return;
        }

        if (!major) {
            alert("Please select your major");
            return;
        }

        if (store.length === 0) {
            alert("Please select at least one interest");
            return;
        }

        // The work
        if (isEditing) {
            const { error: updateError } = await supabase
                .from("Profile")
                .update(profileData)
                .eq("created_by", user.id)
                .select();

            if (updateError) {
                throw new Error("Failed to update profile");
            }

            alert("Profile successfully updated!");
            window.location.href = "../Profile/profile.html";
            return;

        } else {
            const { error: insertError } = await supabase
                .from("Profile")
                .insert([profileData])
                .select();

            if (insertError) {
                throw new Error("Fail to profile insert into database");
            }

            alert("Profile successfully created!");
            window.location.href = "../Profile/profile.html";
        }

    } catch (error) {
        console.log("Failed to save profile:" + error);
        alert("Failed to save profile. Please try again");

    } finally {
        saveButton.textContent = "Saved";
    }
}

document.querySelectorAll(".interests button").forEach(button => {
    button.addEventListener("click", () => selectedInterests(button));
});

document.getElementById("save").addEventListener("click", saveProfile);
loadProfileDetails();
