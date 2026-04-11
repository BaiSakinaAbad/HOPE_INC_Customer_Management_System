import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
// 1. Use the real supabase import that setupTests.ts is mocking!
import { supabase } from '../lib/supabase'; 
import CustomerListPage from '../components/pages/CustomerListPage';

// Mock the rights hook
vi.mock('../hooks/useRights', () => ({
  useRights: vi.fn(),
}));
import { useRights } from '../hooks/useRights';

describe('Customer Visibility & React Query Enforcement', () => {
  // 2. The Whiteboard Eraser
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('UI Visibility: Stamp Column', () => {
    it('is absent for USER role', () => {
      vi.mocked(useRights).mockReturnValue({ user_type: 'USER', rights: { CUST_VIEW: 1 } });
      render(<CustomerListPage />);
      expect(screen.queryByTestId('stamp-column')).not.toBeInTheDocument();
    });

    it('is present for ADMIN role', () => {
      vi.mocked(useRights).mockReturnValue({ user_type: 'ADMIN', rights: { CUST_VIEW: 1 } });
      render(<CustomerListPage />);
      expect(screen.getByTestId('stamp-column')).toBeInTheDocument();
    });
  });

  describe('Data Visibility: INACTIVE Customers', () => {
    // We create fake database data containing one ACTIVE and one INACTIVE customer
    const mockDbData = [
      { id: 1, name: 'Active Customer', record_status: 'ACTIVE' },
      { id: 2, name: 'Hidden Inactive Customer', record_status: 'INACTIVE' }
    ];

    beforeEach(() => {
      // We tell our Vitest stunt-double to return this mixed data
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockDbData, error: null })
        })
      } as any);
    });

    it('filters out INACTIVE records on the frontend for USER role', async () => {
      vi.mocked(useRights).mockReturnValue({ user_type: 'USER', rights: { CUST_VIEW: 1 } });
      render(<CustomerListPage />);

      await waitFor(() => {
        expect(screen.getByText('Active Customer')).toBeInTheDocument();
        // The INACTIVE customer MUST NOT render for a normal user
        expect(screen.queryByText('Hidden Inactive Customer')).not.toBeInTheDocument();
      });
    });

    it('renders INACTIVE records so they can be viewed by ADMIN role', async () => {
      vi.mocked(useRights).mockReturnValue({ user_type: 'ADMIN', rights: { CUST_VIEW: 1 } });
      render(<CustomerListPage />);

      await waitFor(() => {
        expect(screen.getByText('Active Customer')).toBeInTheDocument();
        expect(screen.getByText('Hidden Inactive Customer')).toBeInTheDocument();
      });
    });
  });

  // NEW: THE RECOVERY TEST SECTION
  describe('Data Recovery: ADMIN Action Rights', () => {
    it('shows a "Recover" button ONLY for ADMIN/SUPERADMIN on INACTIVE rows', async () => {
      const inactiveData = [{ id: 99, name: 'Deleted Corp', record_status: 'INACTIVE' }];
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: inactiveData, error: null })
        })
      } as any);

      // 1. Test as ADMIN (Should see the recovery button)
      vi.mocked(useRights).mockReturnValue({ user_type: 'ADMIN', rights: { CUST_EDIT: 1 } });
      const { rerender } = render(<CustomerListPage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('recover-btn-99')).toBeInTheDocument();
      });

      // 2. Test as USER (Should NOT see the recovery button)
      vi.mocked(useRights).mockReturnValue({ user_type: 'USER', rights: { CUST_EDIT: 0 } });
      rerender(<CustomerListPage />);
      
      await waitFor(() => {
        expect(screen.queryByTestId('recover-btn-99')).not.toBeInTheDocument();
      });
    });
  });
});