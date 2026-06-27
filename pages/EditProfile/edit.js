import { supabase } from "../../src/supabaseClient.js";

let isEditing = false;

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

//open and close pop ups
const openChangebtn = document.getElementById("change");
const closeChangebtn = document.getElementById("close");
const changePopup = document.getElementById("changeEmailPassword");
const navBar = document.querySelector(".navbar");
const mainSection = document.querySelector(".EditProfile");

function openPopup(popupElement) {
    popupElement.style.setProperty("display", "flex", "important");
    popupElement.style.flexDirection = "column";
    navBar.style.opacity = "0.5";
    mainSection.style.opacity = "0.5"; 
}

function closePopup(popupElement) {
    popupElement.style.display = "none";
    navBar.style.opacity = "1";
    mainSection.style.opacity = "1"; 
}

openChangebtn.addEventListener("click", () => openPopup(changePopup));
closeChangebtn.addEventListener("click", () => closePopup(changePopup));

//update password
async function updateDetails() {
    try {
        document.getElementById("saveBtn").textContent = "Saving"
        const newPassword = document.getElementById("newPassword").value;
        const confirmPass = document.getElementById("confirmPassword").value;

        if (newPassword !== confirmPass) {
            alert("Passwords do not match. Please try again");
            return;
        }

        const {data, error: updatePasswordError} = await supabase.auth.updateUser({
            password: newPassword,
        })
        if (updatePasswordError) {
            throw updatePasswordError;
        }
        console.log("Changed password saved successfully")
        alert("Changed password  successfully")
        closePopup(changePopup);
    } catch (error) {
        console.log("Fail to update details", error);
        alert("Failed to update, please try again")
    } finally {
        document.getElementById("saveBtn").textContent = "Save";
    }

}
document.getElementById("saveBtn").addEventListener("click", async () => updateDetails())

// For editing mode: pre fill in the details
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

        profile.interest.forEach(savedValue => {
        const checkbox = document.querySelector(`input[name="interests"][value="${savedValue}"]`);
        if (checkbox != null) {
            checkbox.checked = true;
        }
    });


    } catch (error) {
        console.log("Failed to prefill profile:" + error);
    }
}
/* generating friend code for each user */
function generateFriendCode() {
  return Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();
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
        const friend_code = generateFriendCode();
        const profileData = {
            created_by: user.id,
            name: name,
            about: about,
            telegram: telegramHandle,
            residences: residence,
            year_of_study: year,
            major: major,
            interest: interests,
            friend_code: friend_code
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
            return;
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
            const {data, error: insertError } = await supabase
                .from("Profile")
                .insert([profileData])
                .select();

            if (insertError) {
                throw insertError;
            }
        }

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

document.getElementById("save").addEventListener("click", saveProfile);
document.getElementById("signout").addEventListener("click", signOut);
loadProfileDetails();
