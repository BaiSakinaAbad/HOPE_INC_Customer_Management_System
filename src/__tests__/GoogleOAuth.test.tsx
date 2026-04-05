import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import LoginPage from '../components/pages/LoginPage';
import RegisterPage from '../components/pages/RegisterPage';

const supabase = createClient('fake-url', 'fake-key');

describe('Google OAuth Feature', () => {
  it('calls Supabase signInWithOAuth when clicking Google login', async () => {
    render(<LoginPage />);
    
    const googleLoginBtn = screen.getByTestId('google-login-btn');
    fireEvent.click(googleLoginBtn);

    await waitFor(() => {
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
      });
    });
  });

  it('calls Supabase signInWithOAuth when clicking Google register', async () => {
    render(<RegisterPage />);
    
    const googleRegBtn = screen.getByTestId('google-register-btn');
    fireEvent.click(googleRegBtn);

    await waitFor(() => {
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
      });
    });
  });
});