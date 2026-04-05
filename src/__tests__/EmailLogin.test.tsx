import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';
// M2 will need to fix these import paths when they build the components
import LoginPage from '../components/pages/LoginPage';

const supabase = createClient('fake-url', 'fake-key');

describe('Email Login Feature', () => {
  it('calls Supabase signInWithPassword when submitting the login form', async () => {
    render(<LoginPage />);

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