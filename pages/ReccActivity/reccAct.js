import { supabase } from "../../src/supabaseClient.js";
import defaultActivityPic from "../../images/activityPic.webp";
document.addEventListener('DOMContentLoaded', () => {
    const dropdowns = document.querySelectorAll('.dropDown');

    dropdowns.forEach(dropdown => {
        const button = dropdown.querySelector('button');
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

document.getElementById("signout").addEventListener("click", signOut);

//get user location 
async function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    resolve([lat, lng]); 
                } );
        } else {
            reject(new Error("Not supported"));
        }
    });
}
//Recommend activity to users 
async function recommendActivity(lat, lng) {
    const {data, error: locError} = await supabase.functions.invoke(
        "rapid-processor",
        {
            body: {
            userLat: lat,
            userLng: lng
            }
        }
        );
    console.log(data);
    return data;
}

//logged in user join activity 
async function joinActivity(activityId) {
    try {
        const {data: { user }, error: authError} = await supabase.auth.getUser();
        if (authError) {
            throw authError;
        }

        //pair the user to the activities they want to join in the interested_activities table
        const {data: joinedActivity, error: insertError} = await supabase.from("Interested_activities").insert({
            activity_id: activityId,
            user_id: user.id
        })
        if (insertError) {
            throw insertError;
        }

        //increase the number of interested participants by 1 in the main activity pages
        const {data: activity, error: getError} = await supabase.from("Activity").select("*").eq("id", activityId).single();
        if (getError) {
            throw getError;
        }

        const joined = activity.registered + 1;
        const {error: updateError} = await supabase.from("Activity").update({registered: joined}).eq("id", activityId);
        
        if (updateError) {
            throw updateError;
        }

        alert("Successfully joined activity!");
        displayActivities();

    } catch (error) {
        console.error("Error joining activity:", error);
        alert("Failed to join activity. Please try again.");
    }
}

//login user leaves activity 
async function leaveActivity(activityId) {
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) {
            throw authError;
        }

        const {error: deleteError} = await supabase.from('Interested_activities').delete().eq('activity_id', activityId).eq("user_id", user.id);
        if (deleteError) {
            throw deleteError;
        }

        const {data: activity, error: getError} = await supabase.from("Activity").select("*").eq("id", activityId);
        if (getError) {
            throw getError;
        }
        const joined = activity.registered - 1;
        const {error: updateError} = await supabase.from("Activity").update({registered: joined}).eq("id", activityId);
        if (updateError) {
            throw updateError;
        }

        alert("Left activity successfully");
        displayActivities();
        
    } catch(error) {
            console.log(error);
            alert("Failed to leave activity, please try again")
    }
}

//random activities
function getRandomActivities(activities, count) {
    if (activities.length <= count) {
        return activities;
    }
    
    const result = [];
    const usedIndex = [];
    
    while (result.length < count) {
        const index = Math.floor(Math.random() * activities.length);
        
        if (!usedIndex.includes(index)) {
            usedIndex.push(index);
            result.push(activities[index]);
        }
    }
    
    return result;
}
//display activity
let activities = [];
let index = 0;
let filteredIDs = [];
let filteredActivities = [];
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
        
        const { data: joinedRecords, error: getJoinedError } = await supabase
            .from("Interested_activities")
            .select("activity_id")
            .eq("user_id", user.id);

        if (getJoinedError) {
            throw getJoinedError;
        }

        filteredIDs = joinedRecords.map(record => record.activity_id);

        //Interest based matching 
        if (document.getElementById("interestSuggestion").classList.contains("active")) {
        
            let [lat,lng] = await getCurrentLocation();
            let matchInterestActivities = await recommendActivity(lat, lng);
            if (activities == null) {
                alert("There is currently no available entries matching your interest. Why not try the random suggestions feature?");
                return;
            }

            activities = matchInterestActivities.filter(
                activity => !filteredIDs.includes(activity.id)
            );
    
    } else {
        const {data: allActivities, error: activityError} = await supabase
            .from("Activity")
            .select("*")
            .neq("created_by", user.id);
            
        if (activityError) {
            throw activityError;
        }

        const unjoinedActivities = allActivities.filter(
            activity => !filteredIDs.includes(activity.id)
        );
            
        activities = getRandomActivities(unjoinedActivities, 3);
}

        //creating the activities list 
        const container = document.getElementById("activityContainer");
        container.innerHTML = "";

        if (activities.length === 0) {
            const empty = document.createElement("div");
            empty.innerHTML = `
                <div class="empty">
                    <p>No more activity records. Please check back later.</p>
                </div>
            `;
            container.appendChild(empty);
            return;
        }
           
        for (let i = 0; i < 3; i++ ) {
            //no more activity recc
            if (i >= activities.length) {
                break;
            }
             
            const activity = activities[i];
            if (activity.registered >= activity.participants) {
                continue;
            }
            const createdById = activity.created_by 
            //to get name for the user who created activity
            const {data: userProfile, error: userError} = await supabase.from("Profile").select("name").eq("created_by", createdById);
            if (userError) {
                throw userError;
            }

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

                    <div class="infoRow">
                        👤Created by:
                        <a href="/pages/Profile/profile.html?userId=${createdById}" style="text-decoration: none"> ${userProfile[0].name} </a>
                    </div>

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
                           
                            <a href="${link}" target="_blank">
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

                    <div class="buttonsContainer">
                        <button class="joinButton">Join</button>
    
                    </div>

                </div>
            `;

            if (activity.registered >= activity.participants) {
                //activityBox.querySelector(".joinButton").disabled = true;
                activityBox.querySelector(".joinButton").style.opacity = 0
            }
            
            const {data: interestedActivity, error: getError} = await supabase.from("Interested_activities")
                .select("*")
                .eq("user_id", user.id)
                .eq("activity_id", activity.id)
                .maybeSingle();
                        
            if (getError) {
                throw getError;
            }
            
            //once user join disable the join button 
            const btn = activityBox.querySelector(".joinButton");
            if (interestedActivity != null) {
                btn.textContent = "Leave Activity";
                btn.style.opacity = "50%"; 
                activityBox.querySelector(".joinButton").addEventListener("click", () => leaveActivity(activity.id));    

             } else {
                activityBox.querySelector(".joinButton").addEventListener("click", () => joinActivity(activity.id));
            
                }
            container.appendChild(activityBox);
            console.log(userProfile);
        }

        console.log(activities);
        
    } catch (error) {
        console.log("Failed to display activities:" + error);
        alert("Failed to display activites")
    }
}

const interestBtn = document.getElementById("interestSuggestion");
const randomBtn = document.getElementById("randomSuggestion");
interestBtn.addEventListener("click", async () => {
    interestBtn.classList.toggle("active");
    randomBtn.classList.remove("active");
    await displayActivities();
})

randomBtn.addEventListener("click", async () => {
    randomBtn.classList.toggle("active");
    interestBtn.classList.remove("active");
    await displayActivities();
})


