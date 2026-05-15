// Shows dashboard reports including sales, employees, customers, and pending accounts
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  TrendingUp, Users, ShoppingBag, DollarSign,
  RefreshCw, BarChart3, Crown, Package
} from 'lucide-react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';
import { getSales, type SaleTransaction } from '../../services/salesService';
import { getCustomers, getInactiveCustomerCount } from '../../services/customerService';
import { useAuth } from '../../providers/AuthProvider';
import { useNavigation } from '../../providers/NavigationProvider';
import { MiniBarChart } from '../ui/charts/MiniBarChart';
import { MiniLineChart } from '../ui/charts/MiniLineChart';
//dashboard reports

// ─── Types ───────────────────────────────────────────────────────────────────
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

type DashboardFilter = 
  | { type: 'NONE' }
  | { type: 'CUSTOMER_STATUS', status: 'ACTIVE' | 'INACTIVE' }
  | { type: 'CUSTOMER', custno: string, name: string }
  | { type: 'PRODUCT', code: string, name: string }
  | { type: 'DATE', label: string };

// ─── Helper: Currency Formatter ──────────────────────────────────────────────
const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

// ─── Stat Card (tall style matching other cards) ─────────────────────────────
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: string;
  isDark: boolean;
  C: ReturnType<typeof getDashboardTokens>;
}> = ({ icon, label, value, accent, isDark, C }) => (
  <div style={{
    backgroundColor: isDark ? 'rgb(13, 24, 52)' : '#ffffff',
    borderRadius: '16px', padding: '20px',
    border: isDark ? '1px solid rgba(255,255,255,0.03)' : `1px solid ${C.outlineVariant}33`,
    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.02)',
    display: 'flex', flexDirection: 'column',
    minHeight: '140px',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
      <div style={{ color: accent }}>{icon}</div>
      <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: accent }}>
        {label}
      </span>
    </div>
    <span style={{ fontSize: '12px', color: isDark ? '#8b94a5' : C.onSurfaceVariant, marginBottom: '4px', fontWeight: 500 }}>
      All-time Total
    </span>
    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '28px', fontWeight: 700, color: isDark ? accent : '#1a1a2e', lineHeight: 1 }}>
      {value}
    </span>
  </div>
);

