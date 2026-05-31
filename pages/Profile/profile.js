import { supabase } from "../../src/supabaseClient.js";

async function displayProfile() {
    try {
        const {data: { user }, error: authError} = await supabase.auth.getUser();
    
    if (authError) {
        throw new Error("User not authenticated");
    }
    
    const {data, error: GetError} = await supabase.from("Profile").select("*").eq("created_by", user.id);

    if (GetError) {
            throw new Error("Failed to load profile");
        }

    document.getElementById("name").value = data[0].name || "";
    document.getElementById("about").value = data[0].about || "";
    document.getElementById("telegramHandle").value = data[0].telegram_handle || "";
    document.getElementById("residence").value = data[0].residences || "";
    document.getElementById("year").value = data[0].year_of_study || "";
    document.getElementById("major").value = data[0].course || "";
    
    const interests = data[0].interests || [];
    document.querySelectorAll(".interests button").forEach(button => {
        if (interests.includes(button.textContent)) {
            button.classList.add("selected");
        }
    });

    }catch  (error) {
    console.log("Failed to load profile:", error);
    }
}