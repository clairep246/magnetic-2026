// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from "vitest";

const { mockEq, mockSingle, mockUpdateEq, mockUpload, mockGetPublicUrl, mockInvoke, mockOrder, mockDelete, mockInsert} = vi.hoisted(() => ({
    mockEq: vi.fn(),
    mockSingle: vi.fn(),
    mockUpdateEq: vi.fn(),
    mockUpload: vi.fn(),
    mockGetPublicUrl: vi.fn(),
    mockInvoke: vi.fn(),
    mockOrder: vi.fn(),
    mockDelete: vi.fn(),
    mockInsert: vi.fn()
}));

vi.mock("../src/supabaseClient.js", () => ({
    supabase: {
        auth: {
            signOut: vi.fn(),
            updateUser: vi.fn(),
            getUser: vi.fn(),
        },

        from: vi.fn((table) => {
            if (table === "Profile") {
                return {
                    select: vi.fn(() => ({
                        eq: vi.fn(async () => ({ data: [{ name: "John Doe" }], error: null })),
                    })),
                };
            }

            if (table === "Interested_activities") {
                return {
                    insert: mockInsert,
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            eq: vi.fn(() => ({
                                maybeSingle: vi.fn(async () => ({ data: null, error: null })),
                            })),
                        })),
                    })),
                    delete: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            eq: vi.fn(() => Promise.resolve({ error: null })),
                        })),
                    })),
                };
            }

            return {
                select: vi.fn(() => ({
                    neq: vi.fn(() => ({
                        order: mockOrder,
                    })),
                    eq: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            maybeSingle: mockOrder,
                        })),
                        single: mockSingle,
                    })),
                })),
                update: vi.fn(() => ({
                    eq: mockUpdateEq,
                })),
                delete: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        eq: mockDelete,
                    })),
                })),
            };
        }),

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
    updateDetails,
    displayActivities,
    joinActivity,
    leaveActivity,
} from "../pages/ActivityBrowser/browser.js";

