import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Package, History, AlertTriangle, RefreshCw } from 'lucide-react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';
import { useAuth } from '../../providers/AuthProvider';
import { DefaultTable, SearchBar, DashboardHeader, Button } from '../../components/ui';
import { getProducts, type Product } from '../../services/productService';
import { PriceHistoryModal } from '../../components/products/PriceHistoryModal';

export const ProductCataloguePage: React.FC = () => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  const { role } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: svcError } = await getProducts();
    setProducts(svcError ? [] : (data ?? []));
    setError(svcError);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    let result = products;
    const q = debouncedSearch.trim().toLowerCase();
    if (q) {
      result = result.filter(p => 
        [p.prodcode, p.description, p.unit].join(' ').toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, debouncedSearch]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const formatPrice = (price?: number) => {
    if (price === undefined) return '—';
    return `$${price.toFixed(2)}`;
  };

  return (
    <div style={{ flex: 1, padding: '32px 24px 48px', fontFamily: 'Inter, sans-serif' }}>
      
      <DashboardHeader
        title="Product Catalogue"
        description="Browse all products with current pricing (read-only access)"
        // Even though we provide these, showStatsCard={false} will hide the card
        statsTitle="Total Products"
        totalCount={products.length}
        showStatsCard={false} 
        roleDisplay={role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Unknown'}
        policyDescription="No edit permissions on this module."
        allowedActions={[
          'View Catalogue',
          'View Price History'
        ]}
        actions={
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '9px 16px', borderRadius: '10px',
              border: `1px solid ${C.outlineVariant}55`,
              backgroundColor: 'transparent', color: C.onSurfaceVariant,
              fontSize: '13px', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1, transition: 'all 0.2s',
            }}
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
          </button>
        }
      />

      {/* Extracted Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <SearchBar onSearch={setDebouncedSearch} placeholder="Search products..." />
        {debouncedSearch.trim() && !loading && (
          <span style={{ fontSize: '12px', color: C.onSurfaceVariant, padding: '5px 10px', borderRadius: '7px', backgroundColor: isDark ? `${C.surfaceContainerHigh}88` : `${C.outlineVariant}22` }}>
            {filtered.length} of {products.length} shown
          </span>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{ backgroundColor: `${C.error}15`, border: `1px solid ${C.error}44`, color: C.error, padding: '12px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: 500 }}>
          <AlertTriangle size={16} /> <span>{error}</span>
          <button onClick={() => void load()} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: C.error, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Retry</button>
        </div>
      )}

      {/* Table */}
      <DefaultTable.Container
        pagination={{
          currentPage,
          totalPages: Math.ceil(filtered.length / itemsPerPage),
          totalItems: filtered.length,
          itemsPerPage,
          onPageChange: setCurrentPage,
        }}
      >
        <thead>
          <tr>
            <DefaultTable.Th>Product No</DefaultTable.Th>
            <DefaultTable.Th>Description</DefaultTable.Th>
            <DefaultTable.Th>Unit</DefaultTable.Th>
            <DefaultTable.Th>Current Price</DefaultTable.Th>
            <DefaultTable.Th style={{ textAlign: 'center' }}>History</DefaultTable.Th>
          </tr>
        </thead>
        <tbody>
          {!loading && filtered.length === 0 && (
              <DefaultTable.Tr>
                <DefaultTable.Td colSpan={5} style={{ padding: '64px 32px', textAlign: 'center' }}>
                  <Package size={44} style={{ color: C.outlineVariant, opacity: 0.5, marginBottom: '12px' }} />
                  <p style={{ color: C.onSurfaceVariant, margin: 0 }}>{debouncedSearch ? `No products found for "${debouncedSearch}"` : 'No products available'}</p>
                </DefaultTable.Td>
              </DefaultTable.Tr>
          )}

          {!loading && paginated.map((prod) => (
            <DefaultTable.Tr key={prod.prodcode}>
              <td style={{ padding: '12px 16px', borderBottom: `1px solid ${C.outlineVariant}22` }}>
                <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: C.primary }}>
                  {prod.prodcode}
                </span>
              </td>
              <td style={{ padding: '12px 16px', borderBottom: `1px solid ${C.outlineVariant}22`, fontWeight: 600 }}>
                {prod.description}
              </td>
              <td style={{ padding: '12px 16px', borderBottom: `1px solid ${C.outlineVariant}22` }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '3px 10px', borderRadius: '999px',
                  fontSize: '11px', fontWeight: 700,
                  backgroundColor: isDark ? `${C.surfaceContainerHigh}cc` : '#f5f4ff',
                  color: C.onSurfaceVariant,
                  border: `1px solid ${C.outlineVariant}33`,
                }}>
                  {prod.unit}
                </span>
              </td>
              <td style={{ padding: '12px 16px', borderBottom: `1px solid ${C.outlineVariant}22`, fontWeight: 700, color: '#25cbafff' }}>
                {formatPrice(prod.current_price)}
              </td>
              <td style={{ padding: '12px 16px', borderBottom: `1px solid ${C.outlineVariant}22`, textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Button
                    compact
                    onClick={() => setSelectedProduct(prod)}
                    style={{ width: 'auto', padding: '0 12px', gap: '6px' }}
                  >
                    <History size={14} /> View
                  </Button>
                </div>
              </td>
            </DefaultTable.Tr>
          ))}
        </tbody>
      </DefaultTable.Container>

      {/* Price History Modal Overlay */}
      {selectedProduct && (
        <PriceHistoryModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};