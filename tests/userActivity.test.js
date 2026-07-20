// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from "vitest";

const { mockEq, mockSingle, mockUpdateEq, mockUpload, mockGetPublicUrl, mockInvoke, mockOrder, mockDelete } = vi.hoisted(() => ({
    mockEq: vi.fn(),
    mockSingle: vi.fn(),
    mockUpdateEq: vi.fn(),
    mockUpload: vi.fn(),
    mockGetPublicUrl: vi.fn(),
    mockInvoke: vi.fn(),
    mockOrder: vi.fn(),
    mockDelete: vi.fn()
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
            })),
            update: vi.fn(() => ({
                eq: mockUpdateEq,
            })),
            delete: mockDelete
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
    openPopup,
    closePopup,
    updateDetails,
    displayActivities,
    nextActivities,
    prevActivities,
    editActivity,
    deleteActivity,
} from "../pages/ActivityPage/activity.js";

describe("Activity Page Tests", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.stubGlobal("alert", vi.fn());
        vi.stubGlobal("confirm", vi.fn(() => true));
        mockEq.mockReset();
        mockOrder.mockReset();
        mockSingle.mockReset();
        mockDelete.mockReset();

        mockEq.mockReturnValue({
            order: mockOrder,
            single: mockSingle,
        });
            

        document.body.innerHTML = `
          <div class="navbar"></div>
          <div class="activityPage"></div>
          <button id="change"></button>
          <button id="close"></button>
          <button id="signout"></button>
          <div id="changeEmailPassword"></div>
          <input id="newPassword">
          <input id="confirmPassword">
          <button id="saveBtn">Save</button>
          <div id="activityContainer"></div>
          <button id="nextButton"></button>
          <button id="prevButton"></button>
          <button id="closeParticipants"></button>
          <div id="participantsModal"></div>
          <div id="participantsList"></div>
        `;

        delete window.location;
        window.location = { href: "" };
    });

    describe("display activities", () => {
        it("should handle errors", async () => {
            supabase.auth.getUser.mockResolvedValue({ data: { 
                user: { id: "user123" } 
            }, 
            error: null });
            mockOrder.mockResolvedValueOnce({ data: null, error: "error" });

            await displayActivities();

            expect(alert).toHaveBeenCalledWith("Failed to display activites");
        });

        it("should show empty message when no activities exist", async () => {
            supabase.auth.getUser.mockResolvedValue({ data: { user: { 
                id: "user123" } }, 
                error: null });
            mockOrder.mockResolvedValueOnce({ data: [], error: null });

            await displayActivities();

            expect(document.getElementById("activityContainer").textContent).toContain("No activities have been created.");
        });

        it("should display activity information correctly", async () => {
            supabase.auth.getUser.mockResolvedValue({ data: { user: { 
                id: "user123" } }, 
                error: null });

            mockOrder.mockResolvedValueOnce({
                data: [{
                    id: "1",
                    name: "Football",
                    description: "Friendly Match",
                    location: "NUS",
                    date: "2027-01-01",
                    time: "12:00",
                    registered: 2,
                    participants: 10,
                    generalised_interests: ["Sports"],
                }],
                error: null,
            });

            await displayActivities();

            expect(document.body.textContent).toContain("Football");
            expect(document.body.textContent).toContain("Friendly Match");
            expect(document.body.textContent).toContain("NUS");
            expect(document.body.textContent).toContain("Sports");
            expect(document.body.textContent).toContain("January 1, 2027");
            expect(document.body.textContent).toContain("12:00 PM");
        });

        it("should only display three activities", async () => {
            supabase.auth.getUser.mockResolvedValue({ data: { user: { 
                id: "user123" } }, 
                error: null });
            mockOrder.mockResolvedValueOnce({
                data: [
                    { id: "1", name: "A", description: "", location: "NUS", date: "2027-01-01", time: "10:00", registered: 0, participants: 5, generalised_interests: [] },
                    { id: "2", name: "B", description: "", location: "NUS", date: "2027-01-01", time: "10:00", registered: 0, participants: 5, generalised_interests: [] },
                    { id: "3", name: "C", description: "", location: "NUS", date: "2027-01-01", time: "10:00", registered: 0, participants: 5, generalised_interests: [] },
                    { id: "4", name: "D", description: "", location: "NUS", date: "2027-01-01", time: "10:00", registered: 0, participants: 5, generalised_interests: [] }
                ],
                error: null,
            });

            await displayActivities();

            expect(document.getElementById("activityContainer").children.length).toBe(3);
        });
    });

    describe("delete activity", () => {
        it("should alert user when delete activity successfully", async () => {

            mockDelete.mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                    error: null,
                }),
            });

            await deleteActivity("activity1");

            expect(supabase.from).toHaveBeenCalledWith("Activity");
            expect(alert).toHaveBeenCalledWith("Activity successfully deleted!" );
        });

        it("should handle errors", async () => {

        mockDelete.mockReturnValue({
            eq: vi.fn().mockResolvedValue({
                error: "failed",
            }),
        });

        await deleteActivity("activity1");

        expect(alert).toHaveBeenCalledWith("failed to delete activity");
            });
        });


});