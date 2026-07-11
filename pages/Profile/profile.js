import { supabase } from "../../src/supabaseClient.js";

document.addEventListener('DOMContentLoaded', () => {
    const dropdowns = document.querySelectorAll('.dropDown');

    dropdowns.forEach(dropdown => {
        const button = dropdown.querySelector('.links button');
        let timeout;

        button.addEventListener('click', () => {
            dropdown.classList.toggle('active');

            clearTimeout(timeout);

            timeout = setTimeout(() => {
                dropdown.classList.remove('active');
            }, 2000);
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropDown')) {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
});
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

//open and close pop ups
const openChangebtn = document.getElementById("change");
const closeChangebtn = document.getElementById("close");
const changePopup = document.getElementById("changeEmailPassword");
const navBar = document.querySelector(".navbar");
const mainSection = document.querySelector(".Page");

function openPopup(popupElement) {
    popupElement.style.setProperty("display", "flex", "important");
    popupElement.style.flexDirection = "column";
    navBar.style.opacity = "0.5";
    if (mainSection) { mainSection.style.opacity = "0.5"; }

    if (typeof interestPopup !== "undefined" && popupElement == interestPopup) {
        resetInterestPopup();
    }
}

function closePopup(popupElement) {
    popupElement.style.display = "none";
    navBar.style.opacity = "1";
    if (mainSection) { mainSection.style.opacity = "1"; }
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
    
    document.getElementById("profilePhoto").src = profile.profilePicUrl|| "/images/default-profile.jpg";

    console.log("Profile loaded successfully");
    } catch (error) {
        console.log("Failed to load profile:", error);
    }
}

document.getElementById("signout").addEventListener("click", signOut);
displayProfile();
