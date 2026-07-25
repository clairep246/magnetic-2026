import { describe, it, expect, beforeEach, vi } from "vitest";
const {
    mockInvoke,
    mockFriendEq,
    mockRequestEq,
} = vi.hoisted(() => ({
    mockInvoke: vi.fn(),
    mockFriendEq: vi.fn(),
    mockRequestEq: vi.fn(),
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
            if (table === "Friend_list") {
                return {
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            eq: mockFriendEq,
                        })),
                    })),
                };
            }
            if (table === "Friend_request") {
                return {
                    select: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            eq: mockRequestEq,
                        })),
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
    loadRecommendations,
} from "../pages/RecommendFriends/recommendF.js";


describe("Recommend Friends Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal("alert", vi.fn());
        delete window.location;
        window.location = { href: "" };
        document.body.innerHTML = `
            <div class="navbar"></div>
            <div class="recommend-page"></div>
            <button id="change"></button>
            <button id="close"></button>
            <div id="changeEmailPassword"></div>
            <input id="newPassword">
            <input id="confirmPassword">
            <button id="saveBtn">Save</button>
            <button id="signout"></button>
            <div id="recommend-container"></div>
        `;
        mockInvoke.mockReset();
        mockFriendEq.mockReset();
        mockRequestEq.mockReset();
    });


    describe("Recommend Friends", () => {
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
    });
   describe("load recommendations", () => {
        it("should show empty message when no recommendations exist", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "user123" } },
                error: null
            });
            mockInvoke.mockResolvedValue({
                data: [],
                error: null,
            });
            await loadRecommendations();
            expect(document.getElementById("recommend-container").textContent).toContain("No recommended friends yet.");
        });


        it("should display recommendation cards", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "user123" } },
                error: null
            });
            mockInvoke.mockResolvedValue({
                data: [
                    {
                        created_by: "friend1",
                        name: "John",
                        interest: ["Sports"],
                        friend_code: "ABC123",
                        interestScore: 0.91,
                        profilePicUrl: ""
                    }
                ],
                error: null
            });
            mockFriendEq.mockResolvedValue({
                data: [],
                error: null
   });
            mockRequestEq.mockResolvedValue({
                data: [],
                error: null
            });
            await loadRecommendations();
            expect(document.body.textContent).toContain("John");
            expect(document.body.textContent).toContain("Sports");
            expect(document.body.textContent).toContain("ABC123");
            expect(document.body.textContent).toContain("91% match");
            expect(document.querySelectorAll(".recommend-card").length).toBe(1);
        });


        it("should handle recommendation errors", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "user123" } },
                error: null
            });
            const spy = vi.spyOn(console, "error").mockImplementation(() => {});
            mockInvoke.mockResolvedValue({
                data: null,
                error: "failed"
            });
            await loadRecommendations();
            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });
    });
});
