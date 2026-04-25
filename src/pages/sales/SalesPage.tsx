import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CircleDollarSign, Eye, BarChart2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';
import { useAuth } from '../../providers/AuthProvider';
import { useNavigation } from '../../providers/NavigationProvider';
import { DefaultTable, SearchBar, DashboardHeader, Button } from '../../components/ui';
import { getSales, type SaleTransaction } from '../../services/salesService';

export const SalesPage: React.FC = () => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  const { role } = useAuth();
  const { navParams } = useNavigation();

  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCustomerNo, setSelectedCustomerNo] = useState<string>(navParams?.customerNo || 'ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCustomerNo]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: svcError } = await getSales();
    setSales(svcError ? [] : (data ?? []));
    setError(svcError);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const uniqueCustomers = useMemo(() => {
    const map = new Map<string, string>();
    sales.forEach(s => map.set(s.custno, s.customerName));
    return Array.from(map.entries()).map(([custno, name]) => ({ custno, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [sales]);

  const filtered = useMemo(() => {
    let result = sales;
    
    if (selectedCustomerNo !== 'ALL') {
      result = result.filter(s => s.custno === selectedCustomerNo);
    }

    const q = debouncedSearch.trim().toLowerCase();
    if (q) {
      result = result.filter(s => 
        [s.transno, s.employeeName, s.empno, s.customerName, s.custno].join(' ').toLowerCase().includes(q)
      );
    }
    return result;
  }, [sales, debouncedSearch, selectedCustomerNo]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  return (
    <div style={{ flex: 1, padding: '32px 24px 48px', fontFamily: 'Inter, sans-serif' }}>
      
      <DashboardHeader
        title="Sales Transactions"
        description="View customer transaction history (read-only access)"
        statsTitle="Total Transactions"
        totalCount={sales.length}
        roleDisplay={role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Unknown'}
        policyDescription="No edit permissions on this module."
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

      {/* Filters Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px', maxWidth: '400px' }}>
          <SearchBar onSearch={setDebouncedSearch} placeholder="Search by transaction or employee..." />
        </div>
        
        <select
          value={selectedCustomerNo}
          onChange={(e) => setSelectedCustomerNo(e.target.value)}
          style={{
            padding: '11px 16px', borderRadius: '10px',
            backgroundColor: isDark ? C.surfaceContainerHigh : '#fff',
            border: `1px solid ${C.outlineVariant}55`,
            color: C.onSurface, fontSize: '13px', fontWeight: 500,
            outline: 'none', cursor: 'pointer', minWidth: '200px'
          }}
        >
          <option value="ALL">All Categories / Customers</option>
          {uniqueCustomers.map(c => (
            <option key={c.custno} value={c.custno}>{c.name}</option>
          ))}
        </select>

        {debouncedSearch.trim() && !loading && (
          <span style={{ fontSize: '12px', color: C.onSurfaceVariant, padding: '5px 10px', borderRadius: '7px', backgroundColor: isDark ? `${C.surfaceContainerHigh}88` : `${C.outlineVariant}22` }}>
            {filtered.length} of {sales.length} shown
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
            <DefaultTable.Th>Transaction No</DefaultTable.Th>
            <DefaultTable.Th>Customer</DefaultTable.Th>
            <DefaultTable.Th>Date</DefaultTable.Th>
            <DefaultTable.Th>Facilitated By</DefaultTable.Th>
            <DefaultTable.Th>Total</DefaultTable.Th>
            <DefaultTable.Th style={{ textAlign: 'center' }}>Actions</DefaultTable.Th>
          </tr>
        </thead>
        <tbody>
          {!loading && filtered.length === 0 && (
             <DefaultTable.Tr>
               <DefaultTable.Td colSpan={6} style={{ padding: '64px 32px', textAlign: 'center' }}>
                 <CircleDollarSign size={44} style={{ color: C.outlineVariant, opacity: 0.5, marginBottom: '12px' }} />
                 <p style={{ color: C.onSurfaceVariant, margin: 0 }}>{debouncedSearch ? `No sales found for "${debouncedSearch}"` : 'No sales transactions available'}</p>
               </DefaultTable.Td>
             </DefaultTable.Tr>
          )}

          {!loading && paginated.map((sale) => (
            <DefaultTable.Tr key={sale.transno}>
              <DefaultTable.Td style={{ fontWeight: 700 }}>
                {sale.transno}
              </DefaultTable.Td>
              <DefaultTable.Td style={{ fontWeight: 500 }}>{sale.customerName}</DefaultTable.Td>
              <DefaultTable.Td style={{ color: C.onSurfaceVariant }}>{formatDate(sale.salesdate)}</DefaultTable.Td>
              <DefaultTable.Td>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 500, fontSize: '13px' }}>{sale.employeeName}</span>
                  <span style={{ fontSize: '11px', color: C.onSurfaceVariant, opacity: 0.8 }}>{sale.empno}</span>
                </div>
              </DefaultTable.Td>
              <DefaultTable.Td style={{ fontWeight: 800, color: C.onSurface }}>
                {formatCurrency(sale.total)}
              </DefaultTable.Td>
              <DefaultTable.Td style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Button
                    compact
                    onClick={() => {}}
                    style={{ width: 'auto', padding: '0 12px', gap: '6px' }}
                  >
                    <BarChart2 size={14} /> View Analytics
                  </Button>
                </div>
              </DefaultTable.Td>
            </DefaultTable.Tr>
          ))}
        </tbody>
      </DefaultTable.Container>
    </div>
  );
};