// ─── Registered Customers Card ────────────────────────────────────────────────
const RegisteredCustomersCard: React.FC<{
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  isDark: boolean;
  C: ReturnType<typeof getDashboardTokens>;
  onFilter: (filter: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
  currentFilter: DashboardFilter;
}> = ({ totalCount, activeCount, inactiveCount, isDark, C, onFilter, currentFilter }) => {
  const [hoverArea, setHoverArea] = useState<'CARD' | 'ACTIVE' | 'INACTIVE' | null>(null);
  
  const isStatusFilter = currentFilter.type === 'CUSTOMER_STATUS';
  const isActiveSelected = isStatusFilter && currentFilter.status === 'ACTIVE';
  const isInactiveSelected = isStatusFilter && currentFilter.status === 'INACTIVE';

  return (
    <div 
      onClick={(e) => { e.stopPropagation(); onFilter('ALL'); }}
      onMouseEnter={() => setHoverArea('CARD')}
      onMouseLeave={() => setHoverArea(null)}
      style={{
        flex: '1 1 260px',
        backgroundColor: isDark ? 'rgb(13, 24, 52)' : '#ffffff',
        borderRadius: '16px', padding: '20px',
        border: isDark ? '1px solid rgba(255,255,255,0.03)' : `1px solid ${C.outlineVariant}33`,
        boxShadow: hoverArea === 'CARD' 
          ? (isDark ? '0 8px 32px rgba(0,0,0,0.6)' : '0 8px 24px rgba(0,0,0,0.08)') 
          : (isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.02)'),
        display: 'flex', flexDirection: 'column',
        minHeight: '140px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: hoverArea === 'CARD' ? 'translateY(-2px)' : 'none'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ color: '#8b5cf6' }}>
          <Users size={18} />
        </div>
        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8b5cf6' }}>
          REGISTERED CUSTOMERS
        </span>
      </div>
      <span style={{ fontSize: '12px', color: isDark ? '#8b94a5' : C.onSurfaceVariant, marginBottom: '4px', fontWeight: 500 }}>
        Customer Total
      </span>
      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '28px', fontWeight: 700, color: isDark ? '#8b5cf6' : '#1a1a2e', lineHeight: 1 }}>
        {totalCount.toLocaleString()}
      </span>
      <div style={{ display: 'flex', gap: '16px', marginTop: 'auto', paddingTop: '10px' }}>
        <div 
          onClick={(e) => { e.stopPropagation(); onFilter('ACTIVE'); }}
          onMouseEnter={(e) => { e.stopPropagation(); setHoverArea('ACTIVE'); }}
          onMouseLeave={(e) => { e.stopPropagation(); setHoverArea('CARD'); }}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '6px', 
            cursor: 'pointer',
            padding: '4px 8px', borderRadius: '6px', marginLeft: '-8px',
            backgroundColor: (hoverArea === 'ACTIVE' || isActiveSelected) ? (isDark ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.08)') : 'transparent',
            transition: 'background-color 0.2s ease',
            border: isActiveSelected ? `1px solid rgba(34,197,94,0.3)` : '1px solid transparent'
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
          <span style={{ fontSize: '11px', color: isDark ? '#8b94a5' : C.onSurfaceVariant, fontWeight: 500 }}>Active</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#22c55e' }}>{activeCount}</span>
        </div>
        <div 
          onClick={(e) => { e.stopPropagation(); onFilter('INACTIVE'); }}
          onMouseEnter={(e) => { e.stopPropagation(); setHoverArea('INACTIVE'); }}
          onMouseLeave={(e) => { e.stopPropagation(); setHoverArea('CARD'); }}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '6px', 
            cursor: 'pointer',
            padding: '4px 8px', borderRadius: '6px', marginLeft: '-4px',
            backgroundColor: (hoverArea === 'INACTIVE' || isInactiveSelected) ? (isDark ? 'rgba(255,95,116,0.1)' : 'rgba(255,95,116,0.08)') : 'transparent',
            transition: 'background-color 0.2s ease',
            border: isInactiveSelected ? `1px solid rgba(255,95,116,0.3)` : '1px solid transparent'
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff5f74' }} />
          <span style={{ fontSize: '11px', color: isDark ? '#8b94a5' : C.onSurfaceVariant, fontWeight: 500 }}>Inactive</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#ff5f74' }}>{inactiveCount}</span>
        </div>
      </div>
    </div>
  );
};

// ─── Total Transactions Card ──────────────────────────────────────────────────
const TotalTransactionsCard: React.FC<{
  totalCount: number;
  points: { label: string; value: number }[];
  isDark: boolean;
  C: ReturnType<typeof getDashboardTokens>;
  onFilter: (dateLabel: string) => void;
  currentFilter: DashboardFilter;
}> = ({ totalCount, points, isDark, C, onFilter, currentFilter }) => {
  const selectedIndex = currentFilter.type === 'DATE' 
    ? points.findIndex(p => p.label === currentFilter.label) 
    : null;

  return (
  <div style={{
    flex: '1 1 260px',
    backgroundColor: isDark ? 'rgb(13, 24, 52)' : '#ffffff',
    borderRadius: '16px', padding: '20px',
    border: isDark ? '1px solid rgba(255,255,255,0.03)' : `1px solid ${C.outlineVariant}33`,
    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.02)',
    display: 'flex', flexDirection: 'column',
    minHeight: '140px'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
       <div style={{ color: C.primary }}>
         <TrendingUp size={18} />
       </div>
       <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.primary }}>
         TOTAL TRANSACTIONS
       </span>
    </div>
    <span style={{ fontSize: '12px', color: isDark ? '#8b94a5' : C.onSurfaceVariant, marginBottom: '4px', fontWeight: 500 }}>
      All-time Transactions
    </span>
    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '28px', fontWeight: 700, color: isDark ? C.primary : '#1a1a2e', lineHeight: 1 }}>
      {totalCount.toLocaleString()}
    </span>
    <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
      <MiniLineChart 
        isDark={isDark} 
        color={C.primary} 
        points={points} 
        onPointClick={(i) => onFilter(points[i].label)} 
        selectedIndex={selectedIndex === -1 ? null : selectedIndex} 
      />
    </div>
  </div>
  );
};

