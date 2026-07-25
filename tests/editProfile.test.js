import { describe, it, expect, beforeEach, vi } from "vitest";


const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockUpdateEq = vi.fn();
const mockInsert = vi.fn();
const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();


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


      insert: mockInsert,
    })),


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
  loadProfileDetails,
  saveProfile,
  generateFriendCode,
} from "../pages/EditProfile/edit.js";


describe("Edit Profile Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();


    vi.stubGlobal("alert", vi.fn());


    document.body.innerHTML = `
      <div class="EditProfile"></div>


      <button id="change"></button>a
      <button id="close"></button>


      <div id="changeEmailPassword"></div>


      <button id="saveBtn">Save</button>
      <button id="save">Save</button>
      <button id="signout"></button>


      <input id="newPassword">
      <input id="confirmPassword">


      <input id="name">
      <textarea id="about"></textarea>
<input id="telegramHandle">


      <select id="residence">
        <option value=""></option>
        <option value="UTown">UTown</option>
      </select>


      <select id="year">
        <option value="Year 1">Year 1</option>
        <option value="Year 2">Year 2</option>
      </select>


      <select id="major">
        <option value=""></option>
        <option value="Computer Science">Computer Science</option>
      </select>


      <input id="profilePic" type="file">


      <input type="checkbox" name="interests" value="Gaming">
      <input type="checkbox" name="interests" value="Coding">
      <input type="checkbox" name="interests" value="Sports">
      <input type="checkbox" name="interests" value="Music">


      <h1>Edit Profile</h1>
    `;


    delete window.location;
    window.location = {
      href: "",
    };
  });


  describe("signOut()", () => {
    it("should redirect after successful sign out", async () => {
      supabase.auth.signOut.mockResolvedValueOnce({
        error: null,
      });


      await signOut();
 expect(alert).toHaveBeenCalledWith(
        "Successfully signed out!"
      );


      expect(window.location.href).toBe(
        "../Login/login.html"
      );
    });


    it("should alert when sign out fails", async () => {
      supabase.auth.signOut.mockResolvedValueOnce({
        error: {
          message: "failed",
        },
      });


      await signOut();


      expect(alert).toHaveBeenCalledWith(
        "Failed to signout, please try again"
      );
    });
  });
describe("updateDetails()", () => {
    it("should reject mismatching passwords", async () => {
      document.getElementById("newPassword").value = "123456";
      document.getElementById("confirmPassword").value = "654321";


      await updateDetails();


      expect(alert).toHaveBeenCalledWith(
        "Passwords do not match. Please try again"
      );
    });


    it("should update password successfully", async () => {
      document.getElementById("newPassword").value =
        "123456";
      document.getElementById("confirmPassword").value =
        "123456";


      supabase.auth.updateUser.mockResolvedValueOnce({
        data: {},
        error: null,
      });


      await updateDetails();


      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: "123456",
      });


      expect(alert).toHaveBeenCalledWith(
        "Changed password  successfully"
      );
    });


    it("should alert if update fails", async () => {
      document.getElementById("newPassword").value =
        "secret123";
      document.getElementById("confirmPassword").value =
        "secret123";


      supabase.auth.updateUser.mockResolvedValueOnce({
        data: {},
        error: "error",
      });


      await updateDetails();


      expect(alert).toHaveBeenCalledWith(
        "Failed to update, please try again"
      );
    });
  });


  describe("saveProfile()", () => {
    beforeEach(() => {
      supabase.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: "user123",
          },
        },
        error: null,
      });
    });


    it("should require name", async () => {
      await saveProfile();


      expect(alert).toHaveBeenCalledWith(
        "Please enter your name"
      );
    });


    it("should require residence", async () => {
      document.getElementById("name").value = "Alice";


      await saveProfile();


      expect(alert).toHaveBeenCalledWith(
        "Please select your residence"
      );
    });


    it("should require major", async () => {
      document.getElementById("name").value = "Alice";
      document.getElementById("residence").value = "UTown";


      await saveProfile();


      expect(alert).toHaveBeenCalledWith(
        "Please select your major"
  );
    });


    it("should reject more than three interests", async () => {
      document.getElementById("name").value = "Alice";
      document.getElementById("residence").value = "UTown";
      document.getElementById("major").value =
        "Computer Science";


      document.querySelectorAll(
        'input[name="interests"]'
      ).forEach((box) => (box.checked = true));


      await saveProfile();


      expect(alert).toHaveBeenCalledWith(
        "You can only select up to 3 interests!"
      );
    });


    it("should handle errors", async () => {
      document.getElementById("name").value = "Alice";
      document.getElementById("residence").value = "UTown";
      document.getElementById("major").value =
        "Computer Science";


      mockInsert.mockResolvedValueOnce({
        error: "Error",
      });


      await saveProfile();


      expect(supabase.from).toHaveBeenCalledWith(
        "Profile"
      );


    expect(mockInsert).toHaveBeenCalled();


      expect(alert).toHaveBeenCalledWith(
  "Failed to save profile. Please try again"
      );
    });
 


    it("should insert new profile", async () => {
      document.getElementById("name").value = "Alice";
      document.getElementById("residence").value = "UTown";
      document.getElementById("major").value =
        "Computer Science";


      mockInsert.mockResolvedValueOnce({
        error: null,
      });


      await saveProfile();


      expect(supabase.from).toHaveBeenCalledWith(
        "Profile"
      );


    expect(mockInsert).toHaveBeenCalled();


      expect(alert).toHaveBeenCalledWith(
        "Profile successfully created!"
      );
    expect(window.location.href).toBe('../Profile/profile.html');


    });
  });
});
