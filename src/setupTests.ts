import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({
      auth: {
        signUp: vi.fn().mockResolvedValue({ data: { user: { id: '123' } }, error: null }),
        signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: '123' } }, error: null }),
        signInWithOAuth: vi.fn().mockResolvedValue({ data: { provider: 'google', url: 'http://localhost' }, error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } },
        })),
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
    })),
  };
});