// ─── Products Sold Card (horizontal bars with labels on top) ─────────────────
const ProductsSoldCard: React.FC<{
  totalCount: number;
  topProducts: { productCode: string; description: string; totalQuantity: number }[];
  isDark: boolean;
  C: ReturnType<typeof getDashboardTokens>;
  onFilter: (code: string, name: string) => void;
  currentFilter: DashboardFilter;
}> = ({ totalCount, topProducts, isDark, C, onFilter, currentFilter }) => {
  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#ec4899'];
  const maxQty = Math.max(...topProducts.map(p => p.totalQuantity), 1);

  return (
    <div style={{
      backgroundColor: isDark ? 'rgb(13, 24, 52)' : '#ffffff',
      borderRadius: '16px', padding: '20px',
      border: isDark ? '1px solid rgba(255,255,255,0.03)' : `1px solid ${C.outlineVariant}33`,
      boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.02)',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ color: '#f59e0b' }}><ShoppingBag size={18} /></div>
        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f59e0b' }}>PRODUCTS SOLD</span>
      </div>
      <span style={{ fontSize: '12px', color: isDark ? '#8b94a5' : C.onSurfaceVariant, marginBottom: '4px', fontWeight: 500 }}>Unique Products Total</span>
      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '28px', fontWeight: 700, color: isDark ? '#fbbf24' : '#1a1a2e', lineHeight: 1, marginBottom: '12px' }}>{totalCount.toLocaleString()}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
        {topProducts.map((p, i) => {
          const isSelected = currentFilter.type === 'PRODUCT' && currentFilter.code === p.productCode;
          return (
          <div 
            key={p.description} 
            onClick={(e) => { e.stopPropagation(); onFilter(p.productCode, p.description); }}
            style={{ 
              cursor: 'pointer', transition: 'all 0.2s', 
              opacity: (currentFilter.type === 'PRODUCT' && !isSelected) ? 0.4 : 0.9,
              padding: '8px', borderRadius: '8px',
              backgroundColor: isSelected ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)') : 'transparent'
            }}
            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.opacity = '1'; e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'; }}
            onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.opacity = (currentFilter.type === 'PRODUCT') ? '0.4' : '0.9'; e.currentTarget.style.backgroundColor = 'transparent'; } }}
          >
            <div style={{ fontSize: '10px', fontWeight: 600, color: isDark ? '#8b94a5' : C.onSurfaceVariant, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p.description.length > 25 ? p.description.substring(0, 25) + '...' : p.description}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1, height: '18px', borderRadius: '9px', backgroundColor: `${colors[i % colors.length]}15`, overflow: 'hidden' }}>
                <div style={{ width: `${(p.totalQuantity / maxQty) * 100}%`, height: '100%', borderRadius: '4px', backgroundColor: colors[i % colors.length], transition: 'width 0.6s ease' }} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: colors[i % colors.length], minWidth: '28px', textAlign: 'right' }}>{p.totalQuantity}</span>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};
// comment
// ─── Shared Components ────────────────────────────────────────────────────────
const ReportSection: React.FC<{
  title: string; icon: React.ReactNode; children: React.ReactNode; 
  C: ReturnType<typeof getDashboardTokens>; isDark: boolean;
}> = ({ title, icon, children, C, isDark }) => (
  <div style={{ borderRadius: '16px', backgroundColor: isDark ? C.surfaceContainerHigh : '#fff', border: `1px solid ${C.outlineVariant}44`, overflow: 'hidden' }}>
    <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.outlineVariant}33`, display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: `${C.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: C.onSurface }}>{title}</h3>
    </div>
    <div>{children}</div>
  </div>
);

