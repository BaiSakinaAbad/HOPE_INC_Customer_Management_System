import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  TrendingUp, Users, ShoppingBag, DollarSign, UserCheck,
  RefreshCw, BarChart3, Crown, Package, AlertCircle
} from 'lucide-react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';
import { getSales, type SaleTransaction } from '../../services/salesService';
import { getEmployees } from '../../services/employeeService';
import type { Employee } from '../../types/employee';

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

// ─── Section Wrapper ─────────────────────────────────────────────────────────
const ReportSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  C: ReturnType<typeof getDashboardTokens>;
  isDark: boolean;
}> = ({ title, icon, children, C, isDark }) => (
  <div style={{
    borderRadius: '16px',
    backgroundColor: isDark ? C.surfaceContainerHigh : '#fff',
    border: `1px solid ${C.outlineVariant}44`,
    overflow: 'hidden',
  }}>
    <div style={{
      padding: '20px 24px',
      borderBottom: `1px solid ${C.outlineVariant}33`,
      display: 'flex', alignItems: 'center', gap: '10px',
    }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '10px',
        backgroundColor: `${C.primary}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: C.onSurface }}>
        {title}
      </h3>
    </div>
    <div style={{ padding: '0' }}>
      {children}
    </div>
  </div>
);

// ─── Bar Visual ──────────────────────────────────────────────────────────────
const BarVisual: React.FC<{ value: number; max: number; color: string }> = ({ value, max, color }) => (
  <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: `${color}15`, overflow: 'hidden' }}>
    <div style={{
      width: `${max > 0 ? (value / max) * 100 : 0}%`,
      height: '100%', borderRadius: '4px',
      backgroundColor: color,
      transition: 'width 0.6s ease',
    }} />
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export const DashboardReports: React.FC<DashboardReportsProps> = ({ firstName }) => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);

  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [pendingAccounts, setPendingAccounts] = useState<PendingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [salesRes, empRes] = await Promise.all([
        getSales(),
        getEmployees(),
      ]);

      if (salesRes.error) throw new Error(salesRes.error);
      setSales(salesRes.data ?? []);

      // Get INACTIVE accounts needing activation
      const employees = empRes.data ?? [];
      const inactive = employees
        .filter((e: Employee) => e.recordstatus === 'INACTIVE')
        .map((e: Employee) => ({
          id: e.id,
          username: e.username ?? '',
          email: e.email ?? '',
          role: e.role,
        }));
      setPendingAccounts(inactive);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  // ─── Derived Data ────────────────────────────────────────────────────────
  const customerSummary = useMemo<CustomerSalesSummary[]>(() => {
    const map = new Map<string, CustomerSalesSummary>();
    for (const sale of sales) {
      const existing = map.get(sale.custno);
      if (existing) {
        existing.transactionCount += 1;
        existing.totalRevenue += sale.total;
      } else {
        map.set(sale.custno, {
          custno: sale.custno,
          customerName: sale.customerName,
          transactionCount: 1,
          totalRevenue: sale.total,
        });
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
          map.set(detail.product_code, {
            productCode: detail.product_code,
            description: detail.description,
            totalQuantity: detail.quantity,
            totalRevenue: detail.totalPrice,
          });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [sales]);

  const totalRevenue = useMemo(() => sales.reduce((s, t) => s + t.total, 0), [sales]);
  const totalTransactions = sales.length;
  const uniqueCustomers = useMemo(() => new Set(sales.map(s => s.custno)).size, [sales]);
  const uniqueProducts = useMemo(() => {
    const codes = new Set<string>();
    sales.forEach(s => s.details.forEach(d => codes.add(d.product_code)));
    return codes.size;
  }, [sales]);

  // ─── Render ──────────────────────────────────────────────────────────────
  const thStyle: React.CSSProperties = {
    padding: '12px 20px', fontSize: '11px', fontWeight: 700,
    color: C.onSurfaceVariant, textTransform: 'uppercase',
    letterSpacing: '0.06em', textAlign: 'left',
    borderBottom: `1px solid ${C.outlineVariant}44`,
  };
  const tdStyle: React.CSSProperties = {
    padding: '14px 20px', fontSize: '13px', color: C.onSurface,
  };
  const trBorderStyle = `1px solid ${C.outlineVariant}22`;

  return (
    <div style={{ flex: 1, padding: '32px 24px 64px', fontFamily: "'Inter', sans-serif", maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '28px', fontWeight: 900, color: C.onSurface,
          fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 8px 0',
        }}>
          Welcome back, {firstName}
        </h1>
        <p style={{ fontSize: '14px', color: C.onSurfaceVariant, margin: 0, lineHeight: 1.5 }}>
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Refresh */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button
          onClick={() => void load()}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '10px',
            border: `1px solid ${C.outlineVariant}55`,
            backgroundColor: 'transparent', color: C.onSurfaceVariant,
            fontSize: '12px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1, transition: 'all 0.2s',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <RefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '14px 20px', borderRadius: '12px', marginBottom: '20px',
          backgroundColor: `${C.error}12`, border: `1px solid ${C.error}33`,
          color: C.error, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: C.onSurfaceVariant }}>
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
          <p style={{ fontSize: '14px' }}>Loading dashboard data…</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* ─── Overview Stat Cards ─────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
            <StatCard
              icon={<DollarSign size={22} style={{ color: '#22c55e' }} />}
              label="Total Revenue"
              value={fmt(totalRevenue)}
              accent="#22c55e"
              isDark={isDark}
              C={C}
            />
            <StatCard
              icon={<TrendingUp size={22} style={{ color: C.primary }} />}
              label="Transactions"
              value={totalTransactions}
              accent={C.primary}
              isDark={isDark}
              C={C}
            />
            <StatCard
              icon={<Users size={22} style={{ color: C.secondary }} />}
              label="Unique Customers"
              value={uniqueCustomers}
              accent={C.secondary}
              isDark={isDark}
              C={C}
            />
            <StatCard
              icon={<Package size={22} style={{ color: '#f59e0b' }} />}
              label="Products Sold"
              value={uniqueProducts}
              accent="#f59e0b"
              isDark={isDark}
              C={C}
            />
          </div>

          {/* ─── Pending Account Activation ───────────────────────────────── */}
          {pendingAccounts.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <ReportSection
                title={`Accounts Pending Activation (${pendingAccounts.length})`}
                icon={<UserCheck size={16} style={{ color: '#f59e0b' }} />}
                C={C}
                isDark={isDark}
              >
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {pendingAccounts.map(acc => (
                    <div key={acc.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', borderRadius: '10px',
                      backgroundColor: isDark ? `${C.surfaceContainer}` : '#fef9ee',
                      border: `1px solid ${isDark ? C.outlineVariant : '#fde68a'}44`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '10px',
                          backgroundColor: '#f59e0b18',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <AlertCircle size={16} style={{ color: '#f59e0b' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: C.onSurface }}>
                            {acc.username || acc.email}
                          </div>
                          <div style={{ fontSize: '11px', color: C.onSurfaceVariant }}>
                            {acc.email}
                          </div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                        padding: '4px 10px', borderRadius: '6px',
                        backgroundColor: isDark ? '#f59e0b22' : '#fef3c7',
                        color: '#d97706', letterSpacing: '0.05em',
                      }}>
                        {acc.role} · Inactive
                      </span>
                    </div>
                  ))}
                </div>
              </ReportSection>
            </div>
          )}

          {/* ─── Reports Grid (2 columns) ─────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '24px', marginBottom: '28px' }}>

            {/* Top Customers */}
            <ReportSection
              title="Top 5 Customers"
              icon={<Crown size={16} style={{ color: '#f59e0b' }} />}
              C={C}
              isDark={isDark}
            >
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
                      <td style={{ ...tdStyle, fontWeight: 800, color: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#b45309' : C.onSurfaceVariant }}>
                        {i + 1}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600 }}>{c.customerName}</div>
                        <div style={{ fontSize: '11px', color: C.onSurfaceVariant, fontFamily: 'monospace' }}>{c.custno}</div>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>{c.transactionCount}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: '#22c55e' }}>{fmt(c.totalRevenue)}</td>
                    </tr>
                  ))}
                  {topCustomers.length === 0 && (
                    <tr><td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: C.onSurfaceVariant }}>No data available</td></tr>
                  )}
                </tbody>
              </table>
            </ReportSection>

            {/* Product Revenue */}
            <ReportSection
              title="Product Revenue Breakdown"
              icon={<ShoppingBag size={16} style={{ color: C.secondary }} />}
              C={C}
              isDark={isDark}
            >
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '360px', overflowY: 'auto' }}>
                {productRevenue.length === 0 && (
                  <p style={{ color: C.onSurfaceVariant, fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No data available</p>
                )}
                {productRevenue.map((p, i) => {
                  const maxRev = productRevenue[0]?.totalRevenue || 1;
                  return (
                    <div key={p.productCode}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: C.onSurface }}>{p.description}</span>
                          <span style={{ fontSize: '11px', color: C.onSurfaceVariant, marginLeft: '8px', fontFamily: 'monospace' }}>{p.productCode}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#22c55e' }}>{fmt(p.totalRevenue)}</span>
                          <span style={{ fontSize: '11px', color: C.onSurfaceVariant, marginLeft: '8px' }}>{p.totalQuantity} units</span>
                        </div>
                      </div>
                      <BarVisual value={p.totalRevenue} max={maxRev} color={i === 0 ? '#22c55e' : i === 1 ? C.primary : C.secondary} />
                    </div>
                  );
                })}
              </div>
            </ReportSection>
          </div>

          {/* ─── Full Customer Sales Summary ──────────────────────────────── */}
          <ReportSection
            title="Customer Sales Summary"
            icon={<BarChart3 size={16} style={{ color: C.primary }} />}
            C={C}
            isDark={isDark}
          >
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
                      <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 700, color: C.primary }}>
                        {c.custno}
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{c.customerName}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>{c.transactionCount}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: '#22c55e' }}>{fmt(c.totalRevenue)}</td>
                      <td style={{ ...tdStyle, paddingRight: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <BarVisual value={c.totalRevenue} max={totalRevenue} color={C.primary} />
                          <span style={{ fontSize: '11px', fontWeight: 600, color: C.onSurfaceVariant, minWidth: '40px', textAlign: 'right' }}>
                            {totalRevenue > 0 ? `${((c.totalRevenue / totalRevenue) * 100).toFixed(1)}%` : '0%'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {customerSummary.length === 0 && (
                    <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: C.onSurfaceVariant }}>No sales data available</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </ReportSection>
        </>
      )}
    </div>
  );
};
