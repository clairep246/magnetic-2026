// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { login } from '../pages/Login/login.js'; 

vi.mock('../src/supabaseClient.js', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(), 
    },
  },
}));

import { supabase } from '../src/supabaseClient.js';

describe('Login Function Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    document.body.innerHTML = `
      <input id="email" type="text" />
      <input id="password" type="password" />
      <button id="loginBtn">Login</button>
    `;
    vi.stubGlobal('alert', vi.fn());
    vi.stubGlobal('window', {
      ...window,
      location: { href: '' },
    });
   
  });

  // --- VALIDATION TESTS ---
  it('should alert if email is missing', async () => {
    document.getElementById('email').value = '';
    document.getElementById('password').value = 'password123';

    await login();

    expect(alert).toHaveBeenCalledWith('Please enter your email');
    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('should alert if password is missing', async () => {
    document.getElementById('email').value = 'user@example.com';
    document.getElementById('password').value = '';

    await login();

    expect(alert).toHaveBeenCalledWith('Please enter your password');
    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('should alert with error message if login fails', async () => {
    // Inputs
    document.getElementById('email').value = 'test@example.com';
    document.getElementById('password').value = '123456';

    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid login credentials' },
    });

    await login();

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: '123456',
    });

    expect(alert).toHaveBeenCalledWith('Invalid login credentials');
    
  });

  it('should alert success and redirect if login is valid', async () => {
    // Inputs
    document.getElementById('email').value = 'test@u.nus.edu';
    document.getElementById('password').value = '123456';

    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: { id: '123' } },
      error: null,
    });

    await login();

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@u.nus.edu',
      password: '123456',
    });

    expect(alert).toHaveBeenCalledWith('Login successful!');
    expect(window.location.href).toBe('../Profile/profile.html');
  });
});