const BarVisual: React.FC<{ value: number; max: number; color: string }> = ({ value, max, color }) => (
  <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: `${color}15`, overflow: 'hidden' }}>
    <div style={{ width: `${max > 0 ? (value / max) * 100 : 0}%`, height: '100%', borderRadius: '4px', backgroundColor: color, transition: 'width 0.6s ease' }} />
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export const DashboardReports: React.FC<DashboardReportsProps> = ({ firstName }) => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  const { role } = useAuth();
  const { navigate } = useNavigation();

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
      const [salesRes, custRes, inactiveCount] = await Promise.all([
        getSales(),
        role === 'superadmin' ? getCustomers('superadmin') : Promise.resolve({ data: null, error: null }),
        role === 'superadmin' ? getInactiveCustomerCount('superadmin') : Promise.resolve(0),
      ]);

      if (salesRes.error) throw new Error(salesRes.error);
      setSales(salesRes.data ?? []);

      if (role === 'superadmin') {
        const customersData = custRes.data ?? [];
        const activeCount = customersData.filter((c: any) => c.recordstatus === 'ACTIVE').length;
        setActiveCustomers(activeCount);
        setInactiveCustomers(inactiveCount);
        setTotalCustomers(activeCount + inactiveCount);
        
        const statusMap = new Map<string, string>();
        customersData.forEach((c: any) => statusMap.set(c.custno, c.recordstatus));
        setCustomerStatusMap(statusMap);
      }


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
      return sales.filter(s => {
        const d = new Date(s.salesdate);
        return `${d.getMonth() + 1}/${d.getDate()}` === filter.label;
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
    return [...productRevenue].sort((a, b) => b.totalQuantity - a.totalQuantity).slice(0, 3);
  }, [productRevenue]);

  const totalRevenue = useMemo(() => filteredSales.reduce((s, t) => s + t.total, 0), [filteredSales]);
  const totalTransactions = filteredSales.length;
  const uniqueProducts = useMemo(() => {
    const codes = new Set<string>();
    filteredSales.forEach(s => s.details.forEach(d => codes.add(d.product_code)));
    return codes.size;
  }, [filteredSales]);

  const salesTrend = useMemo(() => {
    if (!filteredSales.length) return [];
    const sorted = [...filteredSales].sort((a, b) => new Date(a.salesdate).getTime() - new Date(b.salesdate).getTime());
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

  // ── Customer Sales Summary pagination ──
  const SALES_PAGE_SIZE = 10;
  const [salesPage, setSalesPage] = useState(1);
  const salesTotalPages = Math.ceil(customerSummary.length / SALES_PAGE_SIZE);
  const paginatedSummary = useMemo(() => {
    const start = (salesPage - 1) * SALES_PAGE_SIZE;
    return customerSummary.slice(start, start + SALES_PAGE_SIZE);
  }, [customerSummary, salesPage]);

  // Reset to page 1 when data changes
  useEffect(() => { setSalesPage(1); }, [customerSummary.length]);



  return (
    <div 
      onClick={() => setFilter({ type: 'NONE' })}
      style={{ flex: 1, padding: '32px 24px 64px', fontFamily: "'Inter', sans-serif", maxWidth: '1400px', margin: '0 auto', width: '100%' }}
    >
      {/* ── Header: Welcome + Pending Button + Refresh ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '16px', flexWrap: 'wrap' }}>
        <div onClick={(e) => e.stopPropagation()}>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: C.onSurface, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 8px 0' }}>
            Welcome back, {firstName}
          </h1>
          <p style={{ fontSize: '14px', color: C.onSurfaceVariant, margin: 0 }}>Here's what's happening with your business today.</p>
        </div>
        <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {hasPending && (
            <button onClick={(e) => { e.stopPropagation(); setPendingOverlayOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', border: 'none', backgroundColor: '#f59e0b', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(245,158,11,0.35)', transition: 'transform 0.15s, box-shadow 0.15s' }}>
              <UserCheck size={14} />
              <span>Pending Activation</span>
              <span style={{ backgroundColor: '#fff', color: '#d97706', fontSize: '11px', fontWeight: 800, padding: '1px 7px', borderRadius: '99px', minWidth: '20px', textAlign: 'center' }}>{pendingAccounts.length}</span>
            </button>
          )}
          <button onClick={() => void load()} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: `1px solid ${C.outlineVariant}55`, backgroundColor: 'transparent', color: C.onSurfaceVariant, fontSize: '12px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
            <RefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
          </button>
        </div>
      </div>

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
                <ReportSection title="Top 5 Customers" icon={<Crown size={16} style={{ color: '#f59e0b' }} />} C={C} isDark={isDark}>
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

                <ReportSection title="Product Revenue Breakdown" icon={<ShoppingBag size={16} style={{ color: C.secondary }} />} C={C} isDark={isDark}>
                  <div onClick={(e) => e.stopPropagation()} style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '360px', overflowY: 'auto' }}>
                    {productRevenue.map((p, i) => {
                      const maxRev = productRevenue[0]?.totalRevenue || 1;
                      const isSelected = filter.type === 'PRODUCT' && filter.code === p.productCode;
                      return (
                        <div 
                          key={p.productCode}
                          onClick={(e) => { e.stopPropagation(); setFilter({ type: 'PRODUCT', code: p.productCode, name: p.description }); }}
                          style={{ 
                            cursor: 'pointer', transition: 'all 0.2s',
                            padding: '8px', borderRadius: '8px',
                            backgroundColor: isSelected ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)') : 'transparent',
                            opacity: (filter.type === 'PRODUCT' && !isSelected) ? 0.4 : 1
                          }}
                          onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)'; } }}
                          onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.backgroundColor = 'transparent'; } }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                            <div><span style={{ fontSize: '13px', fontWeight: 600, color: C.onSurface }}>{p.description}</span></div>
                            <div style={{ textAlign: 'right' }}><span style={{ fontSize: '13px', fontWeight: 700, color: '#22c55e' }}>{fmt(p.totalRevenue)}</span></div>
                          </div>
                          <BarVisual value={p.totalRevenue} max={maxRev} color={i === 0 ? '#22c55e' : i === 1 ? C.primary : C.secondary} />
                        </div>
                      );
                    })}
                  </div>
                </ReportSection>
              </div>

              {/* ── Customer Sales Summary with pagination ── */}
              <ReportSection title="Customer Sales Summary" icon={<BarChart3 size={16} style={{ color: C.primary }} />} C={C} isDark={isDark}>
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
                      Showing {((salesPage - 1) * SALES_PAGE_SIZE) + 1}–{Math.min(salesPage * SALES_PAGE_SIZE, customerSummary.length)} of {customerSummary.length}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => setSalesPage(p => Math.max(1, p - 1))}
                        disabled={salesPage <= 1}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: '32px', height: '32px', borderRadius: '8px',
                          border: `1px solid ${C.outlineVariant}44`, backgroundColor: 'transparent',
                          color: salesPage <= 1 ? `${C.onSurfaceVariant}44` : C.onSurfaceVariant,
                          cursor: salesPage <= 1 ? 'not-allowed' : 'pointer',
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
                            border: page === salesPage ? `1px solid ${C.primary}` : `1px solid ${C.outlineVariant}44`,
                            backgroundColor: page === salesPage ? `${C.primary}18` : 'transparent',
                            color: page === salesPage ? C.primary : C.onSurfaceVariant,
                            fontSize: '12px', fontWeight: page === salesPage ? 700 : 500,
                            cursor: 'pointer', padding: '0 6px',
                          }}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setSalesPage(p => Math.min(salesTotalPages, p + 1))}
                        disabled={salesPage >= salesTotalPages}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: '32px', height: '32px', borderRadius: '8px',
                          border: `1px solid ${C.outlineVariant}44`, backgroundColor: 'transparent',
                          color: salesPage >= salesTotalPages ? `${C.onSurfaceVariant}44` : C.onSurfaceVariant,
                          cursor: salesPage >= salesTotalPages ? 'not-allowed' : 'pointer',
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