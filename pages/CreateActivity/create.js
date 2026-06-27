import { supabase } from "../../src/supabaseClient.js";

const activityDetails = new URLSearchParams(window.location.search);
const activityID = activityDetails.get("activityID");
let isEditing = false;

if (activityID !== null) {
    isEditing = true;
}

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
        alert("Could not sign out. Please try again.");
    }
}

document.getElementById("signout").addEventListener("click", signOut);
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
            throw getError;
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

//Using the AI to generalise the interests
async function generaliseInterests(interests) {
    try {
        const { data: generalisedInterests, error } = await supabase.functions.invoke(
        "clever-service",
        {
            body: {
            interests,
            },
        }
        );

        if (error) {
            throw error;
            return;
        }

        console.log(generalisedInterests.interests)
        return generalisedInterests.interests
    } catch (error) {
        console.log(error);
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
            throw authError;
        }

        //Activity data
        const name = document.getElementById("name").value;
        const description = document.getElementById("description").value;
        const location = document.getElementById("location").value
        const date = document.getElementById("date").value
        const time = document.getElementById("time").value
        const interests = document.getElementById("interest").value.split(",").map(x => x.trim())
        const participants = document.getElementById("participants").value

        const response = await generaliseInterests(interests);
        const generalisedInterests = response.split(",").map(x => x.trim());

        if (interests.length > 3) {
            alert("Please enter max 3 interests")
        }
        const activityData = {
            created_by: user.id,
            name: name,
            description: description,
            location: location,
            time: time,
            date: date,
            interests: interests,
            participants: participants,
            generalised_interests: generalisedInterests
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

        if (participants < 0) {
            alert("Number of participants must be positive");
            return;
        }

        //The work 
        if (isEditing) {
            const { error: updateError } = await supabase.from("Activity").update(activityData).eq("id", activityID).select();
            if (updateError) {
                throw updateError;
            }

            alert("Activity successfully updated!");
            window.location.href = `../ActivityPage/activity.html`; 
            return;

        } else {
            const { data, error: insertError } = await supabase.from("Activity").insert([activityData]).select();
            if (insertError) {
                throw insertError;
            }

            alert("Activity successfully created!");
            const newActivity = data[0];
            window.location.href = `../ActivityPage/activity.html`; 
        }


    } catch (error) {
        console.log("Failed to save activity:", error);
        alert("Failed to save activity. Please try again");

    } finally {
        save.textContent = "Save";
    }
}

document.querySelectorAll(".interests button").forEach( button => {
    button.addEventListener("click", () => selectedInterests(button)); 
    });

document.getElementById('preview').addEventListener("click", previewActivity);
document.getElementById("saveActivity").addEventListener("click", saveActivity);
document.getElementById("signout").addEventListener("click", signOut);
loadActivityDetails();

//open and close pop ups
const openChangebtn = document.getElementById("change");
const closeChangebtn = document.getElementById("close");
const changePopup = document.getElementById("changeEmailPassword");

const navBar = document.querySelector(".navbar");
const mainSection = document.querySelector(".CreateActivity");

const openSuggestBtn = document.getElementById("suggest");
const closeSuggestBtn = document.getElementById("closeInterestbtn");
const interestPopup = document.getElementById("interestForAI");

function resetInterestPopup() {
    document.getElementById("useMyInterests").style.display = "block";
    document.getElementById("useNewInterests").style.display = "block";
    document.getElementById('newInterests').style.display = "none";
    document.getElementById("generateActivity").style.display = "none";
    document.getElementById("newInterests").value = "";
    
    document.getElementById("useMyInterests").textContent = "Use my interests";
    document.getElementById("generateActivity").textContent = "Generate Activity";
}
function openPopup(popupElement) {
    popupElement.style.setProperty("display", "flex", "important");
    popupElement.style.flexDirection = "column";
    navBar.style.opacity = "0.5";
    mainSection.style.opacity = "0.5";

    if (popupElement == interestPopup) {
        resetInterestPopup();
    }
}

function closePopup(popupElement) {
    popupElement.style.display = "none";
    navBar.style.opacity = "1";
    mainSection.style.opacity = "1";
}

