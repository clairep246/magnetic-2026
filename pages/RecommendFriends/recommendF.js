import { supabase } from "../../src/supabaseClient.js";
import defaultProfilePic from "../../images/default-profile.jpg";
//signout
async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        alert("Error signing out: " + error.message);
        return;
    }

    alert("Successfully signed out!");
    window.location.href = "/pages/Login/login.html";
}
//open and close pop ups
const openChangebtn = document.getElementById("change");
const closeChangebtn = document.getElementById("close");
const changePopup = document.getElementById("changeEmailPassword");
const navBar = document.querySelector(".navbar");
const mainSection = document.querySelector(".recommend-page");

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

async function loadRecommendations() {
    const { data: profiles, error } =
        await supabase.functions.invoke("recommendFriends");

    if (error) {
        console.error("Error loading recommendations:", error);
        return;
    }

    const container = document.getElementById("recommend-container");
    container.innerHTML = "";

    if (!profiles || profiles.length === 0) {
        container.innerHTML = `
            <div class="empty">
                <p>No recommended friends yet.</p>
            </div>
        `;
        return;
    }

    for (let i = 0; i < 5; i++) {
        if (i >= profiles.length) {
            break;
        }

        const profile = profiles[i];
        const reccCard = document.createElement("div");
       
        reccCard.innerHTML = `
        <div class="recommend-card">
            <img
                src=${defaultProfilePic}
                alt="Profile Picture"
                class="recommend-pic">

            <div class="recommend-info">
                <p class="recommend-name">
                    ${profile.name}
                </p>
                <p class="recommend-details">
                    <strong> Interests: </strong>${profile.interest}
                </p>
                <p class="recommend-details">
                     <strong> Friend code </strong>${profile.friend_code}
                </p>
                <p class="recommend-details">
                     <strong> Score: </strong>${Math.round(profile.interestScore * 100)}% match
                </p>
            </div>
            </div>
        `;
        container.appendChild(reccCard);
    }
    console.log(profiles);
}

// Runs when the script loads
loadRecommendations();