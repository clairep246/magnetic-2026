import { supabase } from "../../src/supabaseClient.js";

let store = [];
function selectedInterests(button) {
    const interest = button.textContent;
    button.classList.toggle("selected");

    if (store.includes(interest)) {
        store = store.filter(x => x !== interest);
    } else {
        store.push(interest);
    }
}
async function saveProfile() {
    const saveButton = document.getElementById("saveProfile");
    saveButton.textContent = "Saving...";
    try {
        const {data: { user }, error: authError} = await supabase.auth.getUser();

        if (authError || !user) {
            throw new Error("User not authenticated");
        }

        const name = document.getElementById("name").value;
        const about = document.getElementById("about").value;
        const email = document.getElementById("email").value;
        const telegramHandle = document.getElementById("telegramHandle").value;
        const residence = document.getElementById("residence").value;
        const year = document.getElementById("year").value;
        const major = document.getElementById("major").value;

        if (!name) {
            alert("Please enter your name");
            return;
        }

        const { data, error: InsertError } = await supabase.from("Profile").insert({
                name: name,
                about: about,
                email: email,
                telegram_handle: telegramHandle,
                residences: residence,
                year_of_study: year,
                course: major,
                created_by: user.id
        })
        
        if (InsertError) {
            throw new Error("Failed to create profile");
        }
        alert("Profile created successfully!");

        
        /*const { error } = await supabase
            .from("Profile")
            .update({
                name: name,
                about: about,
                email: email,
                telegram_handle: telegramHandle,
                residences: residence,
                year_of_study: year,
                course: major
            })
            .eq("created_by", user.id); 

            if (error) {
            throw new Error("Failed to update profile");
            }

            alert("Profile updated successfully!"); */

        } catch (error) {

                console.log("Failed to save profile:", error);
                alert("Failed to save profile");

        } finally {

        saveButton.textContent = "Save Profile";

        }
}

document.querySelectorAll(".interests button").forEach( button => {
    button.addEventListener("click", () => selectedInterests(button)); 
    });
    
document.getElementById("saveProfile")
    .addEventListener("click", saveProfile);
