import { supabase } from "../../src/supabaseClient.js";

let index = 0;
let activities = []

async function displayActivities() {
    try {
        //Get user 
        const {data: { user }, error: authError} = await supabase.auth.getUser();

        if (authError) {
            throw new Error("User not authenticated");
        }

        //Get Activities by user
        const {data, error: GetError} = await supabase.from("Activity").select("*").eq("created_by", user.id);
        
        if (GetError) {
            throw new Error("Failed to get activities");
        }
        
        activities = data;

        //creating the activities list 
        const container = document.getElementById("activityContainer");
        container.innerHTML = "";

        if (activities.length === 0) {
            const empty = document.createElement("p");
            empty.textContent = "No activities have been created.";
            container.appendChild(empty);

            document.getElementById("nextButton").disabled = true;
            document.getElementById("prevButton").disabled = true;
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

                    <button class="editButton">Edit</button>
                    <button class="deleteButton">Delete</button>

                </div>
            `;

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
    }
}

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

function editActivity(activityID) {
    window.location.href = `../CreateActivity/create.html?activityID=${activityID}`;
}

async function deleteActivity(activityID) {
   try {
        const {error} = await supabase.from('Activity').delete().eq('id', activityID);
        alert("Activity successfully deleted!");

        if (error) {
            throw new Error("Failed to delete activity");
}
   } catch (error) {
        console.log("Fail to delete activity:" +error);
   }
}

displayActivities();
document.getElementById("nextButton").addEventListener("click", nextActivities);
document.getElementById("prevButton").addEventListener("click", prevActivities);


