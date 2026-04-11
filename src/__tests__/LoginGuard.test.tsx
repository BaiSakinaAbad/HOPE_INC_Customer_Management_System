import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../lib/supabase';
// M4 will need to update this path to point to their Auth Guard component
import { AuthLayout } from '../components/shells/AuthLayout';


describe('Login Guard Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('forces sign out if the user record_status is INACTIVE', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
      data: { user: { id: '123', user_metadata: { record_status: 'INACTIVE' } } },
      error: null
    } as any);

    render(
      <AuthLayout title="Test Title" subtitle="Test Subtitle">
        <div>Test Child</div>
      </AuthLayout>
    );

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  it('allows entry and does NOT sign out if the user is ACTIVE', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
      data: { user: { id: '456', user_metadata: { record_status: 'ACTIVE' } } },
      error: null
    } as any);

    render(
      <AuthLayout title="Test Title" subtitle="Test Subtitle">
        <div>Test Child</div>
      </AuthLayout>
    );

    await waitFor(() => {
      expect(supabase.auth.signOut).not.toHaveBeenCalled();
    });
  });
});