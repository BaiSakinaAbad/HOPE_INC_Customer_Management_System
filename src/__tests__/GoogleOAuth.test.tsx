import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../lib/supabase';
import LoginPage from '../components/pages/LoginPage';
import RegisterPage from '../components/pages/RegisterPage';

describe('Google OAuth Feature', () => {
  // Here is the whiteboard eraser to prevent test leaks!
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls Supabase signInWithOAuth when clicking Google login', async () => {
    // We added the vi.fn() props here so Saira's UI doesn't crash
    render(<LoginPage onSwitch={vi.fn()} onLoginSuccess={vi.fn()} />);
    
    const googleLoginBtn = screen.getByTestId('google-login-btn');
    fireEvent.click(googleLoginBtn);

    await waitFor(() => {
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: window.location.origin, // Vinz's redirect fix
        },
      });
    });
  });

  it('calls Supabase signInWithOAuth when clicking Google register', async () => {
    // Added the vi.fn() prop here as well
    render(<RegisterPage onSwitch={vi.fn()} />);
    
    const googleRegBtn = screen.getByTestId('google-register-btn');
    fireEvent.click(googleRegBtn);

    await waitFor(() => {
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
    });
  });
});