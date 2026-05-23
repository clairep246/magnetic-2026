import { supabase } from "../../src/supabaseClient.js";
const details = new URLSearchParams(window.location.search);
retrieveDetails();

async function retrieveDetails() {
    try {
        const { data, error } = await supabase.from("Activity").select('*').eq('id', details.get('id')).single();

        if (error) {
            throw error;
        }

        //update the text
        document.getElementById('createdBy').textContent = data.id;
        document.getElementById('title').textContent = data.name;
        document.getElementById('description').textContent = `\n data.description`;
        document.getElementById('interests').textContent = `${(data.interests ?? []).join(', ')}`;
        document.getElementById('location').textContent = data.location;
        document.getElementById('participants').textContent = data.participants;

        const formattedTime = new Date(`2026-01-01T${data.time}`).toLocaleTimeString(navigator.language, {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        document.getElementById('time').textContent = formattedTime;

        const formattedDate = new Date(data.date).toLocaleDateString(navigator.language, {
             day: 'numeric',
             month: 'long',
             year: 'numeric'
        });

        document.getElementById('date').textContent = formattedDate;

     } catch (error) {
        console.error("Create activity page failed:", error);
    }
}
