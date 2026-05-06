import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  TrendingUp, Users, ShoppingBag, DollarSign, UserCheck,
  RefreshCw, BarChart3, Crown, Package, AlertCircle
} from 'lucide-react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';
import { getSales, type SaleTransaction } from '../../services/salesService';
import { getEmployees } from '../../services/employeeService';
import { getCustomers, getInactiveCustomerCount } from '../../services/customerService';
import { useAuth } from '../../providers/AuthProvider';
import { MiniBarChart } from '../ui/charts/MiniBarChart';
import { MiniLineChart } from '../ui/charts/MiniLineChart';
import type { Employee } from '../../types/employee';
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

interface PendingAccount {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface DashboardReportsProps {
  firstName: string;
}

// ─── Helper: Currency Formatter ──────────────────────────────────────────────
const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: string;
  isDark: boolean;
  C: ReturnType<typeof getDashboardTokens>;
}> = ({ icon, label, value, accent, isDark, C }) => (
  <div style={{
    flex: '1 1 200px',
    padding: '24px',
    borderRadius: '16px',
    backgroundColor: isDark ? `${C.surfaceContainerHigh}` : '#fff',
    border: `1px solid ${C.outlineVariant}44`,
    display: 'flex', alignItems: 'center', gap: '16px',
    transition: 'transform 0.2s, box-shadow 0.2s',
  }}>
    <div style={{
      width: '48px', height: '48px', borderRadius: '14px',
      backgroundColor: `${accent}18`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '12px', color: C.onSurfaceVariant, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '24px', fontWeight: 800, color: C.onSurface, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {value}
      </div>
    </div>
  </div>
);

// ─── Registered Customers Card ────────────────────────────────────────────────
const RegisteredCustomersCard: React.FC<{
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  isDark: boolean;
  C: ReturnType<typeof getDashboardTokens>;
}> = ({ totalCount, activeCount, inactiveCount, isDark, C }) => (
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
    <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
      <MiniBarChart
        isDark={isDark}
        bars={[
          { label: 'Total', value: totalCount, color: '#8b5cf6' },
          ...(activeCount !== undefined ? [{ label: 'Active', value: activeCount, color: '#22c55e' }] : []),
          ...(inactiveCount !== undefined ? [{ label: 'Inactive', value: inactiveCount, color: '#ff5f74' }] : []),
        ]}
      />
    </div>
  </div>
);

// ─── Total Transactions Card ──────────────────────────────────────────────────
const TotalTransactionsCard: React.FC<{
  totalCount: number;
  points: { label: string; value: number }[];
  isDark: boolean;
  C: ReturnType<typeof getDashboardTokens>;
}> = ({ totalCount, points, isDark, C }) => (
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
      <MiniLineChart isDark={isDark} color={C.primary} points={points} />
    </div>
  </div>
);

// ─── Products Sold Card (BIGGER & UPDATED LAYOUT) ─────────────────────────────
const ProductsSoldCard: React.FC<{
  totalCount: number;
  topProducts: { description: string; totalQuantity: number }[];
  isDark: boolean;
  C: ReturnType<typeof getDashboardTokens>;
}> = ({ totalCount, topProducts, isDark, C }) => {
  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#ec4899'];
  const bars = topProducts.map((p, i) => ({
    label: p.description.length > 20 ? p.description.substring(0, 20) + '...' : p.description,
    value: p.totalQuantity,
    color: colors[i % colors.length]
  }));

  return (
    <div style={{
      flex: '2 1 500px',
      backgroundColor: isDark ? 'rgb(13, 24, 52)' : '#ffffff',
      borderRadius: '16px', padding: '24px',
      border: isDark ? '1px solid rgba(255,255,255,0.03)' : `1px solid ${C.outlineVariant}33`,
      boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.02)',
      display: 'flex', flexDirection: 'column',
      minHeight: '220px', gap: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
        <ShoppingBag size={20} />
        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          PRODUCTS SOLD
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <span style={{ fontSize: '13px', color: isDark ? '#8b94a5' : C.onSurfaceVariant, marginBottom: '4px', display: 'block', fontWeight: 500 }}>
            Unique Products Total
          </span>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '42px', fontWeight: 800, color: isDark ? '#fbbf24' : '#1a1a2e', lineHeight: 1 }}>
            {totalCount.toLocaleString()}
          </span>
        </div>
        <div style={{ width: '100%', paddingTop: '10px' }}>
          <MiniBarChart isDark={isDark} bars={bars} />
        </div>
      </div>
    </div>
  );
};

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

  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [pendingAccounts, setPendingAccounts] = useState<PendingAccount[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [activeCustomers, setActiveCustomers] = useState(0);
  const [inactiveCustomers, setInactiveCustomers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const activeCount = (custRes.data ?? []).filter((c: any) => c.recordstatus === 'ACTIVE').length;
        setActiveCustomers(activeCount);
        setInactiveCustomers(inactiveCount);
        setTotalCustomers(activeCount + inactiveCount);
      }

      const employees = empRes.data ?? [];
      const inactive = employees
        .filter((e: Employee) => e.recordstatus === 'INACTIVE')
        .map((e: Employee) => ({ id: e.id, username: e.username ?? '', email: e.email ?? '', role: e.role }));
      setPendingAccounts(inactive);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    }
    setLoading(false);
  }, [role]);

  useEffect(() => { void load(); }, [load]);

  const customerSummary = useMemo<CustomerSalesSummary[]>(() => {
    const map = new Map<string, CustomerSalesSummary>();
    for (const sale of sales) {
      const existing = map.get(sale.custno);
      if (existing) {
        existing.transactionCount += 1;
        existing.totalRevenue += sale.total;
      } else {
        map.set(sale.custno, { custno: sale.custno, customerName: sale.customerName, transactionCount: 1, totalRevenue: sale.total });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [sales]);

  const topCustomers = useMemo(() => customerSummary.slice(0, 5), [customerSummary]);

  const productRevenue = useMemo<ProductRevenue[]>(() => {
    const map = new Map<string, ProductRevenue>();
    for (const sale of sales) {
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
  }, [sales]);

  const topProductsByQuantity = useMemo(() => {
    return [...productRevenue].sort((a, b) => b.totalQuantity - a.totalQuantity).slice(0, 3);
  }, [productRevenue]);

  const totalRevenue = useMemo(() => sales.reduce((s, t) => s + t.total, 0), [sales]);
  const totalTransactions = sales.length;
  const uniqueProducts = useMemo(() => {
    const codes = new Set<string>();
    sales.forEach(s => s.details.forEach(d => codes.add(d.product_code)));
    return codes.size;
  }, [sales]);

  const salesTrend = useMemo(() => {
    if (!sales.length) return [];
    const sorted = [...sales].sort((a, b) => new Date(a.salesdate).getTime() - new Date(b.salesdate).getTime());
    const groups: Record<string, number> = {};
    sorted.forEach(s => {
      const d = new Date(s.salesdate);
      const key = `${d.getMonth() + 1}/${d.getDate()}`; 
      groups[key] = (groups[key] || 0) + s.total;
    });
    return Object.entries(groups).map(([label, value]) => ({ label, value })).slice(-7);
  }, [sales]);

  const thStyle: React.CSSProperties = { padding: '12px 20px', fontSize: '11px', fontWeight: 700, color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', borderBottom: `1px solid ${C.outlineVariant}44` };
  const tdStyle: React.CSSProperties = { padding: '14px 20px', fontSize: '13px', color: C.onSurface };
  const trBorderStyle = `1px solid ${C.outlineVariant}22`;

  return (
    <div style={{ flex: 1, padding: '32px 24px 64px', fontFamily: "'Inter', sans-serif", maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: C.onSurface, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 8px 0' }}>
          Welcome back, {firstName}
        </h1>
        <p style={{ fontSize: '14px', color: C.onSurfaceVariant, margin: 0 }}>Here's what's happening with your business today.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button onClick={() => void load()} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: `1px solid ${C.outlineVariant}55`, backgroundColor: 'transparent', color: C.onSurfaceVariant, fontSize: '12px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
          <RefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {!loading && !error && (
        <>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
            <StatCard icon={<DollarSign size={22} style={{ color: '#22c55e' }} />} label="Total Revenue" value={fmt(totalRevenue)} accent="#22c55e" isDark={isDark} C={C} />
            <TotalTransactionsCard totalCount={totalTransactions} points={salesTrend} isDark={isDark} C={C} />
            {role === 'superadmin' && <RegisteredCustomersCard totalCount={totalCustomers} activeCount={activeCustomers} inactiveCount={inactiveCustomers} isDark={isDark} C={C} />}
            <ProductsSoldCard totalCount={uniqueProducts} topProducts={topProductsByQuantity} isDark={isDark} C={C} />
          </div>

          {pendingAccounts.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <ReportSection title={`Accounts Pending Activation (${pendingAccounts.length})`} icon={<UserCheck size={16} style={{ color: '#f59e0b' }} />} C={C} isDark={isDark}>
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {pendingAccounts.map(acc => (
                    <div key={acc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', backgroundColor: isDark ? `${C.surfaceContainer}` : '#fef9ee', border: `1px solid ${isDark ? C.outlineVariant : '#fde68a'}44` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#f59e0b18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertCircle size={16} style={{ color: '#f59e0b' }} /></div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: C.onSurface }}>{acc.username || acc.email}</div>
                          <div style={{ fontSize: '11px', color: C.onSurfaceVariant }}>{acc.email}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', padding: '4px 10px', borderRadius: '6px', backgroundColor: isDark ? '#f59e0b22' : '#fef3c7', color: '#d97706' }}>{acc.role} · Inactive</span>
                    </div>
                  ))}
                </div>
              </ReportSection>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '24px', marginBottom: '28px' }}>
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
                    <tr key={c.custno} style={{ borderBottom: i < topCustomers.length - 1 ? trBorderStyle : 'none' }}>
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
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '360px', overflowY: 'auto' }}>
                {productRevenue.map((p, i) => {
                  const maxRev = productRevenue[0]?.totalRevenue || 1;
                  return (
                    <div key={p.productCode}>
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

          <ReportSection title="Customer Sales Summary" icon={<BarChart3 size={16} style={{ color: C.primary }} />} C={C} isDark={isDark}>
            <div style={{ overflowX: 'auto' }}>
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
                  {customerSummary.map((c, i) => (
                    <tr key={c.custno} style={{ borderBottom: i < customerSummary.length - 1 ? trBorderStyle : 'none' }}>
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
          </ReportSection>
        </>
      )}
    </div>
  );
};