import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../lib/supabase';
import LoginPage from '../pages/auth/LoginPage';

describe('Email Login Feature', () => {
  // Our whiteboard eraser is now properly inside the single describe block!
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls Supabase signInWithPassword when submitting the login form', async () => {
    render(<LoginPage onSwitch={vi.fn()} onLoginSuccess={vi.fn()} />);

    const emailInput = screen.getByTestId('login-email-input');
    const passwordInput = screen.getByTestId('login-password-input');
    const submitBtn = screen.getByTestId('login-submit-btn');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});