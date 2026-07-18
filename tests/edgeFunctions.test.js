import { supabase } from "../src/supabaseClient.js";
import { describe, test, expect } from "vitest";

const ALLOWED_INTERESTS = [
  "Sports & Fitness",
  "Gaming",
  "Technology",
  "Arts & Crafts",
  "Music",
  "Entertainment",
  "Learning & Knowledge",
  "Business & Career",
  "Food & Cooking",
  "Travel & Outdoors",
  "Lifestyle",
  "Social Activities",
  "Community service",
];

describe("generalise interest function", () => {
  
  test.each([
    ["Painting"],
    ["Football"],
    ["Baking"],
    ["Hiking"],
  ])(
    "should map to valid category", 
    async (inputInterest) => {
      const { data, error } = await supabase.functions.invoke(
        "clever-service",
        {
          body: {
            interests: [inputInterest],
          },
        }
      );
      console.log(data.interests);
      expect(ALLOWED_INTERESTS.includes(data.interests)).toBe(true);
    }
  );

});

//---------------------------------------------------------
describe("Recommend activity function", () => {
  
  test.each([
    ["Painting"] ,
    ["Football", "Gaming"] ,
    ["Coding", "Baking", "Hiking"] 
  ])(
    "should return recommended activity: name, description, interests are not empty", 
    async ({ inputs }) => {
      const { data, error } = await supabase.functions.invoke(
        "clever-action",
        {
          body: 
          { interests: [inputs]},
        }
      );
      console.log(data)
      const hasValidActivityName = 
        typeof data.activityName === "string" && 
        data.activityName.length > 0;
      expect(hasValidActivityName).toBe(true);

      const hasValidDescription = 
        typeof data.description === "string" && 
        data.description.length > 0;
      expect(hasValidDescription).toBe(true);

      let resultInterests = data.interests;

      if (typeof resultInterests === "string") {
        resultInterests = resultInterests
          .split(",")                  
          .map(item => item.trim())    
          .filter(Boolean);            

      const isArray = Array.isArray(resultInterests);
      expect(isArray).toBe(true);

      const validArrayStructure = resultInterests.length > 0 && resultInterests.length <= 3;
      expect(validArrayStructure).toBe(true);

      const allItemsAllowed = resultInterests.every(category => ALLOWED_INTERESTS.includes(category));
      expect(allItemsAllowed).toBe(true);
    }
})
});

//-----------------------------------------
describe("Location cleaner function", () => {
  
  test.each([
    [
      "Toa Payoh MRT station", 
      "Toa Payoh Singapore"
    ],
    [
      "MBS", 
      "Marina Bay Sands Singapore"
    ],
    [
      "NUS", 
      "National University of Singapore Singapore"
    ],
    [
      "Marina Bay", 
      "Marina Bay Singapore"
    ],
    [
      "Bedok South Avenue 4", 
      "Bedok South Avenue 4 Singapore"
    ],
    [
      "Waterway Point", 
      "Waterway Point Singapore"
    ]
  ])(
    "should clean up input '%s' to match '%s'", 
    async (inputLocation, expectedLocation) => {
      const { data, error } = await supabase.functions.invoke(
        "quick-handler", 
        {
          body: { location: inputLocation },
        }
      );

      const matchesExpected = data.location.trim() === expectedLocation;
      expect(matchesExpected).toBe(true);
    }
  );

});

//------------------------------------------
