import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import ProductCataloguePage from '../components/pages/ProductCataloguePage';
// import SalesPage from '../components/pages/SalesPage';
// import SalesDetailPage from '../components/pages/SalesDetailPage'; // ADD THIS
// import PriceHistoryPage from '../components/pages/PriceHistoryPage';

vi.mock('../hooks/useRights', () => ({
  useRights: vi.fn(),
}));
import { useRights } from '../hooks/useRights';

describe('View-Only Enforcement (Sales, Products, PriceHist)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Testing as SUPERADMIN (The "End Boss"). 
    // If the person with the most power has NO buttons, the code is secure.
    vi.mocked(useRights).mockReturnValue({
      user_type: 'SUPERADMIN',
      rights: { CUST_ADD: 1, CUST_EDIT: 1, CUST_DEL: 1, ADM_USER: 1 } 
    });
  });

  it('ProductCataloguePage renders ZERO add/edit/delete/create buttons', () => {
    render(<ProductCataloguePage />);
    const actionButtons = screen.queryAllByRole('button', { name: /add|edit|delete|update|create/i });
    expect(actionButtons).toHaveLength(0);
  });

  /* M2/M4: UNCOMMENT THESE AS YOU BUILD THE PAGES!
  
  it('SalesPage renders ZERO add/edit/delete/create buttons', () => {
    render(<SalesPage />);
    const actionButtons = screen.queryAllByRole('button', { name: /add|edit|delete|update|create/i });
    expect(actionButtons).toHaveLength(0);
  });

  it('SalesDetailPage renders ZERO add/edit/delete/create buttons', () => {
    render(<SalesDetailPage />);
    const actionButtons = screen.queryAllByRole('button', { name: /add|edit|delete|update|create/i });
    expect(actionButtons).toHaveLength(0);
  });

  it('PriceHistoryPage renders ZERO add/edit/delete/create buttons', () => {
    render(<PriceHistoryPage />);
    const actionButtons = screen.queryAllByRole('button', { name: /add|edit|delete|update|create/i });
    expect(actionButtons).toHaveLength(0);
  });
  */
});