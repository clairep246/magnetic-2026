import { supabase } from "../../src/supabaseClient.js";

let index = 0;
let activities = []

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
        console.log("Failed to sign out", error)
        alert("Failed to sign out, please try again.");

    }
}

//change password and email
const open = document.getElementById("change");
const close = document.getElementById("close");
const changePopup = document.getElementById("changeEmailPassword");
const navBar = document.querySelector(".navbar");
const mainSection = document.querySelector(".activityPage")

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


//display activities by all other users 
async function displayActivities() {
    try {
        //Get user 
        const {data: { user }, error: authError} = await supabase.auth.getUser();

        if (authError) {
            throw new Error("User not authenticated");
        }

        if (document.getElementById("filter").value === "All Activities") {
            const {data, error: getError} = await supabase.from("Activity").select("*").neq("created_by", user.id);
            if (getError) {
                throw getError;
            }
            
            activities = data;
            console.log(activities);
        } else { // for activities joined by user 
            const { data:interestedActivities, error:getError } = await supabase.from("Interested_activities").select(`Activity(*)`).eq("user_id", user.id);
             if (getError) {
                throw getError;
            }
            console.log(interestedActivities)
            activities = interestedActivities.map(activity => activity.Activity);
        }

        //creating the activities list 
        const container = document.getElementById("activityContainer");
        container.innerHTML = "";

        //no activities to be displayed 
        if (activities.length === 0) {
            const empty = document.createElement("div");
            empty.innerHTML = `
                <div class="empty">
                    <p>No activities to be displayed.</p>
                </div>
            `;
            container.appendChild(empty);

            document.getElementById("nextButton").style.display = "none";
            document.getElementById("prevButton").style.display = "none";
            return;
        }
        
        for (let i = index; i < index + 3; i++ ) {
            //no more activities 
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
            const link = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`;
            //creating each card
            const activityBox = document.createElement("div");
            activityBox.innerHTML = `

                <div class="activityBox">

                    <h1>${activity.name}</h1>

                    <p class="label">Description:
                        <span class='description'>${activity.description}</span>
                    </p>

                    <p class="label">Interests:
                        <span>${activity.interests.join(", ")}</span>
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
                        <span>${activity.registered}/${activity.participants}</span>
                    </p>

                    <p class="label">Created by:
                        <span>${userProfile.name}</span>
                    </p>

                    <button class="joinButton">Join</button>

                </div>
            `;
            //if the activity is full, disable the join button 
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

document.getElementById("signout").addEventListener("click", signOut);
document.getElementById("nextButton").addEventListener("click", nextActivities);
document.getElementById("prevButton").addEventListener("click", prevActivities);
document.getElementById("filter").addEventListener("change", () => {
    displayActivities();
});
displayActivities();
