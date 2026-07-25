import { describe, it, expect, beforeEach, vi } from "vitest";


const { mockEq, mockSingle, mockUpdateEq, mockUpload, mockGetPublicUrl, mockInvoke } = vi.hoisted(() => ({
    mockEq: vi.fn(),
    mockSingle: vi.fn(),
    mockUpdateEq: vi.fn(),
    mockUpload: vi.fn(),
    mockGetPublicUrl: vi.fn(),
    mockInvoke: vi.fn(),
}));


vi.mock("../src/supabaseClient.js", () => ({
    supabase: {
        auth: {
            signOut: vi.fn(),
            updateUser: vi.fn(),
            getUser: vi.fn(),
        },


        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: mockEq,
                single: mockSingle,
            })),


            update: vi.fn(() => ({
                eq: mockUpdateEq,
            })),
        })),


        functions: {
            invoke: mockInvoke,
        },


        storage: {
            from: vi.fn(() => ({
                upload: mockUpload,
                getPublicUrl: mockGetPublicUrl,
            })),
        },
    },
}));


import { supabase } from "../src/supabaseClient.js";


import {
    signOut,
    previewActivity,
    loadActivityDetails,
    saveActivity,
    updateDetails,
    generateActivity,
} from "../pages/CreateActivity/create.js";


