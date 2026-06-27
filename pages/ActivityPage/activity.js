import { supabase } from "../../src/supabaseClient.js";

let index = 0;
let activities = []

//sign out
async function signOut() {
    try {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw new error;
        return;
    }

    alert("Successfully signed out!");
    window.location.href = "../Login/login.html";
} catch (error) {
    console.log("Fail to signed out:", error);
    alert("Could not sign out. Please try again.");

}
}

//open and close pop ups
const openChangebtn = document.getElementById("change");
const closeChangebtn = document.getElementById("close");
const changePopup = document.getElementById("changeEmailPassword");

const navBar = document.querySelector(".navbar");
const mainSection = document.querySelector(".activityPage");

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

//display activities by user
async function displayActivities() {
    try {
        //Get user 
        const {data: { user }, error: authError} = await supabase.auth.getUser();

        if (authError) {
            throw authError;
        }

        //Get Activities by user
        const {data, error: getError} = await supabase.from("Activity").select("*").eq("created_by", user.id);
        
        if (getError) {
            throw getError;
        }
        
        activities = data;

        //creating the activities list 
        const container = document.getElementById("activityContainer");
        container.innerHTML = "";

        if (activities.length === 0) {
            const empty = document.createElement("div");
            empty.innerHTML = `
                <div class="empty">
                    <p>No activities have been created.</p>
                </div>
            `;
            container.appendChild(empty);

            document.getElementById("nextButton").style.display = "none";
            document.getElementById("prevButton").style.display = "none";
            return;
        }
           
        for (let i = index; i < index + 3; i++ ) {
            //no more activity by user 
            if (i >= activities.length) {
                break;
            }
            const activity = activities[i];

            const formattedDate = new Date(activity.date).toLocaleDateString(navigator.language, {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            const formattedTime = new Date(`2026-01-01T${activity.time}`).toLocaleTimeString(navigator.language, {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });

            const link = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`

            //creating each card
            const activityBox = document.createElement("div");
            activityBox.innerHTML = `

                <div class="activityBox">

                    <h1>${activity.name}</h1>

                    <p class="label">Description:
                        <span class='description'>${activity.description}</span>
                    </p>

                    <p class="label">Interests:
                        <span>${activity.generalised_interests.join(", ")}</span>
                    </p>

                    <p class="label">Location:
                        <span>${activity.location} <a id="map" href="${link}"> (View on Google Maps)</a></span>
                    </p>

                    <p class="label">Date:
                        <span>${formattedDate}</span>
                    </p>

                    <p class="label">Time:
                        <span>${formattedTime}</span>
                    </p>

                    <p class="label">Number of participants:
                        <span>${activity.registered} / ${activity.participants}</span>
                    </p>

                    <button class="editButton">Edit</button>
                    <button class="deleteButton">Delete</button>

                </div>
            `;

            //activity management actions
            activityBox.querySelector(".deleteButton").addEventListener("click", async () => {
                const confirmation = confirm("Are you sure you want to delete this activity?");
                if (!confirmation) {
                    return;
                }

                await deleteActivity(activity.id);
                displayActivities();
            });

            activityBox.querySelector(".editButton").addEventListener("click", () => {
                editActivity(activity.id);
            });

            container.appendChild(activityBox);
            console.log(activities);
        }

        //Button states for back and forth 
        if (index === 0) {
            document.getElementById("prevButton").disabled = true;
        } else {
            document.getElementById("prevButton").disabled = false;
        }

        if (index + 3 >= activities.length) {
            document.getElementById("nextButton").disabled = true;
        } else {
            document.getElementById("nextButton").disabled = false;
        }

    } catch (error) {
        console.log("Failed to display activities:" + error);
        alert("Failed to display activites")
    }
}

//Nav buttons
function nextActivities() {
    if (index + 3 < activities.length) {
        index += 3;
        displayActivities();
    }
}

function prevActivities() {
    if (index >= 0) {
        index -= 3;
        displayActivities();
    }
}

//Management of activities 
function editActivity(activityID) {
    window.location.href = `../CreateActivity/create.html?activityID=${activityID}`;
}

async function deleteActivity(activityID) {
   try {
        const {error} = await supabase.from('Activity').delete().eq('id', activityID);
        alert("Activity successfully deleted!");

        if (error) {
            throw error;
}
   } catch (error) {
        console.log("Fail to delete activity:" + error);
        alert("failed to delete activity");
   }
}

displayActivities();
document.getElementById("nextButton").addEventListener("click", nextActivities);
document.getElementById("prevButton").addEventListener("click", prevActivities);
document.getElementById("signout").addEventListener("click", signOut);