openChangebtn.addEventListener("click", () => openPopup(changePopup));
closeChangebtn.addEventListener("click", () => closePopup(changePopup));
openSuggestBtn.addEventListener("click", () => openPopup(interestPopup));
closeSuggestBtn.addEventListener("click", () => closePopup(interestPopup));

//update email and password
async function updateDetails() {
    try {
        const newEmail = document.getElementById("newEmail").value;
        const newPassword = document.getElementById("newPassword").value;
        const confirmPass = document.getElementById("confirmPassword").value;

        if (newPassword !== confirmPass) {
            alert("Passwords do not match. Please try again");
            return;
        }
        if (newEmail !== "") {
            const {data, error: updateEmailError} = await supabase.auth.updateUser({
                email: newEmail,
            })

            if (updateEmailError) {
                throw updateEmailError;
            }
        }

        const {data, error: updatePasswordError} = await supabase.auth.updateUser({
            password: newPassword,
        })
        if (updatePasswordError) {
            throw updatePasswordError;
        }
    } catch (error) {
        console.log("Fail to update details", error);
        console.log("EMAIL:", JSON.stringify(newEmail));
         if (error.message.includes("different")) {
            alert("New password needs to be different");
        } else if (error.message.includes("invalid")) {
            alert("Only valid NUS emails are allowed");
        } else {
        alert("Failed to update your details, please try again");
        }

    }
}

//generate a new activity
async function generateActivity(interests) {
try {
    const { data: generatedActivity, error } = await supabase.functions.invoke(
        "clever-action",
        {
            body: {
            interests,
            },
        }
        );

    if (error) {
        console.error(error);
        alert("Failed to generate activity");
        return;
    }
    //Pre fill in form 
    document.getElementById("name").value =generatedActivity.activityName;
    document.getElementById("description").value =generatedActivity.description;
    document.getElementById("interest").value = generatedActivity.interests;

    console.log(generatedActivity);
    alert("Activity successfully generated!")
    } catch (error) {
        console.log(error);
        alert("Failed to generate activity, please try again");
    }
}

document.getElementById("useMyInterests").addEventListener("click", async () => {
    try {
        const { data: { user }, error: authError} = await supabase.auth.getUser();
        if (authError) {
            throw authError;
        }

        const { data: profile,error: getError} = await supabase.from("Profile").select("*").eq("created_by", user.id).single();
        if (getError) {
            throw getError;
        }
        document.getElementById("useMyInterests").textContent = "Generating..."
        document.getElementById("interest").value = profile.interest.join(",");
        await generateActivity(profile.interest);
        closePopup(interestPopup);

    } catch (error) {
        console.error(error);
        alert("Failed to generate activity. Please try again");
    } finally {
        document.getElementById("useMyInterests").textContent = "Use my interests"

    }
})

document.getElementById("useNewInterests").addEventListener("click", async () => {
    document.getElementById("useMyInterests").style.display = "none";
    document.getElementById("useNewInterests").style.display = "none";
    document.getElementById('newInterests').style.display = "block";
    document.getElementById("generateActivity").style.display = "block";
    document.getElementById("interestPopupLabel").textContent = "Please enter max of 3 ONE WORD interests, separated by commas and no spaces."
})

document.getElementById("generateActivity").addEventListener("click", async () => {

    const interests = document.getElementById("newInterests").value.split(",").map(x => x.trim())
    if (interests.length === 0) {
        alert("Please enter at least one interest");
        return;
    }

    if (interests.length > 3) {
        alert("Please enter max 3 interests")
    }

    try {
        document.getElementById("generateActivity").textContent = "Generating..."
        await generateActivity(interests);
        closePopup(interestPopup);
    } catch (error) {
        console.log(error);
        alert("Failed to generate activity. Please try again")
    } finally {
        document.getElementById("generateActivity").textContent = "Generate Activity."
        document.getElementById("interestPopupLabel").textContent = "Would you like to use your profile's interests or key in new interests for your generated activity?"
    }
});

//interest info button 
const interestInfoPopup = document.getElementById("interestInfo");
document.getElementById("interestInfobtn").addEventListener("click", () => openPopup(interestInfoPopup));
document.getElementById("closeInterestInfobtn").addEventListener("click", () => closePopup(interestInfoPopup))
