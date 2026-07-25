// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from "vitest";
const {
    mockEq,
    mockNeq,
    mockSingle,
    mockInsert,
    mockUpdate,
    mockDelete,
    mockSelect,
} = vi.hoisted(() => ({
    mockEq: vi.fn(),
    mockNeq: vi.fn(),
    mockSingle: vi.fn(),
    mockInsert: vi.fn(),
    mockUpdate: vi.fn(),
    mockDelete: vi.fn(),
    mockSelect: vi.fn(),
}));
vi.mock("../src/supabaseClient.js", () => ({
    supabase: {
        auth: {
            signOut: vi.fn(),
            updateUser: vi.fn(),
            getUser: vi.fn(),
        },
        from: vi.fn(() => ({
            select: mockSelect,
            insert: mockInsert,
            update: mockUpdate,
            delete: mockDelete,
        })),
    },
}));
import { supabase } from "../src/supabaseClient.js";
import {
    signOut,
    updateDetails,
    loadFriendCode,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    loadFriends,
} from "../pages/Friends/friend.js";


describe("Friends Page Tests", () => {
 beforeEach(() => {
        mockEq.mockReset();
        mockNeq.mockReset();
        mockSingle.mockReset();
        mockInsert.mockReset();
        mockUpdate.mockReset();
        mockDelete.mockReset();
        mockSelect.mockReset();
        vi.clearAllMocks();
        vi.stubGlobal("alert", vi.fn());
        mockEq.mockReturnValue({
            eq: mockEq,
            neq: mockNeq,
            single: mockSingle,
        });
        mockNeq.mockReturnValue({
            eq: mockEq,
        });
        mockSelect.mockImplementation(() => ({
            eq: mockEq,
            neq: mockNeq,
            single: mockSingle,
        }));
        mockInsert.mockResolvedValue({
            data: {},
            error: null,
        });
        mockEq.mockImplementation((...args) => {
            if (args[0] === "receiver_id") {
                return {
                    eq: () => Promise.resolve({ data: [], error: null }),
                };
            }
            return {
                eq: mockEq,
                neq: mockNeq,
                single: mockSingle,
            };
        });
 mockUpdate.mockReturnValue({
            eq: mockEq,
        });
        mockDelete.mockReturnValue({
            eq: mockEq,
        });
        mockSingle.mockResolvedValue({
            data: {},
            error: null,
        });
        delete window.location;
        window.location = { href: "" };
        document.body.innerHTML = `
        <div class="navbar"></div>
        <div class="heading-row"></div>
        <div class="all-content"></div>
        <button id="signout"></button>
        <button id="change"></button>
        <button id="close"></button>
        <div id="changeEmailPassword"></div>
        <input id="newPassword">
        <input id="confirmPassword">
        <button id="saveBtn">Save</button>
        <div id="friend-code-display"></div>
        <input id="friend-code-input" />
 <div id="requests-container"></div>
        <div id="friends-container"></div>
        <button class="add-friend-button">Add</button>
        <button class="cancel-button">Cancel</button>
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


    describe("load friend code", () => {
 it("should display the user's friend code", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "user123" } }
            });
            mockSingle.mockResolvedValue({
                data: { friend_code: "ABC123" },
                error: null,
            });
            await loadFriendCode();
            expect(document.getElementById("friend-code-display").textContent).toBe("ABC123");
        });
        it("should alert when error", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "user123" } }
            });
            mockSingle.mockResolvedValue({
                data: null,
                error: { message: "failed" }
            });
            await loadFriendCode();
            expect(alert).toHaveBeenCalledWith("Failed to load friend code");
        });
    });


    describe("send friend request", () => {
        it("should alert when friend code is invalid", async () => {
            document.getElementById("friend-code-input").value = "123456";
            supabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "user123" } }
            });
            mockNeq.mockResolvedValueOnce({
                data: [
                    { friend_code: "XYZ999" },
                    { friend_code: "HELLO" }
                ],
                error: null
            });
 await sendFriendRequest();
            expect(alert).toHaveBeenCalledWith("Invalid friend code");
            expect(document.getElementById("friend-code-input").value).toBe("");
        });
        it("should not allow user to add themselves", async () => {
            document.getElementById("friend-code-input").value = "ABC123";
            supabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "user123" } }
            });
            mockNeq.mockResolvedValueOnce({
                data: [ { friend_code: "ABC123" } ],
                error: null
            });
            mockEq.mockReturnValueOnce({
                single: mockSingle,
            });
            mockSingle.mockResolvedValueOnce({
                data: { created_by: "user123" },
                error: null
            });
            mockSingle.mockResolvedValue({
                data: { created_by: "user123" },
                error: null
            });
            await sendFriendRequest();
            expect(alert).toHaveBeenCalledWith("You cannot add yourself");
        });
        it("should alert if users are already friends", async () => {
            document.getElementById("friend-code-input").value = "ABC123";
            supabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "user123" } }
            });
            mockNeq.mockResolvedValueOnce({
                data: [{ friend_code: "ABC123" }],
                error: null
            });
            mockEq
                .mockReturnValueOnce({
                    single: mockSingle,
  })
                .mockReturnValueOnce({
                    eq: mockEq,
                    neq: mockNeq,
                    single: mockSingle,
                })
                .mockResolvedValueOnce({
                    data: [{}],
                    error: null,
                });
            mockSingle.mockResolvedValueOnce({
                data: { created_by: "friend1" },
                error: null
            });
            mockSingle.mockResolvedValue({
                data: { created_by: "friend1" },
                error: null
            });
            await sendFriendRequest();
            expect(alert).toHaveBeenCalledWith("You are already friends with this user.");
        });
        it("should alert if request has already been sent", async () => {
            document.getElementById("friend-code-input").value = "ABC123";
            supabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "user123" } }
            });
            mockNeq.mockResolvedValueOnce({
                data: [{ friend_code: "ABC123" }],
                error: null
            });
            mockEq
                .mockReturnValueOnce({
                    single: mockSingle,
                })
                .mockReturnValueOnce({
                    eq: mockEq,
                    neq: mockNeq,
                    single: mockSingle,
 })
                .mockResolvedValueOnce({
                    data: [],
                    error: null,
                })
                .mockReturnValueOnce({
                    eq: mockEq,
                    neq: mockNeq,
                    single: mockSingle,
                })
                .mockResolvedValueOnce({
                    data: [{}],
                    error: null,
                });
            mockSingle.mockResolvedValue({
                data: { created_by: "friend1" },
                error: null
            });
            await sendFriendRequest();
            expect(alert).toHaveBeenCalledWith("Request has already been sent to this user.");
        });
        it("should send friend request successfully", async () => {
            document.getElementById("friend-code-input").value = "ABC123";
            supabase.auth.getUser.mockResolvedValue({
                data: { user: { id: "user123" } }
            });
            mockNeq.mockResolvedValueOnce({
                data: [{ friend_code: "ABC123" }],
                error: null
            });
            mockEq
                .mockReturnValueOnce({
                    single: mockSingle,
                })
                .mockReturnValueOnce({
                    eq: mockEq,
                    neq: mockNeq,
                    single: mockSingle,
 })
                .mockResolvedValueOnce({
                    data: [],
                    error: null,
                })
                .mockReturnValueOnce({
                    eq: mockEq,
                    neq: mockNeq,
                    single: mockSingle,
                })
                .mockResolvedValueOnce({
                    data: [],
                    error: null,
                });
            mockSingle.mockResolvedValue({
                data: { created_by: "friend1" },
                error: null
            });
            mockInsert.mockResolvedValue({
                data: {},
                error: null
            });
            await sendFriendRequest();
            expect(alert).toHaveBeenCalledWith("Friend request sent!");
            expect(document.getElementById("friend-code-input").value).toBe("");
        });
    });


    describe("accept friend request", () => {
        it("should accept friend request successfully", async () => {
            const request = document.createElement("div");
            mockEq.mockReturnValueOnce({
                single: mockSingle,
            });
            mockSingle.mockResolvedValueOnce({
                data: {
                    sender_id: "friend1",
                    receiver_id: "user123"
                },
     error: null
            });
            mockInsert.mockResolvedValue({
                error: null
            });
            mockUpdate.mockReturnValue({
                eq: mockEq
            });
            mockEq.mockResolvedValue({
                error: null
            });
            await acceptFriendRequest("request1", request);
            expect(alert).toHaveBeenCalledWith("Friend request accepted!");
        });
        it("should handle insert errors", async () => {
            const request = document.createElement("div");
            mockEq.mockReturnValueOnce({
                single: mockSingle,
            });
            mockSingle.mockResolvedValueOnce({
                data: {
                    sender_id: "friend1",
                    receiver_id: "user123"
                },
                error: null
            });
            mockInsert.mockResolvedValue({
                error: { message: "failed" }
            });
            await acceptFriendRequest("request1", request);
            expect(alert).toHaveBeenCalledWith("Error adding to friend list: failed");
        });
        it("should handle update errors", async () => {
            const request = document.createElement("div");
            mockEq.mockReturnValueOnce({
                single: mockSingle,
            });
            mockSingle.mockResolvedValueOnce({
 data: {
                    sender_id: "friend1",
                    receiver_id: "user123"
                },
                error: null
            });
            mockInsert.mockResolvedValue({
                error: null
            });
            mockUpdate.mockReturnValue({
                eq: mockEq
            });
            mockEq.mockResolvedValue({
                error: { message: "failed" }
            });
            const spy = vi.spyOn(console, "error").mockImplementation(() => {});
            await acceptFriendRequest("request1", request);
            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });
    });


    describe("reject friend request", () => {
        it("should reject friend request", async () => {
            const request = document.createElement("div");
            mockUpdate.mockReturnValue({
                eq: mockEq
            });
            mockEq.mockResolvedValue({
                error: null
  });
            await rejectFriendRequest("request1", request);
            expect(alert).toHaveBeenCalledWith("Friend request rejected!");
        });
        it("should handle reject errors", async () => {
            const request = document.createElement("div");
            mockUpdate.mockReturnValue({
                eq: mockEq
            });
            mockEq.mockResolvedValue({
                error: { message: "failed" }
            });
            const spy = vi.spyOn(console, "error").mockImplementation(() => {});
            await rejectFriendRequest("request1", request);
            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });
    });


    describe("load friends", () => {
        it("should show no friends message", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: {
                    user: { id: "user123" }
                }
            });


            mockSelect.mockReturnValueOnce({
                eq: mockEq,
            });
            mockEq.mockResolvedValueOnce({
                data: [],
                error: null,
            });


            await loadFriends();


            expect(
                document.getElementById("friends-container").textContent
            ).toContain("No friends added.");
        });


        it("should display friends correctly", async () => {
            supabase.auth.getUser.mockResolvedValue({
                data: {
                    user: { id: "user123" }
                }
            });
 mockSelect
                .mockReturnValueOnce({
                    eq: mockEq,
                })
                .mockReturnValueOnce({
                    eq: mockEq,
                });


            mockEq
                .mockResolvedValueOnce({
                    data: [
                        {
                            friend_id: "friend1"
                        },
                        {
                            friend_id: "friend2"
                        }
                    ],
                    error: null,
                })
                .mockReturnValueOnce({
                    single: mockSingle,
                })
                .mockReturnValueOnce({
                    single: mockSingle,
                });


            mockSingle
                .mockResolvedValueOnce({
                    data: {
                        name: "John",
                        interest: ["Sports"]
                    },
                    error: null,
                })
                .mockResolvedValueOnce({
                    data: {
                        name: "Mary",
          interest: ["Music"]
                    },
                    error: null,
                });


            await loadFriends();


            expect(document.body.textContent).toContain("John");
            expect(document.body.textContent).toContain("Mary");
            expect(document.body.textContent).toContain("Sports");
            expect(document.body.textContent).toContain("Music");
            expect(document.querySelectorAll(".friend-card").length).toBe(2);
        });
    });
});
