import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
// Placeholders for M2's UI components
import CustomerListPage from '../components/pages/CustomerListPage';
import AppShell from '../components/shells/AppShell';

// Mock M4's hook before the tests run
vi.mock('../hooks/useRights', () => ({
  useRights: vi.fn(),
}));
import { useRights } from '../hooks/useRights';

describe('Rights Matrix (27 Cases - UI Gating)', () => {
  // 1. THE WHITEBOARD ERASER (Prevents test leaks!)
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Role: USER', () => {
    beforeEach(() => {
      vi.mocked(useRights).mockReturnValue({
        user_type: 'USER',
        rights: { CUST_ADD: 0, CUST_EDIT: 0, CUST_DEL: 0, ADM_USER: 0 }
      });
    });

    it('hides Add, Edit, and Delete buttons', () => {
      render(<CustomerListPage />);
      expect(screen.queryByTestId('add-customer-btn')).not.toBeInTheDocument();
      expect(screen.queryByTestId('edit-customer-btn')).not.toBeInTheDocument();
      expect(screen.queryByTestId('delete-customer-btn')).not.toBeInTheDocument();
    });

    it('hides Stamp column', () => {
      render(<CustomerListPage />);
      expect(screen.queryByTestId('stamp-column')).not.toBeInTheDocument();
    });

    it('hides Deleted Customers sidebar link', () => {
      render(<AppShell />);
      expect(screen.queryByTestId('nav-deleted-customers')).not.toBeInTheDocument();
    });
  });

  describe('Role: ADMIN', () => {
    beforeEach(() => {
      vi.mocked(useRights).mockReturnValue({
        user_type: 'ADMIN',
        // CRITICAL: Admin has CUST_DEL = 0
        rights: { CUST_ADD: 1, CUST_EDIT: 1, CUST_DEL: 0, ADM_USER: 1 } 
      });
    });

    it('shows Add and Edit buttons, but HIDES Delete button', () => {
      render(<CustomerListPage />);
      expect(screen.getByTestId('add-customer-btn')).toBeInTheDocument();
      expect(screen.getByTestId('edit-customer-btn')).toBeInTheDocument();
      // Admin cannot soft-delete!
      expect(screen.queryByTestId('delete-customer-btn')).not.toBeInTheDocument(); 
    });

    it('shows Stamp column', () => {
      render(<CustomerListPage />);
      expect(screen.getByTestId('stamp-column')).toBeInTheDocument();
    });

    it('shows Deleted Customers sidebar link', () => {
      render(<AppShell />);
      expect(screen.getByTestId('nav-deleted-customers')).toBeInTheDocument();
    });
  });

  describe('Role: SUPERADMIN', () => {
    beforeEach(() => {
      vi.mocked(useRights).mockReturnValue({
        user_type: 'SUPERADMIN',
        // SUPERADMIN has all 1s
        rights: { CUST_ADD: 1, CUST_EDIT: 1, CUST_DEL: 1, ADM_USER: 1 } 
      });
    });

    it('shows Add, Edit, and Delete buttons', () => {
      render(<CustomerListPage />);
      expect(screen.getByTestId('add-customer-btn')).toBeInTheDocument();
      expect(screen.getByTestId('edit-customer-btn')).toBeInTheDocument();
      expect(screen.getByTestId('delete-customer-btn')).toBeInTheDocument();
    });

    it('shows Stamp column', () => {
      render(<CustomerListPage />);
      expect(screen.getByTestId('stamp-column')).toBeInTheDocument();
    });

    it('shows Deleted Customers sidebar link', () => {
      render(<AppShell />);
      expect(screen.getByTestId('nav-deleted-customers')).toBeInTheDocument();
    });
  });
});