describe("Activity browser test", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockOrder.mockReset();
        mockSingle.mockReset();
        mockUpdateEq.mockReset();
        mockUpload.mockReset();
        mockGetPublicUrl.mockReset();
        mockInvoke.mockReset();
        mockDelete.mockReset();
        mockInsert.mockReset();

        mockOrder.mockResolvedValue({ data: [], error: null });
        mockSingle.mockResolvedValue({ data: null, error: null });
        mockUpdateEq.mockResolvedValue({ error: null });
        mockDelete.mockResolvedValue({ error: null });

        vi.stubGlobal("alert", vi.fn());

        delete window.location;
        window.location = { href: "" };

        document.body.innerHTML = `
        <div class="activityPage"></div>

        <button id="signout"></button>

        <button id="change"></button>
        <button id="close"></button>

        <div id="changeEmailPassword"></div>

        <input id="newPassword">
        <input id="confirmPassword">

        <button id="saveBtn">Save</button>

        <button id="allActivities" class="active"></button>
        <button id="joinedActivities"></button>

        <div class="filterList"></div>
        <button id="clearFilter"></button>

        <div id="activityContainer"></div>

        <button id="nextButton"></button>
        <button id="prevButton"></button>
    `;
    });

    describe("signout", () => {
        it("should sign out successfully", async () => {
            supabase.auth.signOut.mockResolvedValue({ error: null });

            await signOut();

            expect(alert).toHaveBeenCalledWith("Successfully signed out!");
            expect(window.location.href).toBe("../Login/login.html");
        });

        it("should alert when sign out fails", async () => {
            supabase.auth.signOut.mockResolvedValue({ error: { message: "failed" } });

            await signOut();

            expect(alert).toHaveBeenCalledWith("Failed to sign out, please try again.");
        });
    });

    describe("change password", () => {
        it("should alert passwords do not match", async () => {
            document.getElementById("newPassword").value = "abc123";
            document.getElementById("confirmPassword").value = "123456";

            await updateDetails();

            expect(alert).toHaveBeenCalledWith("Passwords do not match. Please try again");
        });

        it("should update password successfully", async () => {
            document.getElementById("newPassword").value = "123456";
            document.getElementById("confirmPassword").value = "123456";

            supabase.auth.updateUser.mockResolvedValue({ data: {}, error: null });

            await updateDetails();

            expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: "123456" });
            expect(alert).toHaveBeenCalledWith("Changed password  successfully");
        });

        it("should alert if update fails", async () => {
            document.getElementById("newPassword").value = "password";
            document.getElementById("confirmPassword").value = "password";

            supabase.auth.updateUser.mockResolvedValue({ data: {}, error: "failed" });

            await updateDetails();

            expect(alert).toHaveBeenCalledWith("Failed to update, please try again");
        });
    });

    describe("display activities", () => {
        it("should handle errors", async () => {
            supabase.auth.getUser.mockResolvedValue({ data: { 
                user: { id: "user123" } 
            }, 
            error: null });
            mockOrder.mockResolvedValueOnce({ data: null, error: "error" });

            await displayActivities();

            expect(alert).toHaveBeenCalledWith("Failed to display acitvities");
        });

        it("should show empty message when no activities exist", async () => {
            supabase.auth.getUser.mockResolvedValue({ data: { user: { 
                id: "user123" } }, 
                error: null });
            mockOrder.mockResolvedValueOnce({ data: [], error: null });

            await displayActivities();

            expect(document.getElementById("activityContainer").textContent).toContain("No activities to be displayed.");
        });

        it("should display activity information correctly", async () => {
            supabase.auth.getUser.mockResolvedValue({ 
                data: { user: { id: "user123" } }, 
                error: null 
            });

            mockOrder.mockResolvedValueOnce({
                data: [{
                    id: "1",
                    name: "Football",
                    description: "Friendly Match",
                    location: "NUS",
                    date: "2027-01-01",
                    time: "12:00:00",
                    registered: 2,
                    participants: 10,
                    generalised_interests: ["Sports"],
                    created_by: "creator123"
                }],
                error: null,
            });

            mockOrder.mockResolvedValueOnce({
                data: [{ name: "John Doe" }],
                error: null
            });

            mockOrder.mockResolvedValueOnce({
                data: null, // user has not joined yet
                error: null
            });

            await displayActivities();

            expect(document.body.textContent).toContain("Football");
            expect(document.body.textContent).toContain("Friendly Match");
            expect(document.body.textContent).toContain("NUS");
            expect(document.body.textContent).toContain("Sports");
});
        it("should only display two activities", async () => {
            supabase.auth.getUser.mockResolvedValue({ data: { user: { 
                id: "user123" } }, 
                error: null });
            mockOrder.mockResolvedValueOnce({
                data: [
                    { id: "1", name: "A", description: "", location: "NUS", date: "2027-01-01", time: "10:00", registered: 0, participants: 5, generalised_interests: ["Sports"], created_by: "creator1" },
                    { id: "2", name: "B", description: "", location: "NUS", date: "2027-01-01", time: "10:00", registered: 0, participants: 5, generalised_interests: ["Music"], created_by: "creator2" },
                    { id: "3", name: "C", description: "", location: "NUS", date: "2027-01-01", time: "10:00", registered: 0, participants: 5, generalised_interests: ["Food"], created_by: "creator3" },
                    { id: "4", name: "D", description: "", location: "NUS", date: "2027-01-01", time: "10:00", registered: 0, participants: 5, generalised_interests: ["Movies"], created_by: "creator4" }
                ],
                error: null,
            });

            await displayActivities();

            expect(document.getElementById("activityContainer").children.length).toBe(2);
        });
    });

    describe("join activity", () => {
        it("should join activity successfully", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: {
                    user: {
                        id: "user123",
                    },
                },
                error: null,
            });
            mockInsert.mockResolvedValueOnce({
                data: {},
                error: null,
            });
            mockSingle.mockResolvedValueOnce({
                data: {
                    registered: 2,
                },
                error: null,
            });
            mockUpdateEq.mockResolvedValueOnce({
                error: null,
            });

            await joinActivity("activity1");

            expect(mockInsert).toHaveBeenCalledWith({
                activity_id: "activity1",
                user_id: "user123",
            });

            expect(alert).toHaveBeenCalledWith("Successfully joined activity!");
        });

        it("should handle errors", async () => {

            supabase.auth.getUser.mockResolvedValue({
                data: {
                    user: {
                        id: "user123",
                    },
                },
                error: null,
            });

            mockInsert.mockResolvedValueOnce({
                data: null,
                error: "failed",
            });

            await joinActivity("activity1");

            expect(alert).toHaveBeenCalledWith("Failed to join activity. Please try again.");
        });
    });
    describe("leave activity", () => {

        it("should leave activity successfully", async () => {

            supabase.auth.getUser.mockResolvedValue({
                data: {
                    user: {
                        id: "user123",
                    },
                },
                error: null,
            });

            mockDelete.mockResolvedValueOnce({
                error: null,
            });

            mockSingle.mockResolvedValueOnce({
                data: {
                    registered: 3,
                },
                error: null,
            });

            mockUpdateEq.mockResolvedValueOnce({
                error: null,
            });

            await leaveActivity("activity1");

            expect(alert).toHaveBeenCalledWith("Left activity successfully");
        });

        it("should handle leave errors", async () => {

            supabase.auth.getUser.mockResolvedValue({
                data: {
                    user: {
                        id: "user123",
                    },
                },
                error: null,
            });

            mockDelete.mockResolvedValueOnce({
                error: "failed",
            });

            await leaveActivity("activity1");

            expect(alert).toHaveBeenCalledWith("Failed to leave activity, please try again");
        });

    });


})



