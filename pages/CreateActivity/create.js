import { supabase } from "../../src/supabaseClient.js";

let store = [];
const activityDetails = new URLSearchParams(window.location.search);
const activityID = activityDetails.get("activityID");
let isEditing = false;

if (activityID !== null) {
    isEditing = true;
}

//sign out
async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        alert("Could not sign out. Please try again.");
        return;
    }

    alert("Successfully signed out!");
    window.location.href = "../Login/login.html";
}

//Selecting of interests buttons to be stored 
function selectedInterests(button) {
    const interest = button.textContent;
    button.classList.toggle("selected");

    if (store.includes(interest)) {
        store = store.filter(x => x !== interest);
    } else {
        store.push(interest);
    }
    /*Debugging
    console.log(store);
    const debugText = document.getElementById("check");

    debugText.textContent =
        "Selected Interests: " + store.join(", ");*/
 }

 //preview of activity details before saving
 function previewActivity() {
    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const location = document.getElementById("location").value
    const date = document.getElementById("date").value
    const time = document.getElementById("time").value
    const participants = document.getElementById("participants").value

    document.getElementById("previewName").textContent = name;
    document.getElementById('previewDescription').textContent = description;
    document.getElementById('previewLocation').textContent = location;
    document.getElementById('previewParticipants').textContent = participants;
    document.getElementById('previewInterests').textContent = store;

    const formattedTime = new Date(`2026-01-01T${time}`).toLocaleTimeString(navigator.language, {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        document.getElementById('previewTime').textContent = formattedTime;

        const formattedDate = new Date(date).toLocaleDateString(navigator.language, {
             day: 'numeric',
             month: 'long',
             year: 'numeric'
        });

        document.getElementById('previewDate').textContent = formattedDate;
 }

 //For editing mode: load the data of activity 
 async function loadActivityDetails() {
    try {
        if (!isEditing) {
            return;
        }

        const {data, error: getError} = await supabase.from("Activity").select("*").eq("id",activityID).single();
        if (getError) {
            throw new Error("Failed to get activity details");
        }

        //pre fill in 
        document.getElementById("name").value = data.name;
        document.getElementById("description").value = data.description;
        document.getElementById("location").value = data.location;
        document.getElementById("date").value = data.date;
        document.getElementById("time").value = data.time;
        document.getElementById("participants").value = data.participants;

        store = data.interests;
        document.querySelectorAll(".interests button").forEach( button => {
            if (store.includes(button.textContent)) {
                button.classList.toggle("selected");
            }
        });

    } catch (error) {
        console.log("Failed to load activity details:" + error);
    }
}

//Saving activity
async function saveActivity() {
    const save = document.getElementById("saveActivity");
    save.textContent = isEditing ? "Updating..." : "Saving...";

    try {
        //UserID
        const { data: { user }, error: authError} = await supabase.auth.getUser();

        if (authError) {
            throw new Error("User not authenticated");
        }

        //Activity data
        const name = document.getElementById("name").value;
        const description = document.getElementById("description").value;
        const location = document.getElementById("location").value
        const date = document.getElementById("date").value
        const time = document.getElementById("time").value
        const participants = document.getElementById("participants").value

        const activityData = {
            created_by: user.id,
            name: name,
            description: description,
            location: location,
            time: time,
            date: date,
            interests: store,
            participants: participants,
        }

        if (!name) {
            alert("Please enter an activity name");
            return;
        }

        if (!location) {
            alert("Please enter a location");
            return;
        }

        if (!date) {
            alert("Please select a date");
            return;
        }

        const storedDate = new Date(date);
        const today = new Date();
        today.setHours(0,0,0,0);
        storedDate.setHours(0,0,0,0);

        if (storedDate < today) {
            alert("Cannot choose past dates. Please choose a future date");
            return;
        }
        
        if (!time) {
            alert("Please select a time");
            return;
        }

        if (!participants) {
            alert("Please enter number of participants");
            return;
        }

        if (participants <= 0) {
            alert("Number of participants must be greater than 0");
            return;
        }

        if (store.length === 0) {
            alert("Please select at least one interest");
            return;
        }

        //The work 
        if (isEditing) {
            const { error: updateError } = await supabase.from("Activity").update(activityData).eq("id", activityID).select();
            if (updateError) {
                throw new Error("Failed to update activity");
            }

            alert("Activity successfully updated!");
            window.location.href = `../ActivityPage/activity.html`; 
            return;

        } else {
            const { data, error: insertError } = await supabase.from("Activity").insert([activityData]).select();
            if (insertError) {
                throw new Error("Failed to insert activity into database");
            }

            alert("Activity successfully created!");
            const newActivity = data[0];
            window.location.href = `../ActivityPage/activity.html`; 
        }


    } catch (error) {
        console.log("Failed to save activity:" + error);
        alert("Failed to save activity. Please try again");

    } finally {
        save.textContent = "Saved";
    }
}

document.querySelectorAll(".interests button").forEach( button => {
    button.addEventListener("click", () => selectedInterests(button)); 
    });

document.getElementById('preview').addEventListener("click", previewActivity);
document.getElementById("saveActivity").addEventListener("click", saveActivity);
document.getElementById("signout").addEventListener("click", signOut);
loadActivityDetails();
