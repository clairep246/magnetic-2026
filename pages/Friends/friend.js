import { supabase } from "../../src/supabaseClient.js";
import defaultProfilePic from "../../images/default-profile.jpg";

document.addEventListener('DOMContentLoaded', () => {
    const dropdowns = document.querySelectorAll('.dropDown');

    dropdowns.forEach(dropdown => {
        const button = dropdown.querySelector('button');
        let timeout;

        button.addEventListener('click', () => {
            dropdown.classList.toggle('active');

            clearTimeout(timeout);

            timeout = setTimeout(() => {
                dropdown.classList.remove('active');
            }, 2000);
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropDown')) {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
});

async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        alert("Error signing out: " + error.message);
        return;
    }

    alert("Successfully signed out!");
    window.location.href = "../Login/login.html";
}

const openChangebtn = document.getElementById("change");
const closeChangebtn = document.getElementById("close");
const changePopup = document.getElementById("changeEmailPassword");
const navBar = document.querySelector(".navbar");


function openPopup(popupElement) {
    popupElement.style.setProperty("display", "flex", "important");
    popupElement.style.flexDirection = "column";
    navBar.style.opacity = "0.5";
    document.querySelector(".heading-row").style.opacity = "0.5"; 
  document.querySelector(".all-content").style.opacity = "0.5"; 
}

function closePopup(popupElement) {
    popupElement.style.display = "none";
    navBar.style.opacity = "1";
    document.querySelector(".heading-row").style.opacity = "1"; 
   document.querySelector(".all-content").style.opacity = "1"; 
}

openChangebtn.addEventListener("click", () => openPopup(changePopup));
closeChangebtn.addEventListener("click", () => closePopup(changePopup));

async function loadFriendCode() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
        .from("Profile")
        .select("friend_code")
        .eq("created_by", user.id)
        .single();

    if (error) {
        console.error(error);
        return;
    }
    document.getElementById("friend-code-display").textContent = data.friend_code;
}

async function sendFriendRequest() {
    const friendCode = document.getElementById("friend-code-input").value;
    const { data: { user } } = await supabase.auth.getUser();
    const {data: friendCodeRecords, error: friendCodeError} = await supabase
        .from("Profile")
        .select("friend_code")
        .neq("created_by", user.id);
    
    let friendCodes = friendCodeRecords.map(record => record.friend_code);
    if (!friendCodes.includes(friendCode)) {
        alert("Invalid friend code");
        document.getElementById("friend-code-input").value = "";
        return;
    }

    const { data, error } = await supabase
        .from("Profile")
        .select("*")
        .eq("friend_code", friendCode)
        .single();

    if (error) {
        alert("Error finding friend: " + error.message);
        return;
    }

    const receiverId = data.created_by;
   
    if (receiverId === user.id) {
        alert("You cannot add yourself");
        document.getElementById("friend-code-input").value = "";
        return;
    }

    const {data: checkFriend, error: checkFriendError} = await supabase
    .from("Friend_list")
    .select("*")
    .eq("user_id", user.id)
    .eq("friend_id", receiverId);

    if (checkFriend && checkFriend.length > 0) {
        alert("You are already friends with this user.");
        document.getElementById("friend-code-input").value = "";
        return;
    }

    const {data: checkRequest, error: checkError} = await supabase
        .from("Friend_request")
        .select("*")
        .eq("sender_id", user.id)
        .eq("receiver_id", receiverId);

    if (checkRequest.length != 0) {
        alert("Request has already been sent to this user.");
        document.getElementById("friend-code-input").value = "";
        return;
    }

    const { data: friendRequest, error: requestError } = await supabase
        .from("Friend_request")
        .insert([
            {
                sender_id: user.id,
                receiver_id: receiverId,
                status: "pending"
            }
        ]);

    if (requestError) {
        alert("Error sending friend request: " + requestError.message);
        return;
    }

    alert("Friend request sent!");
    document.getElementById("friend-code-input").value = "";
    loadFriendRequests();
}
async function loadFriendRequests() {

    const { data: { user } } = await supabase.auth.getUser();

    const { data:requestRecords, error:requestRecordsError } = await supabase
        .from("Friend_request")
        .select("*")
        .eq("receiver_id", user.id)
        .eq("status", "pending");

    
    if (requestRecordsError) {
        console.error("Error loading requests:", requestRecordsError.message);
        return;
    }

    const container = document.getElementById("requests-container");
    container.innerHTML = ""; 

    if (requestRecords.length === 0) {
        container.innerHTML = "<p>No pending friend requests.</p>";
        return;
    }

    for (const request of requestRecords) {
         const { data: senderProfile, error: senderError } =
            await supabase
                .from("Profile")
                .select("name")
                .eq("created_by", request.sender_id)
                .single();

        if (senderError) {
            console.log(senderError);
            continue;
        }
        
        const requestBox = document.createElement("div");
        requestBox.innerHTML = `
            <div class="request-card">
                <p>${senderProfile.name} sent you a request</p>
                <div class="action-btns">
                <button 
                    class="accept-btn">
                    Accept
                </button>
                <button 
                    class="reject-btn">
                    Reject
                </button>
            </div>
            </div>
            `;

        requestBox.querySelector(".accept-btn").addEventListener("click", async () => {
            await acceptFriendRequest(request.id, requestBox);
            loadFriendRequests(); 
            loadFriends();
        });

        requestBox.querySelector(".reject-btn").addEventListener("click", async () => {
            await rejectFriendRequest(request.id, requestBox);
            loadFriendRequests(); 
            loadFriends(); 
        });

        container.appendChild(requestBox);
    }
}

async function acceptFriendRequest(requestId, request) {
    const { data: requestData, error: fetchError } = await supabase
        .from("Friend_request")
        .select("*")
        .eq("id", requestId)
        .single();

    if (fetchError) {
        console.error(fetchError);
        return;
    }

    const { error: friendError } = await supabase
        .from("Friend_list")
        .insert([
            { user_id: requestData.sender_id, friend_id: requestData.receiver_id },
            { user_id: requestData.receiver_id, friend_id: requestData.sender_id }
        ]);

    if (friendError) {
        alert("Error adding to friend list: " + friendError.message);
        return;
    }

    const { error: updateError } = await supabase
        .from("Friend_request")
        .update({ status: "accepted" })
        .eq("id", requestId);

    if (updateError) {
        console.error(updateError);
        return;
    }

    alert("Friend request accepted!");
    request.remove();
}

async function rejectFriendRequest(requestId, request) {
    const { error } = await supabase
        .from("Friend_request")
        .update({ status: "rejected" })
        .eq("id", requestId);

    if (error) {
        console.error(error);
        return;
    }

    alert("Friend request rejected!");
    request.remove();
}

async function loadFriends() {
    const container = document.getElementById("friends-container");
    if (container) {
        container.innerHTML = `
            <div class="loading-state" style="text-align: center; padding: 40px; font-family: sans-serif; color: #666;">
                <div class="spinner" style="border: 4px solid rgba(0,0,0,0.1); width: 36px; height: 36px; border-radius: 50%; border-left-color: #09f; animation: spin 1s linear infinite; margin: 0 auto 10px auto;"></div>
                <p>Retrieving profiles...</p>
            </div>
            <style>
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        `;
    }
    const { data: { user } } = await supabase.auth.getUser();

    const { data:friendListData, error:friendListError } = await supabase
        .from("Friend_list")
        .select("*")
        .eq("user_id", user.id);

    if (friendListError) {
        console.log(friendListError);
        return;
    }

     if (friendListData.length === 0) {
        container.innerHTML = "<p>No friends added.</p>";
        return;
    }

    container.innerHTML = "";

    for (const friend of friendListData) {
        const { data: friendProfile, error: profileError } =
            await supabase
                .from("Profile")
                .select("name, interest")
                .eq("created_by", friend.friend_id)
                .single();

        if (profileError) {
            console.log(profileError);
            continue;
        }
        const friendBox = document.createElement("div");
        friendBox.innerHTML = `
            <div class="friend-card">
                <img
                    src=${defaultProfilePic}
                    class="friend-pic">

                <div class="friend-info">
                    <p class="friend-name">${friendProfile.name}</p>
                    <p class="friend-interest">
                        ${friendProfile.interest}
                    </p>
                </div>
            </div>
        `;
        container.appendChild(friendBox);
    }
    console.log(friendListData);
}

document.querySelector(".add-friend-button").addEventListener("click", sendFriendRequest);
document.querySelector(".cancel-button").addEventListener("click", () => {
    document.getElementById("friend-code-input").value = "";
})
document.getElementById("signout").addEventListener("click", signOut);
loadFriendCode();
loadFriendRequests();
loadFriends();
