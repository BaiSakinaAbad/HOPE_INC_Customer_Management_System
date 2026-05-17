// Shows dashboard reports including sales, employees, customers, and pending accounts
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  TrendingUp, Users, ShoppingBag, DollarSign, UserCheck,
  RefreshCw, BarChart3, Crown, Package, AlertCircle, Search
} from 'lucide-react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';
import { getSales, type SaleTransaction } from '../../services/salesService';
import { getCustomers, getInactiveCustomerCount } from '../../services/customerService';
import { getEmployees } from '../../services/employeeService';
import { useAuth } from '../../providers/AuthProvider';
import { MiniBarChart } from '../ui/charts/MiniBarChart';
import { MiniLineChart } from '../ui/charts/MiniLineChart';
import type { Employee } from '../../types/employee';
import type { Customer } from '../../types/customer';
//dashboard reports

// ─── Types ───────────────────────────────────────────────────────────────────
interface PendingAccount {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface CustomerSalesSummary {
  custno: string;
  customerName: string;
  transactionCount: number;
  totalRevenue: number;
}

interface ProductRevenue {
  productCode: string;
  description: string;
  totalQuantity: number;
  totalRevenue: number;
}

interface DashboardReportsProps {
  firstName: string;
}

import type { DashboardFilter } from './types';
import { StatCard } from './StatCard';
import { RegisteredCustomersCard } from './RegisteredCustomersCard';
import { TotalTransactionsCard } from './TotalTransactionsCard';
import { ProductsSoldCard } from './ProductsSoldCard';
import { ReportSection } from './ReportSection';
import { BarVisual } from './BarVisual';
import { DashboardSkeleton } from '../ui/Skeletons';

// ─── Helper: Currency Formatter ──────────────────────────────────────────────
const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export const DashboardReports: React.FC<DashboardReportsProps> = ({ firstName }) => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  const { role } = useAuth();

  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [activeCustomers, setActiveCustomers] = useState(0);
  const [inactiveCustomers, setInactiveCustomers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<DashboardFilter>({ type: 'NONE' });
  const [customerStatusMap, setCustomerStatusMap] = useState<Map<string, string>>(new Map());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [salesRes, empRes, custRes, inactiveCount] = await Promise.all([
        getSales(),
        getEmployees(),
        role === 'superadmin' ? getCustomers('superadmin') : Promise.resolve({ data: null, error: null }),
        role === 'superadmin' ? getInactiveCustomerCount('superadmin') : Promise.resolve(0),
      ]);

      if (salesRes.error) throw new Error(salesRes.error);
      setSales(salesRes.data ?? []);

      if (role === 'superadmin') {
        const customersData = custRes.data ?? [];
        const activeCount = customersData.filter((c: Customer) => c.recordstatus === 'ACTIVE').length;
        setActiveCustomers(activeCount);
        setInactiveCustomers(inactiveCount);
        setTotalCustomers(activeCount + inactiveCount);

        const statusMap = new Map<string, string>();
        customersData.forEach((c: Customer) => statusMap.set(c.custno, c.recordstatus));
        setCustomerStatusMap(statusMap);
      }

      const employees = empRes.data ?? [];
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    }
    setLoading(false);
  }, [role]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    const handleGlobalClick = () => setFilter({ type: 'NONE' });
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  const filteredSales = useMemo(() => {
    if (filter.type === 'NONE') return sales;
    if (filter.type === 'CUSTOMER_STATUS') {
      return sales.filter(s => customerStatusMap.get(s.custno) === filter.status);
    }
    if (filter.type === 'CUSTOMER') {
      return sales.filter(s => s.custno === filter.custno);
    }
    if (filter.type === 'PRODUCT') {
      return sales.filter(s => s.details.some(d => d.product_code === filter.code));
    }
    if (filter.type === 'DATE') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return sales.filter(s => {
        const d = new Date(s.salesdate);
        const key = `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
        return key === filter.label;
      });
    }
    return sales;
  }, [sales, filter, customerStatusMap]);

 

  const customerSummary = useMemo<CustomerSalesSummary[]>(() => {
    const map = new Map<string, CustomerSalesSummary>();
    for (const sale of filteredSales) {
      const existing = map.get(sale.custno);
      if (existing) {
        existing.transactionCount += 1;
        existing.totalRevenue += sale.total;
      } else {
        map.set(sale.custno, { custno: sale.custno, customerName: sale.customerName, transactionCount: 1, totalRevenue: sale.total });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [filteredSales]);

  const topCustomers = useMemo(() => customerSummary.slice(0, 5), [customerSummary]);

  const productRevenue = useMemo<ProductRevenue[]>(() => {
    const map = new Map<string, ProductRevenue>();
    for (const sale of filteredSales) {
      for (const detail of sale.details) {
        const existing = map.get(detail.product_code);
        if (existing) {
          existing.totalQuantity += detail.quantity;
          existing.totalRevenue += detail.totalPrice;
        } else {
          map.set(detail.product_code, { productCode: detail.product_code, description: detail.description, totalQuantity: detail.quantity, totalRevenue: detail.totalPrice });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [filteredSales]);

  const topProductsByQuantity = useMemo(() => {
    return [...productRevenue].sort((a, b) => b.totalQuantity - a.totalQuantity);
  }, [productRevenue]);

  const totalRevenue = useMemo(() => filteredSales.reduce((s, t) => s + t.total, 0), [filteredSales]);
  const totalTransactions = filteredSales.length;
  const uniqueProducts = useMemo(() => {
    const codes = new Set<string>();
    filteredSales.forEach(s => s.details.forEach(d => codes.add(d.product_code)));
    return codes.size;
  }, [filteredSales]);

  const salesTrend = useMemo(() => {
    const dataSource = filter.type === 'DATE' ? sales : filteredSales;
    if (!dataSource.length) return [];
    const sorted = [...dataSource].sort((a, b) => new Date(a.salesdate).getTime() - new Date(b.salesdate).getTime());
    const groups: Record<string, number> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    sorted.forEach(s => {
      const d = new Date(s.salesdate);
      const key = `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
      groups[key] = (groups[key] || 0) + s.total;
    });
    return Object.entries(groups).map(([label, value]) => ({ label, value })).slice(-7);
  }, [filteredSales]);

  const thStyle: React.CSSProperties = { padding: '12px 20px', fontSize: '11px', fontWeight: 700, color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: `1px solid ${C.outlineVariant}44` };
  const tdStyle: React.CSSProperties = { padding: '14px 20px', fontSize: '13px', color: C.onSurface };
  const trBorderStyle = `1px solid ${C.outlineVariant}22`;

  // ── Customer Sales Summary pagination & search ──
  const SALES_PAGE_SIZE = 10;
  const [salesPage, setSalesPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce search query to prevent thrashing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page index on filter trigger or search
  useEffect(() => {
    setSalesPage(1);
  }, [filter, debouncedSearchQuery]);

  const filteredCustomerSummary = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return customerSummary;
    const q = debouncedSearchQuery.toLowerCase();
    return customerSummary.filter(c => 
      c.customerName.toLowerCase().includes(q) || 
      c.custno.toLowerCase().includes(q)
    );
  }, [customerSummary, debouncedSearchQuery]);

  const salesTotalPages = Math.ceil(filteredCustomerSummary.length / SALES_PAGE_SIZE);
  const safeSalesPage = salesPage > salesTotalPages ? Math.max(1, salesTotalPages) : salesPage;

  const paginatedSummary = useMemo(() => {
    const start = (safeSalesPage - 1) * SALES_PAGE_SIZE;
    return filteredCustomerSummary.slice(start, start + SALES_PAGE_SIZE);
  }, [filteredCustomerSummary, safeSalesPage]);


  return (
    <div style={{ flex: 1, padding: '32px 24px 64px', fontFamily: "'Inter', sans-serif", maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* ── Header: Welcome + Pending Button + Refresh ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '16px', flexWrap: 'wrap' }}>
        <div onClick={(e) => e.stopPropagation()}>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: C.onSurface, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 8px 0' }}>
            Welcome back, {firstName}
          </h1>
          <p style={{ fontSize: '14px', color: C.onSurfaceVariant, margin: 0 }}>Here's what's happening with your business today.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <button onClick={() => void load()} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: `1px solid ${C.outlineVariant}55`, backgroundColor: 'transparent', color: C.onSurfaceVariant, fontSize: '12px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
            <RefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
          </button>
        </div>
      </div>

      {loading && !error && <DashboardSkeleton />}

      {!loading && !error && (
        <>
          {/* ── Active Filter Banner ── */}
          {filter.type !== 'NONE' && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', marginBottom: '24px', borderRadius: '12px',
              backgroundColor: isDark ? `${C.primary}15` : `${C.primary}10`,
              border: `1px solid ${C.primary}33`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ color: C.primary }}><BarChart3 size={18} /></div>
                <span style={{ fontSize: '13px', color: C.onSurface, fontWeight: 500 }}>
                  Filtering dashboard by:
                  <strong style={{ color: C.primary, marginLeft: '6px' }}>
                    {filter.type === 'CUSTOMER_STATUS' ? `${filter.status} Customers` :
                      filter.type === 'CUSTOMER' ? `Customer: ${filter.name}` :
                        filter.type === 'PRODUCT' ? `Product: ${filter.name}` :
                          `Date: ${filter.label}`}
                  </strong>
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFilter({ type: 'NONE' }); }}
                style={{
                  padding: '6px 12px', borderRadius: '6px', border: `1px solid ${C.outlineVariant}55`,
                  backgroundColor: isDark ? C.surfaceContainer : '#fff', color: C.onSurfaceVariant,
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Clear Filter
              </button>
            </div>
          )}

          {/* ── Stat Cards: 4-col grid, Revenue+Customers stacked col1, Products col2, Transactions col3-4 ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) minmax(180px, 1fr) minmax(400px, 3fr)', gridTemplateRows: 'auto auto', gap: '16px', marginBottom: '28px' }}>
            {/* Col 1, Row 1: Total Revenue */}
            <div style={{ gridColumn: '1', gridRow: '1' }}>
              <StatCard icon={<DollarSign size={22} style={{ color: '#22c55e' }} />} label="Total Revenue" value={fmt(totalRevenue)} accent="#22c55e" isDark={isDark} C={C} />
            </div>
            {/* Col 1, Row 2: Registered Customers (or fallback) */}
            <div style={{ gridColumn: '1', gridRow: '2' }}>
              {role === 'superadmin'
                ? <RegisteredCustomersCard
                  totalCount={totalCustomers} activeCount={activeCustomers}
                  inactiveCount={inactiveCustomers} isDark={isDark} C={C}
                  onFilter={(f) => setFilter(f === 'ALL' ? { type: 'NONE' } : { type: 'CUSTOMER_STATUS', status: f })}
                  currentFilter={filter}
                />
                : <StatCard icon={<Package size={22} style={{ color: '#6366f1' }} />} label="Unique Products" value={uniqueProducts} accent="#6366f1" isDark={isDark} C={C} />
              }
            </div>
            {/* Col 2, spans both rows: Products Sold */}
            <div style={{ gridColumn: '2', gridRow: '1 / 3' }}>
              <ProductsSoldCard totalCount={uniqueProducts} topProducts={topProductsByQuantity} isDark={isDark} C={C} onFilter={(code, name) => setFilter({ type: 'PRODUCT', code, name })} currentFilter={filter} />
            </div>
            {/* Col 3 (double-width), spans both rows: Total Transactions */}
            <div style={{ gridColumn: '3', gridRow: '1 / 3' }}>
              <TotalTransactionsCard totalCount={totalTransactions} points={salesTrend} isDark={isDark} C={C} onFilter={(label) => setFilter({ type: 'DATE', label })} currentFilter={filter} />
            </div>
          </div>

          {/* ── Main report content ── */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '28px' }}>
              <ReportSection title={`Top ${topCustomers.length} Customer${topCustomers.length === 1 ? '' : 's'}`} icon={<Crown size={16} style={{ color: '#f59e0b' }} />} C={C} isDark={isDark}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: isDark ? `${C.surfaceContainer}88` : '#f9f9fc' }}>
                    <tr>
                      <th style={{ ...thStyle, width: '30px' }}>#</th>
                      <th style={thStyle}>Customer</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Transactions</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCustomers.map((c, i) => (
                      <tr
                        key={c.custno}
                        onClick={(e) => { e.stopPropagation(); setFilter({ type: 'CUSTOMER', custno: c.custno, name: c.customerName }); }}
                        style={{
                          borderBottom: i < topCustomers.length - 1 ? trBorderStyle : 'none',
                          cursor: 'pointer',
                          backgroundColor: filter.type === 'CUSTOMER' && filter.custno === c.custno ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)') : 'transparent'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = filter.type === 'CUSTOMER' && filter.custno === c.custno ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)') : 'transparent'}
                      >
                        <td style={{ ...tdStyle, fontWeight: 800, color: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#b45309' : C.onSurfaceVariant }}>{i + 1}</td>
                        <td style={tdStyle}><div style={{ fontWeight: 600 }}>{c.customerName}</div><div style={{ fontSize: '11px', color: C.onSurfaceVariant, fontFamily: 'monospace' }}>{c.custno}</div></td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>{c.transactionCount}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: '#22c55e' }}>{fmt(c.totalRevenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ReportSection>

            </div>

            {/* ── Customer Sales Summary with pagination ── */}
            <ReportSection title="Customer Sales Summary" icon={<BarChart3 size={16} style={{ color: C.primary }} />} C={C} isDark={isDark}>
              {/* Search Bar Wrapper Row */}
              <div style={{ padding: '0 24px 16px 24px', display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{
                  position: 'relative', width: '300px',
                  display: 'flex', alignItems: 'center'
                }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', color: C.onSurfaceVariant }} />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '8px',
                      border: `1px solid ${isDark ? '#1e293b' : C.outlineVariant}`, // slate-800
                      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#ffffff', // slate-900/50
                      color: C.onSurface,
                      fontSize: '13px',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = C.primary}
                    onBlur={(e) => e.target.style.borderColor = isDark ? '#1e293b' : C.outlineVariant}
                  />
                </div>
              </div>

              <div onClick={(e) => e.stopPropagation()} style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: isDark ? `${C.surfaceContainer}88` : '#f9f9fc' }}>
                    <tr>
                      <th style={thStyle}>Customer No</th>
                      <th style={thStyle}>Customer Name</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Transactions</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Total Revenue</th>
                      <th style={{ ...thStyle, width: '200px' }}>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSummary.map((c, i) => (
                      <tr
                        key={c.custno}
                        onClick={(e) => { e.stopPropagation(); setFilter({ type: 'CUSTOMER', custno: c.custno, name: c.customerName }); }}
                        style={{
                          borderBottom: i < paginatedSummary.length - 1 ? trBorderStyle : 'none',
                          cursor: 'pointer',
                          backgroundColor: filter.type === 'CUSTOMER' && filter.custno === c.custno ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)') : 'transparent'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = filter.type === 'CUSTOMER' && filter.custno === c.custno ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)') : 'transparent'}
                      >
                        <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 700, color: C.primary }}>{c.custno}</td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{c.customerName}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>{c.transactionCount}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: '#22c55e' }}>{fmt(c.totalRevenue)}</td>
                        <td style={{ ...tdStyle, paddingRight: '24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <BarVisual value={c.totalRevenue} max={totalRevenue} color={C.primary} />
                            <span style={{ fontSize: '11px', fontWeight: 600, color: C.onSurfaceVariant, minWidth: '40px', textAlign: 'right' }}>{totalRevenue > 0 ? `${((c.totalRevenue / totalRevenue) * 100).toFixed(1)}%` : '0%'}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* ── Pagination Controls ── */}
              {salesTotalPages > 1 && (
                <div onClick={(e) => e.stopPropagation()} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 24px', borderTop: `1px solid ${C.outlineVariant}33`,
                }}>
                  <span style={{ fontSize: '12px', color: C.onSurfaceVariant, fontWeight: 500 }}>
                    Showing {((safeSalesPage - 1) * SALES_PAGE_SIZE) + 1}–{Math.min(safeSalesPage * SALES_PAGE_SIZE, filteredCustomerSummary.length)} of {filteredCustomerSummary.length}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => setSalesPage(p => Math.max(1, p - 1))}
                      disabled={safeSalesPage <= 1}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '32px', height: '32px', borderRadius: '8px',
                        border: `1px solid ${C.outlineVariant}44`, backgroundColor: 'transparent',
                        color: safeSalesPage <= 1 ? `${C.onSurfaceVariant}44` : C.onSurfaceVariant,
                        cursor: safeSalesPage <= 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: salesTotalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setSalesPage(page)}
                        style={{
                          minWidth: '32px', height: '32px', borderRadius: '8px',
                          border: page === safeSalesPage ? `1px solid ${C.primary}` : `1px solid ${C.outlineVariant}44`,
                          backgroundColor: page === safeSalesPage ? `${C.primary}18` : 'transparent',
                          color: page === safeSalesPage ? C.primary : C.onSurfaceVariant,
                          fontSize: '12px', fontWeight: page === safeSalesPage ? 700 : 500,
                          cursor: 'pointer', padding: '0 6px',
                        }}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setSalesPage(p => Math.min(salesTotalPages, p + 1))}
                      disabled={safeSalesPage >= salesTotalPages}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '32px', height: '32px', borderRadius: '8px',
                        border: `1px solid ${C.outlineVariant}44`, backgroundColor: 'transparent',
                        color: safeSalesPage >= salesTotalPages ? `${C.onSurfaceVariant}44` : C.onSurfaceVariant,
                        cursor: safeSalesPage >= salesTotalPages ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </ReportSection>
          </div>
        </>
      )}
    </div>
  );
};