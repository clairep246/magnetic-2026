import { supabase } from "../../src/supabaseClient.js";

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

document.getElementById("signout").addEventListener("click", signOut);

//get user location 
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    } else {
        console.log("Not supported by this browser")
    }

    function success(position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude; 
        
        console.log("Latitude: " + lat + " Longitude: " + lng);
        
        recommendActivity(lat, lng);
    }

    function error() {
        alert("Sorry, no position available.");
    }
}

//Recommend activity to users 
async function recommendActivity(lat, lng) {
    const {data, error: locError} = await supabase.functions.invoke(
        "rapid-processor",
        {
            body: {
            userLat: lat,
            userLng: lng,
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

        const {data: activity, error: getError} = await supabase.from("Activity").select("*").eq("id", activityId).single();
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
    const usedIndices = [];
    
    while (result.length < count) {
        const index = Math.floor(Math.random() * activities.length);
        
        if (!usedIndices.includes(index)) {
            usedIndices.push(index);
            result.push(activities[index]);
        }
    }
    
    return result;
}
//display activity
let activities = [];
let index = 0;
let filteredActivities = [];
async function displayActivities() {
    try {
        //Get user 
        const {data: { user }, error: authError} = await supabase.auth.getUser();

        if (authError) {
            throw authError;
        }

    if (document.getElementById("interestSuggestion").classList.contains("active")) {
    
        activities = await recommendActivity(); 
    
    } else {
        const {data: allActivities, error: activityError} = await supabase
            .from("Activity")
            .select("*")
            .neq("created_by", user.id);
            
        if (activityError) {
            throw activityError;
        }

        const { data: joinedRecords, error: getJoinedError } = await supabase
            .from("Interested_activities")
            .select("activity_id")
            .eq("user_id", user.id);

        if (getJoinedError) {
            throw getJoinedError;
        }

        joinedRecords = joinedRecords.map(record => record.activity_id);

        const unjoinedActivities = allActivities.filter(
            activity => !joinedActivityIds.has(activity.id)
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
                    <p>No more activity recommendations.</p>
                </div>
            `;
            container.appendChild(empty);

            document.getElementById("interestSuggestion").style.display = "none";
            document.getElementById("randomSuggestion").style.display = "none";
            return;
        }
           
        for (let i = 0; i < 3; i++ ) {
            //no more activity recc
            if (i >= activities.length) {
                break;
            }
             
            const activity = activities[i];

            const createdById = activity.created_by 
            //to get name for the user who created activity
            const {data: userProfile, error: userError} = await supabase.from("Profile").select("*").eq("created_by", createdById).single();
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
            activityBox.innerHTML = `

                <div class="activityBox">

                    <h1>${activity.name}</h1>
                    <p class="label">Created by:
                        <span>${userProfile.name}</span>
                    </p>

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

                    <button class="joinButton">Join</button>

                </div>
            `;

            if (activity.registered >= activity.participants) {
                activityBox.querySelector(".joinButton").disabled = true;
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
            console.log(activities);
        }


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

