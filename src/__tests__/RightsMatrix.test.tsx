import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../lib/supabase';
import { CustomerListPage } from '../pages/customers/CustomerListPage';
import { DashboardLayout as AppShell } from '../layouts/DashboardLayout';

vi.mock('../hooks/useRights', () => ({ useRights: vi.fn() }));
vi.mock('../providers/AuthProvider', () => ({ useAuth: vi.fn() }));

import { useRights } from '../hooks/useRights';
import { useAuth } from '../providers/AuthProvider';

// ─── Role helpers ─────────────────────────────────────────────────────────────
const mockAsUser = () => {
  vi.mocked(useAuth).mockReturnValue({ role: 'user', user: null, session: null, recordstatus: null, loading: false, signOut: async () => {} });
  vi.mocked(useRights).mockReturnValue({ canViewStamp: false });
};

const mockAsAdmin = () => {
  vi.mocked(useAuth).mockReturnValue({ role: 'admin', user: null, session: null, recordstatus: null, loading: false, signOut: async () => {} });
  vi.mocked(useRights).mockReturnValue({ canViewStamp: true });
};

const mockAsSuperAdmin = () => {
  vi.mocked(useAuth).mockReturnValue({ role: 'superadmin', user: null, session: null, recordstatus: null, loading: false, signOut: async () => {} });
  vi.mocked(useRights).mockReturnValue({ canViewStamp: true });
};

// ─── Supabase stub: empty (for header/stamp/sidebar tests) ────────────────────
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

// ─── Supabase stub: one ACTIVE row (so CustomerRow actually renders) ──────────
const stubSupabaseOneRow = () => {
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [{ custno: 'C0001', custname: 'Test Customer', address: 'Test Address', payterm: 'COD', recordstatus: 'ACTIVE', stamp: null }],
          error: null,
        }),
        then: (resolve: (v: unknown) => void) => resolve({ count: 0, data: null, error: null }),
      }),
    }),
  } as any);
};

// ─────────────────────────────────────────────────────────────────────────────

describe('Rights Matrix (27 Cases - UI Gating)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubSupabaseEmpty();
  });

  // ─── Role: USER ──────────────────────────────────────────────────────────────
  describe('Role: USER', () => {
    beforeEach(() => mockAsUser());

    it('hides Add Customer button', () => {
      render(<CustomerListPage />);
      expect(screen.queryByTestId('add-customer-btn')).not.toBeInTheDocument();
    });

    it('hides Edit Customer button', async () => {
      stubSupabaseOneRow();
      render(<CustomerListPage />);
      await screen.findByText('Test Customer');
      expect(screen.queryByTestId('edit-customer-btn')).not.toBeInTheDocument();
    });

    it('hides Delete Customer button', async () => {
      stubSupabaseOneRow();
      render(<CustomerListPage />);
      await screen.findByText('Test Customer');
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

  // ─── Role: ADMIN ─────────────────────────────────────────────────────────────
  describe('Role: ADMIN', () => {
    beforeEach(() => mockAsAdmin());

    it('shows Add Customer button', () => {
      render(<CustomerListPage />);
      expect(screen.getByTestId('add-customer-btn')).toBeInTheDocument();
    });

    it('shows Edit Customer button', async () => {
      stubSupabaseOneRow();
      render(<CustomerListPage />);
      await screen.findByText('Test Customer');
      expect(screen.getByTestId('edit-customer-btn')).toBeInTheDocument();
    });

    it('hides Delete Customer button (ADMIN cannot soft-delete)', async () => {
      stubSupabaseOneRow();
      render(<CustomerListPage />);
      await screen.findByText('Test Customer');
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

  // ─── Role: SUPERADMIN ────────────────────────────────────────────────────────
  describe('Role: SUPERADMIN', () => {
    beforeEach(() => mockAsSuperAdmin());

    it('shows Add Customer button', () => {
      render(<CustomerListPage />);
      expect(screen.getByTestId('add-customer-btn')).toBeInTheDocument();
    });

    it('shows Edit Customer button', async () => {
      stubSupabaseOneRow();
      render(<CustomerListPage />);
      await screen.findByText('Test Customer');
      expect(screen.getByTestId('edit-customer-btn')).toBeInTheDocument();
    });

    it('shows Delete Customer button (SUPERADMIN only)', async () => {
      stubSupabaseOneRow();
      render(<CustomerListPage />);
      await screen.findByText('Test Customer');
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