import { supabase } from "../../src/supabaseClient.js";

async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        alert("Error signing out: " + error.message);
        return;
    }

    alert("Successfully signed out!");
    window.location.href = "../Login/login.html";
}


/* displaying box for each user */
async function loadFriendCode() {

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("Profile")
    .select("friend_code")
    .eq("created_by", user.id)
    .single();

  if (error) {
    console.log(error);
    return;
  }

  document.getElementById("friend-code-display").textContent = data.friend_code;
}

loadFriendCode();
loadFriendRequests();
loadFriends();
const { data: { user } } = await supabase.auth.getUser();

document
    .querySelector(".add-friend-button")
    .addEventListener("click", sendFriendRequest);


/* send friend request */
/* read friend code from input  -> find matching profile -> get receiver ID -> insert row into Friend_Request */
async function sendFriendRequest() {
    const friendCode = document.getElementById("friend-code-input").value;

    const { data, error } = await supabase
        .from("Profile")
        .select("created_by")
        .eq("friend_code", friendCode)
        .single();

    if (error) {
        alert("Error finding friend: " + error.message);
        return;
    }

    const receiverId = data.created_by;
    const { data: { user } } = await supabase.auth.getUser();

    if (receiverId === user.id) {
        alert("You cannot add yourself");
        return;
    }

    const { error: requestError } = await supabase
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
    loadFriends();
}

async function loadFriendRequests() {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
    .from("Friend_request")
    .select("*")
    .eq("receiver_id", user.id)
    .eq("status", "pending");

    if (error) {
    console.log(error);
    return;
    }

    const container = document.getElementById("requests-container");

    for (const request of data) {
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
        container.innerHTML += `
            <div class="request-card">
                <p>${senderProfile.name} sent you a request</p>
                <button 
                    class="accept-btn" 
                    onclick="acceptFriendRequest('${request.id}')">
                    Accept
                </button>
                <button 
                    class="reject-btn" 
                    onclick="rejectFriendRequest('${request.id}')">
                    Reject
                </button>
            </div>
`           ;
        }

}

async function acceptFriendRequest(requestId) {
    const { data, error } = await supabase
        .from("Friend_request")
        .select("*")
        .eq("id", requestId)
        .single();

    if (error) {
        console.log(error);
        return;
    }

    const { error: friendError } = await supabase
        .from("Friend_list")
        .insert([
            {
                user_id: data.sender_id,
                friend_id: data.receiver_id
            },
            {
                user_id: data.receiver_id,
                friend_id: data.sender_id
            }
        ]);

    if (friendError) {
        console.log(friendError);
        return;
    }

    const { error: updateError } = await supabase
        .from("Friend_request")
        .update({ status: "accepted" })
        .eq("id", requestId);

    if (updateError) {
        console.log(updateError);
        return;
    }


    alert("Friend request accepted!");
}

async function rejectFriendRequest(requestId) {
    const { error } = await supabase
        .from("Friend_request")
        .update({ status: "rejected" })
        .eq("id", requestId);

    if (error) {
        console.log(error);
        return;
    }

    alert("Friend request rejected!");
}

async function loadFriends() {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from("Friend_list")
        .select("*")
        .eq("user_id", user.id);

    if (error) {
        console.log(error);
        return;
    }

    const container = document.getElementById("friends-container");
    container.innerHTML = "";

    for (const friend of data) {
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

        container.innerHTML += `
            <div class="friend-card">
                <img
                    src="/images/default-profile.png"
                    alt="Profile Picture"
                    class="friend-pic">

                <div class="friend-info">
                    <p class="friend-name">${friendProfile.name}</p>
                    <p class="friend-interest">
                        ${friendProfile.interest}
                    </p>
                </div>
            </div>
        `;
    }
}

window.acceptFriendRequest = acceptFriendRequest;
window.rejectFriendRequest = rejectFriendRequest;

document.getElementById("signout").addEventListener("click", signOut);
