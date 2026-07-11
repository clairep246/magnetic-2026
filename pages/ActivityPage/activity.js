import { supabase } from "../../src/supabaseClient.js";
import defaultActivityPic from "../../images/activityPic.webp";
import defaultProfilePic from "../../images/default-profile.jpg"
let index = 0;
let activities = []

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
const changePopup = document.getElementById("changeEmailPassword")
;
const closeParticipantbtn = document.getElementById("closeParticipants")

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
    const container = document.getElementById("activityContainer");
    if (container) {
        container.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Retrieving activities...</p>
            </div>
        `;
    }
    try {
        //Get user 
        const {data: { user }, error: authError} = await supabase.auth.getUser();

        if (authError) {
            throw authError;
        }

        //Get Activities by user
        const {data, error: getError} = await supabase.from("Activity").select("*").eq("created_by", user.id).order("name");
        
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
            activityBox.classList.add("activityBox")
            activityBox.innerHTML = `
                <div class="activityImage">
                    <img src="${activity.activityPicURL || defaultActivityPic}" alt="Activity Image">
                </div>

                <div class="activityContent">

                    <h2>${activity.name}</h2>

                    <h3>Description</h3>
                    <div class="section">
                        <p>${activity.description || "No description provided."}</p>
                    </div>

                    <h3>Interests</h3>
                    <div class="interestContainer">
                        ${activity.generalised_interests
                            .map(interest => `<span>${interest}</span>`)
                            .join("")}
                    </div>

                    <div class="infoRow">
                        📍
                        <span>
                            <a href="${link}">
                               ${activity.location} 
                            </a>
                        </span>
                    </div>

                    <div class="infoRow">
                        📅
                        <span>${formattedDate}</span>
                    </div>

                    <div class="infoRow">
                        🕒
                        <span>${formattedTime}</span>
                    </div>

                    <div class="infoRow">
                        👥
                        <span>${activity.registered} / ${activity.participants} participants</span>
                    </div>

                    <button class="viewParticipantsButton">View Participants →</button>


                    <div class="buttonsContainer">
                        <button class="editButton">Edit</button>
                        <button class="deleteButton">Delete</button>
                    </div>

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

            //joined users 
            activityBox.querySelector(".viewParticipantsButton").addEventListener("click", async () => {

                const participantsList = document.getElementById("participantsList");
                participantsList.innerHTML = `
                    <div class="loading-state">
                        <div class="spinner"></div>
                        <p>Retrieving participants...</p>
                    </div>
                `;

                // Get everyone who joined this activity
                const { data: joinedRecords, error } = await supabase
                    .from("Interested_activities")
                    .select("user_id")
                    .eq("activity_id", activity.id);

                if (error) {
                    alert("Failed to load participants");
                    throw error;
                    return;
                }
                participantsList.innerHTML = "";

                if (joinedRecords.length === 0) {
                    alert("No participants have joined")
                    return;
                }

                // Load each participant
                for (const record of joinedRecords) {

                    const { data: profile, error: profileError } = await supabase
                        .from("Profile")
                        .select("*")
                        .eq("created_by", record.user_id)
                        .single();
                    console.log(profile);

                    const userProfile = document.createElement("div");

                    userProfile.classList.add("participant");

                    userProfile.innerHTML = `
                        <img src="${profile.profilePicUrl || defaultProfilePic}" alt="Profile">

                        <div class="participantInfo">
                            <h3>${profile.name}</h3>
                            <p>Interests: ${profile.interest}</p>
                            <p>Major: ${profile.major}</p>
                            <p>Year: ${profile.year_of_study}</p>
                        </div>
                    `;

                    participantsList.appendChild(userProfile);
                }
                document.getElementById("participantsModal").classList.add("active")

            });

            closeParticipantbtn.addEventListener("click", () => {
                document.getElementById("participantsModal").classList.remove("active")
            })

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

