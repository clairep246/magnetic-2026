import { supabase } from "../../src/supabaseClient.js";

async function loadRecommendations() {
    const { data: profiles, error } =
        await supabase.functions.invoke("recommendFriends");

    if (error) {
        console.log("Error loading recommendations:", error);
        return;
    }

    const container =
        document.getElementById("recommend-container");

    container.innerHTML = "";

    if (!profiles || profiles.length === 0) {
        container.innerHTML = `
            <div class="empty">
                <p>No recommended friends yet.</p>
            </div>
        `;
        return;
    }

    for (const profile of profiles) {
        container.innerHTML += `
            <div class="recommend-card">
                <img
                    src="/images/default-profile.png"
                    alt="Profile Picture"
                    class="recommend-pic">

                <div class="recommend-info">
                    <p class="recommend-name">
                        ${profile.name}
                    </p>

                    <p class="recommend-score">
                        ${Math.round(profile.interestScore * 100)}% match
                    </p>
                </div>
            </div>
        `;
    }
}

loadRecommendations();