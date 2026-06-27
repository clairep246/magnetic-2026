import { supabase } from "../../src/supabaseClient.js";

async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        alert("Error signing out: " + error.message);
        return;
    }

    alert("Successfully signed out!");
    window.location.href = "/pages/Login/login.html";
}

//change password and email
const open = document.getElementById("change");
const close = document.getElementById("close");
const changePopup = document.getElementById("changeEmailPassword");
const navBar = document.querySelector(".navbar");
const mainSection = document.querySelector(".recommendationPage")

open.addEventListener("click", () => {
    changePopup.style.display = "flex";
    changePopup.style.flexDirection = "column";
    navBar.style.opacity = "50%";
    mainSection.style.opacity = "50%";
});
close.addEventListener("click", () => {
    changePopup.style.display = "none";
    navBar.style.opacity = "100%";
    mainSection.style.opacity = "100%";
});

document.getElementById("signout").addEventListener("click", signOut);

//get the location and turn to lat/lang
async function geocodeLocation(locationName) {
   const wordsToRemove = ["mrt station", "mrt", "lrt station", "lrt", "bus interchange", "bus stop", 
  "entrance", "exit", "point", "pick up", "drop off", "taxi stand",
  "car park", "carpark", "multi storey car park", "loading bay", "loading dock","block", "blk", "bldg", "level", "lvl", "storey", "floor", "unit", 
  "lobby", "podium", "annex", "community centre", "community club", "cc", "rn centre",
   "polyclinic"]
   locationName = locationName.toLowerCase();
    for (const phrase of wordsToRemove) {
        locationName = locationName.replaceAll(phrase, "");
    }

    locationName = locationName.replace(/\s+/g, " ").trim();
    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}`
    );

    const data = await response.json();

    if (!data.length){
        return null;
    } 
    console.log(locationName)
    return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
    };
    
}

async function clean(location){
const { data: cleanLocation, error } = await supabase.functions.invoke(
        "quick-handler",
        {
            body: {
            location,
            },
        }
        );
        console.log(cleanLocation.location)
}
//clean("Flower Dome")
//const coords = await geocodeLocation("Flower dome singapore")
//console.log(coords);
// { lat: 1.2834, lng: 103.8607 }

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    console.log("Not supported by this browser")
  }
}

function success(position) {
  console.log("Latitude: " + position.coords.latitude + "Longitude: " + position.coords.longitude);
}

function error() {
  alert("Sorry, no position available.");
}

getLocation()