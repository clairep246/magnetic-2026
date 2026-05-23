import { supabase } from "../../src/supabaseClient.js";
//Interest selection
let store = [];

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

async function saveActivity() {
    const save = document.getElementById("saveActivity");
    save.textContent = "Saving...";

    try {
        const name = document.getElementById("name").value;
        const description = document.getElementById("description").value;
        const location = document.getElementById("location").value
        const date = document.getElementById("date").value
        const time = document.getElementById("time").value
        const participants = document.getElementById("participants").value

        const activityData = {
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

        if (store.length === 0) {
            alert("Please select at least one interest");
            return;
        }

        const { data, error } = await supabase.from("Activity").insert([activityData]).select();
        if (error) {
            throw error;
        }

        alert("Activity successfully created!");
        const newActivity = data[0];
        window.location.href = `../ActivityPage/activity.html?id=${newActivity.id}`; 

    } catch (error) {
        console.error("Save activity failed", error);
        alert("Failed to save activity. Please try again");

    } finally {
        save.textContent = "Save Activity";
    }
}

document.querySelectorAll(".interests button").forEach( button => {
    button.addEventListener("click", () => selectedInterests(button)); 
    });

document.getElementById("saveActivity").addEventListener("click", () => saveActivity());
