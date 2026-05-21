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
    //Debugging
    console.log(store);
    const debugText = document.getElementById("check");

    debugText.textContent =
        "Selected Interests: " + store.join(", ");
 }

 //Storing in the database 
 async function saveActivity() {
    const { supabase } = await import("../../src/supabaseClient.js");

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

    await supabase.from("Activity").insert([activityData]);
    console.log("Activity created")
 }

document.querySelectorAll(".interests button").forEach( button => {
    button.addEventListener("click", () => selectedInterests(button));
});

document.getElementById("saveActivity").addEventListener("click", () => saveActivity);

