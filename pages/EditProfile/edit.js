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

//sign out
async function signOut() {
    try {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw error;
        return;
    }

    alert("Successfully signed out!");
    window.location.href = "../Login/login.html";
} catch (error) {
    console.log("failed to sign out", error);
    alert("Failed to signout, please try again")
}
}

//change password and email
const open = document.getElementById("change");
const close = document.getElementById("close");
const changePopup = document.getElementById("changeEmailPassword");
const navBar = document.querySelector(".navbar");
const mainSection = document.querySelector(".EditProfile")

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

// For editing mode
async function loadProfileDetails() {
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            throw authError;
        }

        const { data, error: getError } = await supabase
            .from("Profile")
            .select("*")
            .eq("created_by", user.id);

        if (getError) {
            throw getError;
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

        // Pre-fill in 
        document.getElementById("name").value = profile.name || "";
        document.getElementById("about").value = profile.about || "";
        document.getElementById("telegramHandle").value = profile.telegram || "";
        document.getElementById("residence").value = profile.residences || "";
        document.getElementById("year").value = profile.year_of_study || "";
        document.getElementById("major").value = profile.major || "";

        
        document.querySelectorAll(".interests button").forEach(button => {
            if (store.includes(button.textContent)) {
                button.classList.add("selected");
            }
        });

    } catch (error) {
        console.log("Failed to prefill profile:" + error);
    }
}

// Saving profile
async function saveProfile() {
    const saveButton = document.getElementById("save");
    saveButton.textContent = isEditing ? "Updating..." : "Saving...";

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            throw authError;
        }

        const name = document.getElementById("name").value;
        const about = document.getElementById("about").value;
        const telegramHandle = document.getElementById("telegramHandle").value;
        const residence = document.getElementById("residence").value;
        const year = document.getElementById("year").value;
        const major = document.getElementById("major").value;
        const checked =document.querySelectorAll('input[name="interests"]:checked');
        const interests = Array.from(checked).map(x => x.value);
        const profileData = {
            created_by: user.id,
            name: name,
            about: about,
            telegram: telegramHandle,
            residences: residence,
            year_of_study: year,
            major: major,
            interest: interests,
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
        
        if (checked.length > 3) {
            alert(`You can only select up to 3 interests!`);
        }
        if (isEditing) {
            const { error: updateError } = await supabase
                .from("Profile")
                .update(profileData)
                .eq("created_by", user.id)
                .select();

            if (updateError) {
                throw updateError;
            }

        } else {
            const { error: insertError } = await supabase
                .from("Profile")
                .insert([profileData])
                .select();

            if (insertError) {
                throw insertError;
            }
        }

        /*await supabase.functions.invoke("new_embed", {
                body: {
                    userId: user.id,
                    about: about
                }
                });*/
        alert(isEditing ? "Profile successfully updated!"
                        : "Profile successfully created!");

        window.location.href = "../Profile/profile.html";

    } catch (error) {
        console.log("Failed to save profile:" + error);
        alert("Failed to save profile. Please try again");
    } finally {
            saveButton.textContent = "Save";
        }
}

document.querySelectorAll(".interests button").forEach(button => {
    button.addEventListener("click", () => selectedInterests(button));
});

document.getElementById("save").addEventListener("click", saveProfile);
document.getElementById("signout").addEventListener("click", signOut);
loadProfileDetails();
