// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockEq = vi.fn();

vi.mock('../src/supabaseClient.js', () => ({
  supabase: {
    auth: {
      signOut: vi.fn(),
      updateUser: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: mockEq,
      }),
    })),
  },
}));

import { supabase } from '../src/supabaseClient.js';
import { signOut, updateDetails, displayProfile } from '../pages/Profile/profile.js';

describe('Profile Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.stubGlobal('alert', vi.fn());
    vi.stubGlobal('location', { href: '' });

    document.body.innerHTML = `
      <div class="navbar"></div>
      <div class="Page"></div>
      <button id="change"></button>
      <button id="close"></button>
      <div id="changeEmailPassword" style="display: none;"></div>
      <div id="popup" style="display: block;"></div>
      <input id="newPassword" />
      <input id="confirmPassword" />
      <button id="saveBtn"></button>
      
      <span id="name"></span>
      <span id="about"></span>
      <span id="telegram"></span>
      <span id="residences"></span>
      <span id="year"></span>
      <span id="major"></span>
      <span id="interests"></span>
      <img id="profilePhoto" src="" />
      
      <button id="signout"></button>
    `;
  });

  describe('sign out', () => {
    it('should alert error if signout fails', async () => {
      supabase.auth.signOut.mockResolvedValueOnce({ error: { message: 'Invalid credentials' } });

      await signOut();

      expect(alert).toHaveBeenCalledWith('Error signing out: Invalid credentials');
    });

    it('should redirect to login on successful signout', async () => {
      supabase.auth.signOut.mockResolvedValueOnce({ error: null });

      await signOut();

      expect(alert).toHaveBeenCalledWith('Successfully signed out!');
      expect(window.location.href).toBe('../Login/login.html');
    });
  });

  describe('update details', () => {
    it('should alert if passwords do not match', async () => {
      document.getElementById('newPassword').value = '123456';
      document.getElementById('confirmPassword').value = '1234567';

      await updateDetails();

      expect(alert).toHaveBeenCalledWith('Passwords do not match. Please try again');
    });

    it('should alert on error', async () => {
      document.getElementById('newPassword').value = '123456';
      document.getElementById('confirmPassword').value = '123456';

      supabase.auth.updateUser.mockResolvedValueOnce({ data: {}, error: 'Invalid password' });

      await updateDetails();

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: '123456',
      });
      expect(alert).toHaveBeenCalledWith('Failed to update, please try again');
    });

    it('should format payload correctly and alert success', async () => {
      document.getElementById('newPassword').value = 'newSecret123';
      document.getElementById('confirmPassword').value = 'newSecret123';

      supabase.auth.updateUser.mockResolvedValueOnce({ data: {}, error: null });

      await updateDetails();

      expect(alert).toHaveBeenCalledWith('Changed password  successfully');
    });
  });

  describe('displayProfile()', () => {
    it('should populate text fields correctly', async () => {
      supabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'user123' } },
        error: null,
      });

      mockEq.mockResolvedValueOnce({
        data: [
          {
            name: 'tester1',
            about: 'hello!',
            telegram: '@tester',
            residences: 'UTown',
            year_of_study: 'Year 2',
            major: 'Computer Science',
            interest: ['Coding', 'Gaming'],
            profilePicUrl: '/images/testPic',
          },
        ],
        error: null,
      });

      await displayProfile();

      expect(supabase.from).toHaveBeenCalledWith('Profile');
      expect(mockEq).toHaveBeenCalledWith('created_by', 'user123');

      expect(document.getElementById('name').textContent).toBe('tester1');
      expect(document.getElementById('about').textContent).toBe('hello!');
      expect(document.getElementById('interests').textContent).toBe('Coding, Gaming');
      expect(document.getElementById('profilePhoto').src).toContain('/images/testPic');
      expect(document.getElementById('residences').textContent).toContain('UTown');
      expect(document.getElementById('year').textContent).toBe('Year 2');
      expect(document.getElementById('major').textContent).toBe('Computer Science');
      expect(document.getElementById('telegram').textContent).toBe('@tester');
    });
  });
});