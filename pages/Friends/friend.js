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

document.getElementById("signout").addEventListener("click", signOut);
