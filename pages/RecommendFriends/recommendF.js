import { supabase } from "../../src/supabaseClient.js";

async function loadRecommendations() {
    const { data: profiles, error } =
        await supabase.functions.invoke("recommendFriends");

    if (error) {
        console.error("Error loading recommendations:", error);
        return;
    }

    const container = document.getElementById("recommend-container");
    container.innerHTML = "";

    if (!profiles || profiles.length === 0) {
        container.innerHTML = `
            <div class="empty">
                <p>No recommended friends yet.</p>
            </div>
        `;
        return;
    }

    for (let i = 0; i < 5; i++) {
        if (i >= profiles.length) {
            break;
        }

        const profile = profiles[i];
        const reccCard = document.createElement("div");
       
        reccCard.innerHTML = `
        <div class="recommend-card">
            <img
                src="/images/default-profile.png"
                alt="Profile Picture"
                class="recommend-pic">

            <div class="recommend-info">
                <p class="recommend-name">
                    ${profile.name}
                </p>
                <p class="recommend-details">
                    <strong> Interests: </strong>${profile.interest}
                </p>
                <p class="recommend-details">
                     <strong> Score: </strong>${Math.round(profile.interestScore * 100)}% match
                </p>
            </div>
            </div>
        `;
        container.appendChild(reccCard);
    }
    console.log(profiles);
}

// Runs when the script loads
loadRecommendations();