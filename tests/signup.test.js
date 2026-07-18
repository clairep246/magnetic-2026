// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { signup } from '../pages/Signup/signup.js'; 
import { supabase } from '../src/supabaseClient.js';

vi.mock('../src/supabaseClient.js', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
    },
  },
}));

describe('Signup Test', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    document.body.innerHTML = `
      <input id="name" type="text" />
      <input id="email" type="email" />
      <input id="password" type="password" />
      <button id="signUp">Sign Up</button>
    `;

    vi.stubGlobal('alert', vi.fn());
    vi.stubGlobal('window', {
      ...window,
      location: { href: '' },
    });
  });

  it('should alert if name is missing', async () => {
    document.getElementById('email').value = 'test@u.nus.edu';
    document.getElementById('password').value = 'password123';

    await signup();

    expect(alert).toHaveBeenCalledWith('Please enter your name');
  });

  it('should alert if email is missing', async () => {
    document.getElementById('name').value = 'John Doe';
    document.getElementById('password').value = 'password123';

    await signup();

    expect(alert).toHaveBeenCalledWith('Please enter your email');
  });

  it('should alert if the email is not a valid NUS email', async () => {
    document.getElementById('name').value = 'John Doe';
    document.getElementById('email').value = 'john@gmail.com';
    document.getElementById('password').value = 'password123';

    await signup();

    expect(alert).toHaveBeenCalledWith('Only valid NUS emails are allowed');
``  });

  it('should alert if password is missing', async () => {
    document.getElementById('name').value = 'John Doe';
    document.getElementById('email').value = 'test@u.nus.edu';

    await signup();

    expect(alert).toHaveBeenCalledWith('Please enter your password');
  });

  it('should alert with error message if signup fails', async () => {
    document.getElementById('name').value = 'John Doe';
    document.getElementById('email').value = 'test@u.nus.edu';
    document.getElementById('password').value = 'password123';

    supabase.auth.signUp.mockResolvedValueOnce({
      data: null,
      error: { message: 'Email already registered' },
    });

    await signup();

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@u.nus.edu',
      password: 'password123',
      options: { data: { name: 'John Doe' } },
    });
    expect(alert).toHaveBeenCalledWith('Email already registered');
  });

  it('should alert success and redirect on successful signup', async () => {
    document.getElementById('name').value = 'John Doe';
    document.getElementById('email').value = 'test@u.nus.edu';
    document.getElementById('password').value = 'password123';

    // Mock Supabase returning successful data
    supabase.auth.signUp.mockResolvedValueOnce({
      data: { user: { id: '123' } },
      error: null,
    });

    await signup();

    expect(alert).toHaveBeenCalledWith('Signup successful!');
    expect(window.location.href).toBe('../EditProfile/edit.html');
  });
});