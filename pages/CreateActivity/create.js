//Interest selection
let store = [];

function selectedInterests(button) {
    const interest = button.textContent.trim();
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
        const { supabase }= await import("../../src/supabaseClient.js");
  
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

        const { error } = await supabase.from("Activity").insert([activityData]);
        if (error) {
            throw error;
        }

        alert("Activity successfully created!");
        window.location.href = "/"; 

    } catch (error) {
        console.error("Save failed:", error);
        alert("Failed to save activity.");

    } finally {
        save.textContent = "Save Activity";
    }
}

document.querySelectorAll(".interests button").forEach( button => {

    button.addEventListener("click", () => selectedInterests(button));
    
    });

document.getElementById("saveActivity").addEventListener("click", () => saveActivity());

