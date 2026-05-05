import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductCataloguePage } from '../pages/products/ProductCataloguePage';

vi.mock('../hooks/useRights', () => ({ useRights: vi.fn() }));
vi.mock('../providers/AuthProvider', () => ({ useAuth: vi.fn() }));

vi.mock('../services/productService', () => ({
  getProducts: vi.fn().mockResolvedValue({ data: [], error: null }),
}));

import { useRights } from '../hooks/useRights';
import { useAuth } from '../providers/AuthProvider';

const mockAsSuperAdmin = () => {
  vi.mocked(useAuth).mockReturnValue({ role: 'superadmin', user: null, session: null, recordstatus: null, loading: false, signOut: async () => {} });
  vi.mocked(useRights).mockReturnValue({ canViewStamp: true });
};

const mockAsAdmin = () => {
  vi.mocked(useAuth).mockReturnValue({ role: 'admin', user: null, session: null, recordstatus: null, loading: false, signOut: async () => {} });
  vi.mocked(useRights).mockReturnValue({ canViewStamp: true });
};

const mockAsUser = () => {
  vi.mocked(useAuth).mockReturnValue({ role: 'user', user: null, session: null, recordstatus: null, loading: false, signOut: async () => {} });
  vi.mocked(useRights).mockReturnValue({ canViewStamp: false });
};

describe('View-Only Enforcement (Sales, Products, PriceHist)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ProductCataloguePage renders ZERO add/edit/delete/create buttons for SUPERADMIN', async () => {
    mockAsSuperAdmin();
    render(<ProductCataloguePage />);
    await screen.findByText('Product Catalogue');
    const actionButtons = screen.queryAllByRole('button', { name: /add|edit|delete|update|create/i });
    expect(actionButtons).toHaveLength(0);
  });

  it('ProductCataloguePage renders ZERO add/edit/delete/create buttons for ADMIN', async () => {
    mockAsAdmin();
    render(<ProductCataloguePage />);
    await screen.findByText('Product Catalogue');
    const actionButtons = screen.queryAllByRole('button', { name: /add|edit|delete|update|create/i });
    expect(actionButtons).toHaveLength(0);
  });

  it('ProductCataloguePage renders ZERO add/edit/delete/create buttons for USER', async () => {
    mockAsUser();
    render(<ProductCataloguePage />);
    await screen.findByText('Product Catalogue');
    const actionButtons = screen.queryAllByRole('button', { name: /add|edit|delete|update|create/i });
    expect(actionButtons).toHaveLength(0);
  });

  /* M2/M4: UNCOMMENT THESE AS YOU BUILD THE PAGES!

  it('SalesPage renders ZERO add/edit/delete/create buttons', async () => {
    mockAsSuperAdmin();
    render(<SalesPage />);
    await screen.findByText('Sales');
    const actionButtons = screen.queryAllByRole('button', { name: /add|edit|delete|update|create/i });
    expect(actionButtons).toHaveLength(0);
  });

  it('SalesDetailPage renders ZERO add/edit/delete/create buttons', async () => {
    mockAsSuperAdmin();
    render(<SalesDetailPage />);
    await screen.findByText('Sales Detail');
    const actionButtons = screen.queryAllByRole('button', { name: /add|edit|delete|update|create/i });
    expect(actionButtons).toHaveLength(0);
  });

  it('PriceHistoryPage renders ZERO add/edit/delete/create buttons', async () => {
    mockAsSuperAdmin();
    render(<PriceHistoryPage />);
    await screen.findByText('Price History');
    const actionButtons = screen.queryAllByRole('button', { name: /add|edit|delete|update|create/i });
    expect(actionButtons).toHaveLength(0);
  });
  */
});