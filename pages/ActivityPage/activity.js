import { supabase } from "../../src/supabaseClient.js";

let index = 0;
let activities = []

async function displayActivities() {
    try {
        //Get user 
        const {data: { user }, error: userError} = await supabase.auth.getUser();

        if (userError) {
            throw new Error("User not authenticated");
        }
        //Get Activities by user
        const {data, error} = await supabase.from("Activity").select("*").eq("created_by", user.id);
        
        if (error) {
            throw error;
        }
        
        activities = data;

        //creating the activities list 
        const container = document.getElementById("activityContainer");
        container.innerHTML = "";

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
                        <span>${activity.location}</span>
                    </p>

                    <p class="label">Date:
                        <span>${formattedDate}</span>
                    </p>

                    <p class="label">Time:
                        <span>${formattedTime}</span>
                    </p>

                    <p class="label">Number of participants:
                        <span>${activity.participants}</span>
                    </p>

                </div>
            `;
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
        console.log("Failed to get activities:" + error);
    }
}

function nextActivities() {
    if (index + 3 < activities.length) {
        index += 3;
        displayActivities();
    }
}

function prevActivities() {
    if (index - 3 >= 0) {
        index -= 3;
        displayActivities();
    }

}

displayActivities();
document.getElementById("nextButton").addEventListener("click", nextActivities);
document.getElementById("prevButton").addEventListener("click", prevActivities);