describe("Create Activity Tests", () => {


    beforeEach(() => {
 vi.restoreAllMocks();
        vi.stubGlobal("alert", vi.fn());


        document.body.innerHTML = `
        <div class="CreateActivity"></div>


        <button id="saveActivity">Save</button>
        <button id="preview">Preview</button>
        <button id="signout"></button>


        <input id="name">
        <textarea id="description"></textarea>
        <input id="location">
        <input id="date">
        <input id="time">
        <input id="participants">
        <input id="interest">


        <input id="activityPic" type="file">


        <button class="remove-btn"></button>


        <h3 id="previewName"></h3>
        <p id="previewDescription"></p>
        <p id="previewLocation"></p>
        <p id="previewParticipants"></p>
        <img id="previewImage">
        <p id="previewTime"></p>
        <p id="previewDate"></p>


        <button id="change"></button>
        <button id="close"></button>


        <button id="suggest"></button>
        <button id="closeInterestbtn"></button>


        <div id="changeEmailPassword"></div>


        <input id="newPassword">
   <input id="confirmPassword">
        <button id="saveBtn">Save</button>


        <input id="newInterests">


        <button id="generateActivity">
            Generate Activity
        </button>
        `;


        delete window.location;
        window.location = {
            search: "",
            href: "",
        };
    });


    describe("signOut()", () => {
        it("should sign out successfully", async () => {
            supabase.auth.signOut.mockResolvedValue({ error: null });


            await signOut();


            expect(alert).toHaveBeenCalledWith("Successfully signed out!");
            expect(window.location.href).toBe("../Login/login.html");
        });


        it("should alert when sign out fails", async () => {
  supabase.auth.signOut.mockResolvedValue({ error: { message: "failed" } });


            await signOut();


            expect(alert).toHaveBeenCalledWith("Could not sign out. Please try again.");
        });
    });


    describe("preview activity", () => {
        it("should update preview correctly", () => {
            document.getElementById("name").value ="Football";
            document.getElementById("description").value ="Friendly Match";
            document.getElementById("location").value ="NUS";
            document.getElementById("participants").value ="10";
            document.getElementById("date").value = "2026-12-01";
            document.getElementById("time").value ="14:00";


            previewActivity();


            expect(document.getElementById("previewName").textContent).toBe("Football");
            expect(document.getElementById("previewDescription").textContent).toBe("Friendly Match");
            expect(document.getElementById("previewLocation").textContent).toBe("NUS");
            expect(document.getElementById("previewParticipants").textContent).toContain("10");
        });
    });


    describe("change password", () => {
        it("should reject mismatching passwords", async () => {
            document.getElementById("newPassword").value ="abc123";
            document.getElementById("confirmPassword").value ="xyz123";


            await updateDetails();


            expect(alert).toHaveBeenCalledWith("Passwords do not match. Please try again");
        });


        it("should update password successfully", async () => {
            document.getElementById("newPassword").value = "123456";
            document.getElementById("confirmPassword").value ="123456";


           supabase.auth.updateUser.mockResolvedValue({ data: {}, error: null });
           
            await updateDetails();


            expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: "123456" });
            expect(alert).toHaveBeenCalledWith("Changed password  successfully");
        });


        it("should alert if update fails", async () => {
            document.getElementById("newPassword").value = "password";
            document.getElementById("confirmPassword").value ="password";


            supabase.auth.updateUser.mockResolvedValue({ data: {}, error: "failed" });


            await updateDetails();


            expect(alert).toHaveBeenCalledWith("Failed to update, please try again");
        });
    });
  describe("save activity", () => {
        beforeEach(() => {
            supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user123" } }, error: null });
        });


        it("should require activity name", async () => {
            await saveActivity();
            expect(alert).toHaveBeenCalledWith("Please enter an activity name");
        });


        it("should require location", async () => {
            document.getElementById("name").value = "Football";


            await saveActivity();


 expect(alert).toHaveBeenCalledWith("Please enter a location");
        });


        it("should require date", async () => {
            document.getElementById("name").value ="Football";
            document.getElementById("location").value ="NUS";


            await saveActivity();


            expect(alert).toHaveBeenCalledWith("Please select a date");
        });


        it("should reject past dates", async () => {
            document.getElementById("name").value ="Football";
            document.getElementById("location").value ="NUS";
            document.getElementById("date").value ="2026-01-01";


            await saveActivity();


            expect(alert).toHaveBeenCalledWith("Cannot choose past dates. Please choose a future date");
        });


        it("should require time", async () => {
            document.getElementById("name").value ="Football";
            document.getElementById("location").value = "NUS";
            document.getElementById("date").value ="2027-01-01";


            await saveActivity();
  expect(alert).toHaveBeenCalledWith("Please select a time");
        });


        it("should require participants", async () => {
            document.getElementById("name").value ="Football";
            document.getElementById("location").value ="NUS";
            document.getElementById("date").value ="2027-01-01";
            document.getElementById("time").value ="14:00";




            await saveActivity();


            expect(alert).toHaveBeenCalledWith("Please enter number of participants");
        });


        it("should reject more than three interests", async () => {
            document.getElementById("name").value ="Football";
            document.getElementById("location").value ="NUS";
            document.getElementById("date").value ="2027-01-01";
            document.getElementById("time").value ="14:00";
            document.getElementById("participants").value ="10";
            document.getElementById("interest").value ="sports, friends, social, outdoors";


            await saveActivity();


            expect(alert).toHaveBeenCalledWith("Please enter max 3 interests");
        });


        it("should handle errors", async () => {
            document.getElementById("name").value ="Football";
            document.getElementById("location").value ="NUS";
            document.getElementById("date").value ="2027-01-01";
            document.getElementById("time").value ="14:00";
            document.getElementById("participants").value = "10";


            mockInvoke.mockResolvedValue({ data: null, error: "failed" });


            await saveActivity();


            expect(alert).toHaveBeenCalledWith("Failed to save activity. Please try again");
        });


        it("should create activity successfully", async () => {
            document.getElementById("name").value ="Football";
  document.getElementById("location").value ="NUS";
            document.getElementById("date").value = "2027-01-01";
            document.getElementById("time").value = "14:00";
            document.getElementById("participants").value = "10";


            mockInvoke.mockResolvedValue({ data: { activityID: "activity123" }, error: null });


            await saveActivity();


            expect(mockInvoke).toHaveBeenCalled();
            expect(alert).toHaveBeenCalledWith("Activity successfully created!");
            expect(window.location.href).toBe("../ActivityPage/activity.html");
        });
    });


    describe("generate activity", () => {
        it("should fill in fields successfully", async () => {
            mockInvoke.mockResolvedValue({
                data: {
                    activityName: "Football",
                    description: "Friendly football match",
                    interests: "Sports,Gaming",
                },
                error: null,
            });


            await generateActivity(["Sports", "Gaming"]);


            expect(mockInvoke).toHaveBeenCalled();
            expect(document.getElementById("name").value).toBe("Football");
            expect(document.getElementById("description").value).toBe("Friendly football match");
            expect(document.getElementById("interest").value).toBe("Sports,Gaming");
            expect(alert).toHaveBeenCalledWith("Activity successfully generated!");
        });


    it("should handle errors ", async () => {
            mockInvoke.mockResolvedValue({ data: null, error: "failed" });


            await generateActivity(["Sports"]);


            expect(alert).toHaveBeenCalledWith("Failed to generate activity");
        });
    });
});
