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
        order: vi.fn().mockReturnThis(), // Added so sorting queries don't crash the tests
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        
        // THE ULTIMATE QA FLEX: 
        // If any developer tries to use a hard delete, the test will instantly fail 
        // and print this exact error message in their terminal!
        delete: vi.fn().mockImplementation(() => {
          throw new Error("QA ALERT: Hard deletes are strictly forbidden by the Project Guide! You must use an update() to set record_status = 'INACTIVE' instead.");
        }),
      })),
    })),
  };
});