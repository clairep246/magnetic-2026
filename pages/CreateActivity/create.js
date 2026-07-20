import { supabase } from "../../src/supabaseClient.js";

const activityDetails = new URLSearchParams(window.location.search);
const activityID = activityDetails.get("activityID");
let isEditing = false;

if (activityID !== null) {
    isEditing = true;
}

document.addEventListener('DOMContentLoaded', () => {
    const dropdowns = document.querySelectorAll('.dropDown');

    dropdowns.forEach(dropdown => {
        const button = dropdown.querySelector('.links button');
        let timeout;

        if (button) {
            button.addEventListener('click', () => {
                dropdown.classList.toggle('active');

                clearTimeout(timeout);

                timeout = setTimeout(() => {
                    dropdown.classList.remove('active');
                }, 2000);
            });
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropDown')) {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
});
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

const signOutButton = document.getElementById("signout");
if (signOutButton) {
    signOutButton.addEventListener("click", signOut);
}

 //preview of activity details before saving
 function previewActivity() {
    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const location = document.getElementById("location").value
    const date = document.getElementById("date").value
    const time = document.getElementById("time").value
    const participants = document.getElementById("participants").value
    const image = document.getElementById("activityPic").files[0]

    document.getElementById("previewName").textContent = name;
    document.getElementById('previewDescription').textContent = description;
    document.getElementById('previewLocation').textContent = location;
    document.getElementById('previewParticipants').textContent = "0 / " + participants + " participants";
    document.getElementById('previewImage').src = image ? URL.createObjectURL(image) : "/images/activity_background.jpg";

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

 //For editing mode: pre fill-in
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
        document.getElementById("interest").value = data.generalised_interests;


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
        const userID = user.id;

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

        const activityPic = document.getElementById("activityPic").files[0]
        const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

        if (activityPic && activityPic.size > MAX_SIZE) {
            alert("Image must be under 2 MB.");
            return;
        }
    
        if (interests.length > 3) {
            alert("Please enter max 3 interests")
            return;
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

        const activityData = {
            isEditing,
            activityID: isEditing ? activityID : null,
            name,
            description,
            location,
            date,
            time,
            interests,
            participants,
        };

        const { data: response, error: invokeError } = await supabase.functions.invoke(
            "smart-responder", {
            body: activityData
        });

        if (invokeError) {
            if (invokeError.context && invokeError.context.status === 422) {
                const errorBody = await invokeError.context.json();

                if (errorBody.error === "geocoding_failed") {
                    alert(errorBody.message);
                    return;
                }
            }

            throw invokeError;
        }
    
        const currentActivityID = isEditing ? activityID : response.activityID;

       if (activityPic) {
            const filePath = `${userID}/${currentActivityID}`;

            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from("activityPic")
                .upload(filePath, activityPic, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from("activityPic")
                .getPublicUrl(filePath);
            
            const { error: updateError } = await supabase
                .from("Activity") 
                .update({ activityPicURL: publicUrlData.publicUrl })
                .eq("id", currentActivityID); 

            if (updateError) throw updateError;
        }

        if (isEditing) {
            alert("Activity successfully updated!");
        } else {
            alert("Activity successfully created!");
        }

        window.location.href = `../ActivityPage/activity.html`; 

    } catch (error) {
        console.error("Failed to save activity:", error);
        alert("Failed to save activity. Please try again");
    } finally {
        save.textContent = "Save";
    }
}
const removeButton = document.querySelector(".remove-btn");
if (removeButton) {
    removeButton.addEventListener("click", () => {
        const activityPicInput = document.getElementById("activityPic");
        if (activityPicInput) {
            activityPicInput.value = "";
        }
    });
}

const previewButton = document.getElementById('preview');
const saveActivityButton = document.getElementById("saveActivity");

if (previewButton) {
    previewButton.addEventListener("click", previewActivity);
}
if (saveActivityButton) {
    saveActivityButton.addEventListener("click", saveActivity);
}
if (signOutButton) {
    signOutButton.addEventListener("click", signOut);
}
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

if (openChangebtn && closeChangebtn && changePopup) {
    openChangebtn.addEventListener("click", () => openPopup(changePopup));
    closeChangebtn.addEventListener("click", () => closePopup(changePopup));
}
if (openSuggestBtn && interestPopup) {
    openSuggestBtn.addEventListener("click", () => openPopup(interestPopup));
}
if (closeSuggestBtn && interestPopup) {
    closeSuggestBtn.addEventListener("click", () => closePopup(interestPopup));
}

//update email 
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
const saveButton = document.getElementById("saveBtn");
if (saveButton) {
    saveButton.addEventListener("click", async () => updateDetails())
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

//use user's profile interest
const useMyInterestsButton = document.getElementById("useMyInterests");
if (useMyInterestsButton) {
    useMyInterestsButton.addEventListener("click", async () => {
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
    });
}

const useNewInterestsButton = document.getElementById("useNewInterests");
if (useNewInterestsButton) {
    useNewInterestsButton.addEventListener("click", async () => {
    document.getElementById("useMyInterests").style.display = "none";
    document.getElementById("useNewInterests").style.display = "none";
    document.getElementById('newInterests').style.display = "block";
    document.getElementById("generateActivity").style.display = "block";
    document.getElementById("interestPopupLabel").textContent = "Please enter max of 3 ONE WORD interests, separated by commas and no spaces."
    });
}

//use new interests 
const generateActivityButton = document.getElementById("generateActivity");
if (generateActivityButton) {
    generateActivityButton.addEventListener("click", async () => {

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
}

//interest info button 
const interestInfoPopup = document.getElementById("interestInfo");
const interestInfoButton = document.getElementById("interestInfobtn");
const closeInterestInfoButton = document.getElementById("closeInterestInfobtn");

if (interestInfoButton && interestInfoPopup) {
    interestInfoButton.addEventListener("click", () => openPopup(interestInfoPopup));
}
if (closeInterestInfoButton && interestInfoPopup) {
    closeInterestInfoButton.addEventListener("click", () => closePopup(interestInfoPopup));
}

export {
    signOut,
    previewActivity,
    loadActivityDetails,
    saveActivity,
    resetInterestPopup,
    openPopup,
    closePopup,
    updateDetails,
    generateActivity,
};
