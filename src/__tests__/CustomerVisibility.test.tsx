import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../lib/supabase';
import { CustomerListPage } from '../pages/customers/CustomerListPage';

// Mock BOTH hooks the component depends on
vi.mock('../hooks/useRights', () => ({ useRights: vi.fn() }));
vi.mock('../providers/AuthProvider', () => ({ useAuth: vi.fn() }));

import { useRights } from '../hooks/useRights';
import { useAuth } from '../providers/AuthProvider';

// ─── Helpers to keep beforeEach blocks DRY ────────────────────────────────────
const mockAsUser = () => {
  vi.mocked(useAuth).mockReturnValue({ role: 'user', user: null, session: null, recordstatus: null, loading: false, signOut: async () => {} });
  vi.mocked(useRights).mockReturnValue({ canViewStamp: false });
};

const mockAsAdmin = () => {
  vi.mocked(useAuth).mockReturnValue({ role: 'admin', user: null, session: null, recordstatus: null, loading: false, signOut: async () => {} });
  vi.mocked(useRights).mockReturnValue({ canViewStamp: true });
};

// ─── Default Supabase stub ─────────────────────────────────────────────────────
const stubSupabaseEmpty = () => {
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        then: (resolve: (v: unknown) => void) => resolve({ count: 0, data: null, error: null }),
      }),
    }),
  } as any);
};

// ─────────────────────────────────────────────────────────────────────────────

describe('Customer Visibility & React Query Enforcement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubSupabaseEmpty();
  });

  describe('UI Visibility: Stamp Column', () => {
    it('is absent for USER role', () => {
      mockAsUser();
      render(<CustomerListPage />);
      expect(screen.queryByTestId('stamp-column')).not.toBeInTheDocument();
    });

    it('is present for ADMIN role', () => {
      mockAsAdmin();
      render(<CustomerListPage />);
      expect(screen.getByTestId('stamp-column')).toBeInTheDocument();
    });
  });

  describe('Data Visibility: INACTIVE Customers', () => {
    const mockDbData = [
      { custno: 'C0001', custname: 'Active Customer', recordstatus: 'ACTIVE' },
      { custno: 'C0002', custname: 'Hidden Inactive Customer', recordstatus: 'INACTIVE' },
    ];

    beforeEach(() => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockDbData, error: null }),
            then: (resolve: (v: unknown) => void) => resolve({ count: 1, data: null, error: null }),
          }),
        }),
      } as any);
    });

    it('filters out INACTIVE records on the frontend for USER role', async () => {
      mockAsUser();
      render(<CustomerListPage />);
      await waitFor(() => {
        expect(screen.getByText('Active Customer')).toBeInTheDocument();
        expect(screen.queryByText('Hidden Inactive Customer')).not.toBeInTheDocument();
      });
    });

    it('renders INACTIVE records so they can be viewed by ADMIN role', async () => {
      mockAsAdmin();
      render(<CustomerListPage />);
      await waitFor(() => {
        expect(screen.getByText('Active Customer')).toBeInTheDocument();
        expect(screen.getByText('Hidden Inactive Customer')).toBeInTheDocument();
      });
    });
  });

  describe('Data Recovery: ADMIN Action Rights', () => {
    it('shows a "Recover" button ONLY for ADMIN/SUPERADMIN on INACTIVE rows', async () => {
      const inactiveData = [{ custno: '99', custname: 'Deleted Corp', recordstatus: 'INACTIVE' }];

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: inactiveData, error: null }),
            then: (resolve: (v: unknown) => void) => resolve({ count: 1, data: null, error: null }),
          }),
        }),
      } as any);

      // 1. Test as ADMIN (Should see the recovery button)
      mockAsAdmin();
      const { rerender } = render(<CustomerListPage />);
      await waitFor(() => {
        expect(screen.getByTestId('recover-btn-99')).toBeInTheDocument();
      });

      // 2. Test as USER (Should NOT see the recovery button)
      mockAsUser();
      rerender(<CustomerListPage />);
      await waitFor(() => {
        expect(screen.queryByTestId('recover-btn-99')).not.toBeInTheDocument();
      });
    });
  });
});