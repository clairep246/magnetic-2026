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

//open and close pop ups
const openChangebtn = document.getElementById("change");
const closeChangebtn = document.getElementById("close");
const changePopup = document.getElementById("changeEmailPassword");
const navBar = document.querySelector(".navbar");
const mainSection = document.querySelector(".friendPage");

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
document.getElementById("signout").addEventListener("click", signOut);

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } 
}

function success(position) {
  console.log("Latitude: " + position.coords.latitude +
  "<br>Longitude: " + position.coords.longitude);
}

function error() {
  alert("Sorry, no position available.");
}