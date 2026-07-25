import { describe, it, expect, beforeEach, vi } from "vitest";


const {
    mockEq,
    mockInvoke,
    mockJoinedEq,
    mockActivityNeq,
    mockProfileEq,
    mockMaybeSingle,
} = vi.hoisted(() => ({
    mockEq: vi.fn(),
    mockInvoke: vi.fn(),
    mockJoinedEq: vi.fn(),
    mockActivityNeq: vi.fn(),
    mockProfileEq: vi.fn(),
    mockMaybeSingle: vi.fn(),
}));


vi.mock("../src/supabaseClient.js", () => ({
    supabase: {
        auth: {
            signOut: vi.fn(),
            updateUser: vi.fn(),
            getUser: vi.fn(),
        },
functions: {
            invoke: mockInvoke,
        },
        from: vi.fn((table) => {
            if (table === "Interested_activities") {
                return {
                    select: vi.fn(() => ({
                        eq: vi.fn(() => {
                            if (mockJoinedEq.mock.results.length === 0) {
                                return mockJoinedEq();
                            }
                            return {
                                eq: vi.fn(() => ({
                                    maybeSingle: mockMaybeSingle,
                                })),
                            };
                        }),
                    })),
                };
            }
            if (table === "Activity") {
                return {
                    select: vi.fn(() => ({
                        neq: mockActivityNeq,
                    })),
                };
            }
            if (table === "Profile") {
                return {
   select: vi.fn(() => ({
                        eq: mockProfileEq,
                    })),
                };
            }
            return {};
        }),
    },
}));


import { supabase } from "../src/supabaseClient.js";
import {
    signOut,
    updateDetails,
    displayActivities,
} from "../pages/ReccActivity/reccAct.js";


describe("Recommend Activity Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("alert", vi.fn());
        delete window.location;
        window.location = { href: "" };
        document.body.innerHTML = `
            <div class="navbar"></div>
            <div class="activityPage"></div>
            <button id="change"></button>
            <button id="close"></button>
            <div id="changeEmailPassword"></div>
            <input id="newPassword">
            <input id="confirmPassword">
            <button id="saveBtn">Save</button>
            <button id="signout"></button>
            <button id="interestSuggestion"></button>
            <button id="randomSuggestion"></button>
            <div id="activityContainer"></div>
        `;
    });


    describe("Recommend Activity", () => {
        describe("signout", () => {
            it("should sign out successfully", async () => {
                supabase.auth.signOut.mockResolvedValue({ error: null });
                await signOut();
                expect(alert).toHaveBeenCalledWith("Successfully signed out!");
                expect(window.location.href).toBe("/pages/Login/login.html");
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
    });


    describe("display activities", () => {
        it("shows empty message", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "user123" } },
                error: null,
            });
            mockJoinedEq.mockReturnValue({
                data: [],
  error: null,
            });
            mockActivityNeq.mockResolvedValue({
                data: [],
                error: null,
            });
            await displayActivities();
            expect(document.getElementById("activityContainer").textContent).toContain("No more activity records");
        });


        it("display activity details correctly", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "user123" } },
                error: null,
            });
            mockJoinedEq.mockReturnValue({
                data: [],
                error: null,
            });
            mockActivityNeq.mockResolvedValue({
                data: [
                    {
                        id: "1",
                        created_by: "creator1",
                        name: "Football",
                        description: "Friendly Match",
                        location: "NUS",
                        date: "2027-01-01",
                        time: "12:00:00",
  participants: 10,
                        registered: 2,
                        generalised_interests: ["Sports"],
                    },
                ],
                error: null,
            });
            mockProfileEq.mockResolvedValue({
                data: [{ name: "John Doe" }],
                error: null,
            });
            mockMaybeSingle.mockResolvedValue({
                data: null,
                error: null,
            });
            await displayActivities();
            expect(document.body.textContent).toContain("Football"); expect(document.body.textContent).toContain("Friendly Match"); expect(document.body.textContent).toContain("John Doe"); expect(document.body.textContent).toContain("Sports");
        });


        it("should display two activities", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "user123" } },
                error: null,
            });
  mockJoinedEq.mockReturnValue({
                data: [],
                error: null,
            });
            mockActivityNeq.mockResolvedValue({
                data: [
                    {
                        id: "1",
                        created_by: "creator1",
                        name: "Football",
                        description: "Friendly Match",
                        location: "NUS",
                        date: "2027-01-01",
                        time: "12:00:00",
                        participants: 10,
                        registered: 2,
                        generalised_interests: ["Sports"],
                    },
                    {
                        id: "2",
                        created_by: "creator2",
                        name: "Basketball",
                        description: "3v3 Game",
                        location: "NTU",
                        date: "2027-01-02",
                        time: "15:00:00",
                        participants: 8,
                        registered: 5,
                        generalised_interests: ["Fitness"],
                    },
                ],
                error: null,
            });
            mockProfileEq
                .mockResolvedValueOnce({
                    data: [{ name: "John Doe" }],
                    error: null,
                })
                .mockResolvedValueOnce({
                    data: [{ name: "Jane Smith" }],
                    error: null,
                });
            mockMaybeSingle
                .mockResolvedValueOnce({
                    data: null,
                    error: null,
                })
                .mockResolvedValueOnce({
                    data: null,
                    error: null,
                });
   await displayActivities();
            const cards = document.querySelectorAll(".activityBox");
            expect(cards).toHaveLength(2); expect(document.body.textContent).toContain("Football"); expect(document.body.textContent).toContain("Basketball"); expect(document.body.textContent).toContain("John Doe"); expect(document.body.textContent).toContain("Jane Smith");
        });


        it("should handle errors", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "user123" } },
                error: null,
            });


            mockJoinedEq.mockReturnValue({
                data: [],
                error: null,
            });


            mockActivityNeq.mockResolvedValue({
                data: null,
                error: new Error("Database error"),
            });


            await displayActivities();


            expect(alert).toHaveBeenCalledWith("Failed to display activites");
   });
    });
});

