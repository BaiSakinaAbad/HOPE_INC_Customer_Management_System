/**
 * DeletedCustomersPage — Archived (INACTIVE) customer records.
 *
 * Access rules:
 *  - Guarded at render level: employees see an "Access Denied" screen.
 *  - Sidebar already hides the nav link for employees (canViewDeletedNav).
 *  - Activate button restores record_status='ACTIVE' (admin / superadmin only).
 *  - Search bar with 300 ms debounce (same UX pattern as CustomerListPage).
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search, CheckCircle2, RefreshCw, X,
  AlertTriangle, Inbox, ShieldOff,
} from 'lucide-react';
import { useTheme, getDashboardTokens, type DashboardTokens } from '../../providers/ThemeProvider';
import { useAuth } from '../../providers/AuthProvider';
import { useRights } from '../../hooks/useRights';
import { getDeletedCustomers, activateCustomer } from '../../services/customerService';
import type { Customer } from '../../types/customer';

// ── Skeleton cell ─────────────────────────────────────────────────────────────
const SkeletonCell: React.FC<{ width?: string; C: DashboardTokens; isDark: boolean }> = ({
  width = '80px', C, isDark,
}) => (
  <td style={{ padding: '14px 16px', borderBottom: `1px solid ${C.outlineVariant}22` }}>
    <div style={{
      height: '13px', borderRadius: '6px', width,
      backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
      animation: 'pulse 1.4s ease-in-out infinite',
    }} />
  </td>
);

// ── Deleted customer row ──────────────────────────────────────────────────────
interface RowProps {
  customer: Customer;
  idx: number;
  C: DashboardTokens;
  isDark: boolean;
  canViewStamp: boolean;
  canActivate: boolean;
  onActivate: () => void;
}

const DeletedRow: React.FC<RowProps> = ({
  customer: c, idx, C, isDark, canViewStamp, canActivate, onActivate,
}) => {
  const [rowHovered, setRowHovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  const tdBase: React.CSSProperties = {
    padding: '13px 16px',
    borderBottom: `1px solid ${C.outlineVariant}1a`,
    color: C.onSurface, verticalAlign: 'middle',
    fontFamily: 'Inter, sans-serif', fontSize: '13px',
    opacity: 0.85,
  };

  const green = '#22c55e';

  return (
    <tr
      onMouseEnter={() => setRowHovered(true)}
      onMouseLeave={() => setRowHovered(false)}
      style={{
        backgroundColor: rowHovered
          ? (isDark ? `${C.surfaceContainerHigh}cc` : '#f5f4ff')
          : idx % 2 !== 0
            ? (isDark ? `${C.surfaceContainerHigh}40` : '#faf9ff')
            : 'transparent',
        transition: 'background-color 0.12s ease',
      }}
    >
      {/* Cust No */}
      <td style={{ ...tdBase, fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: C.onSurfaceVariant }}>
        {c.custno}
      </td>
      {/* Name */}
      <td style={{ ...tdBase, fontWeight: 600, color: C.onSurfaceVariant }}>{c.custname}</td>
      {/* Address */}
      <td
        style={{ ...tdBase, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: C.onSurfaceVariant }}
        title={c.address ?? ''}
      >
        {c.address || '—'}
      </td>
      {/* Pay Term */}
      <td style={{ ...tdBase, color: C.onSurfaceVariant }}>{c.payterm || '—'}</td>
      {/* Status badge — always INACTIVE here */}
      <td style={tdBase}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '3px 10px', borderRadius: '999px',
          fontSize: '11px', fontWeight: 700,
          backgroundColor: 'rgba(120,120,140,0.1)', color: '#888898',
          border: '1px solid rgba(120,120,140,0.22)',
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#888898', flexShrink: 0 }} />
          INACTIVE
        </span>
      </td>
      {/* Stamp (admin / superadmin only) */}
      {canViewStamp && (
        <td
          style={{ ...tdBase, fontFamily: 'monospace', fontSize: '11px', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          title={c.stamp ?? ''}
        >
          {c.stamp || '—'}
        </td>
      )}
      {/* Activate action */}
      {canActivate && (
        <td style={{ ...tdBase, textAlign: 'center' }}>
          <button
            type="button"
            onClick={onActivate}
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
            title="Restore this customer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '6px 12px', borderRadius: '7px', border: 'none',
              backgroundColor: btnHovered ? green : 'rgba(34,197,94,0.15)',
              color: btnHovered ? '#fff' : green,
              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.18s ease', fontFamily: 'Inter, sans-serif',
            }}
          >
            <CheckCircle2 size={13} />
            Restore
          </button>
        </td>
      )}
    </tr>
  );
};

// ── Confirm-activate modal ────────────────────────────────────────────────────
interface ConfirmActivateModalProps {
  customer: Customer;
  loading: boolean;
  error: string | null;
  C: DashboardTokens;
  isDark: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmActivateModal: React.FC<ConfirmActivateModalProps> = ({
  customer, loading, error, C, isDark, onConfirm, onCancel,
}) => {
  const green = '#22c55e';
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      }}
      onClick={e => { if (e.target === e.currentTarget && !loading) onCancel(); }}
    >
      <div style={{
        backgroundColor: isDark ? C.surfaceContainerHigh : '#ffffff',
        borderRadius: '18px', padding: '32px',
        maxWidth: '440px', width: '100%',
        border: `1px solid ${C.outlineVariant}33`,
        boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
        animation: 'authFadeIn 0.2s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        {/* Icon */}
        <div style={{
          width: '52px', height: '52px', borderRadius: '14px',
          backgroundColor: 'rgba(34,197,94,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '20px',
        }}>
          <CheckCircle2 size={26} style={{ color: green }} />
        </div>

        <h3 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '20px', fontWeight: 800,
          color: isDark ? '#fff' : '#1a1a2e', margin: '0 0 10px',
        }}>
          Restore Customer?
        </h3>

        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: '14px',
          color: C.onSurfaceVariant, margin: '0 0 6px', lineHeight: 1.65,
        }}>
          <strong style={{ color: C.onSurface }}>{customer.custname}</strong>{' '}
          <span style={{ fontFamily: 'monospace', fontSize: '12px', opacity: 0.8 }}>
            ({customer.custno})
          </span>{' '}
          will be moved back to the active customers list.
        </p>

        {error && (
          <div style={{
            marginTop: '12px', padding: '10px 14px', borderRadius: '8px',
            backgroundColor: `${C.error}18`, border: `1px solid ${C.error}33`,
            color: C.error, fontSize: '12px', fontFamily: 'Inter, sans-serif',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1, height: '42px', borderRadius: '10px',
              border: `1px solid ${C.outlineVariant}66`,
              backgroundColor: 'transparent', color: C.onSurface,
              fontSize: '14px', fontFamily: 'Inter, sans-serif', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1, height: '42px', borderRadius: '10px',
              backgroundColor: green, color: '#fff', border: 'none',
              fontSize: '14px', fontFamily: 'Inter, sans-serif', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {loading
              ? <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              : <><CheckCircle2 size={14} /> Restore</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── DeletedCustomersPage ──────────────────────────────────────────────────────
export const DeletedCustomersPage: React.FC = () => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  const { role, user } = useAuth();
  const { canViewInactive, canActivate, canViewStamp } = useRights();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [confirmActivate, setConfirmActivate] = useState<Customer | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: svcError } = await getDeletedCustomers();
    setCustomers(svcError ? [] : (data ?? []));
    setError(svcError);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(cust => {
      const hay = [
        cust.custno, cust.custname,
        cust.address ?? '', cust.payterm ?? '',
      ].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [customers, debouncedSearch]);

  const performedBy: string =
    (user?.user_metadata?.email as string | undefined) ?? user?.email ?? 'unknown';

  const handleActivate = async () => {
    if (!confirmActivate) return;
    setActionLoading(true);
    setActionError(null);
    const { error: svcError } = await activateCustomer(
      confirmActivate.custno,
      performedBy,
      role ?? 'admin',
    );
    if (svcError) {
      setActionError(svcError);
    } else {
      setConfirmActivate(null);
      void load();
    }
    setActionLoading(false);
  };

  const colCount = 5 + (canViewStamp ? 1 : 0) + (canActivate ? 1 : 0);

  const thStyle: React.CSSProperties = {
    padding: '12px 16px', textAlign: 'left',
    fontSize: '11px', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: C.onSurfaceVariant,
    backgroundColor: C.surfaceContainerHigh,
    borderBottom: `1px solid ${C.outlineVariant}33`,
    whiteSpace: 'nowrap',
  };

  // ── Access guard — employees should never reach this page ──────────────────
  if (!canViewInactive) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 24px', gap: '16px',
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '20px',
          backgroundColor: `${C.error}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ShieldOff size={36} style={{ color: C.error }} />
        </div>
        <h2 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '24px', fontWeight: 800,
          color: isDark ? '#fff' : '#1a1a2e', margin: 0,
        }}>
          Access Denied
        </h2>
        <p style={{ fontSize: '14px', color: C.onSurfaceVariant, maxWidth: '360px', textAlign: 'center', lineHeight: 1.6 }}>
          Viewing deleted records requires Admin or SuperAdmin privileges.
        </p>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, padding: '32px 24px 48px', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Page header ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', flexWrap: 'wrap',
        gap: '12px', marginBottom: '24px',
      }}>
        <div>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '28px', fontWeight: 800,
            color: isDark ? '#fff' : '#1a1a2e',
            margin: 0, lineHeight: 1.1,
          }}>
            Deleted Customers
          </h2>
          <p style={{ fontSize: '13px', color: C.onSurfaceVariant, margin: '6px 0 0' }}>
            {loading
              ? 'Loading records…'
              : `${customers.length} archived record${customers.length !== 1 ? 's' : ''}`}
          </p>
        </div>

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
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* ── Search bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: '12px', marginBottom: '20px', flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: '220px', maxWidth: '480px', position: 'relative' }}>
          <Search
            size={15}
            style={{
              position: 'absolute', left: '13px', top: '50%',
              transform: 'translateY(-50%)',
              color: C.onSurfaceVariant, pointerEvents: 'none',
            }}
          />
          <input
            type="search"
            placeholder="Search archived customers…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', height: '42px',
              paddingLeft: '38px', paddingRight: searchQuery ? '36px' : '14px',
              backgroundColor: isDark ? C.surfaceContainerHigh : '#f0eef8',
              border: `1px solid ${C.outlineVariant}55`,
              borderRadius: '10px', fontSize: '13px',
              fontFamily: 'Inter, sans-serif', color: C.onSurface,
              outline: 'none', boxSizing: 'border-box',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              style={{
                position: 'absolute', right: '10px', top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: C.onSurfaceVariant, display: 'flex', alignItems: 'center', padding: '2px',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {debouncedSearch.trim() && !loading && (
          <span style={{
            fontSize: '12px', color: C.onSurfaceVariant, whiteSpace: 'nowrap',
            padding: '5px 10px', borderRadius: '7px',
            backgroundColor: isDark ? `${C.surfaceContainerHigh}88` : `${C.outlineVariant}22`,
          }}>
            {filtered.length} of {customers.length} shown
          </span>
        )}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
          backgroundColor: `${C.error}18`, border: `1px solid ${C.error}33`,
          color: C.error, fontSize: '13px',
        }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{error}</span>
          <button
            type="button"
            onClick={() => void load()}
            style={{
              background: 'none', border: `1px solid ${C.error}55`,
              borderRadius: '6px', padding: '4px 10px', color: C.error,
              cursor: 'pointer', fontSize: '11px', fontWeight: 700,
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Table card ── */}
      <div style={{
        backgroundColor: C.surfaceContainer, borderRadius: '14px',
        border: `1px solid ${C.outlineVariant}33`, overflow: 'hidden',
        boxShadow: isDark ? '0 4px 32px rgba(0,0,0,0.25)' : '0 2px 16px rgba(0,0,0,0.05)',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr>
                <th style={thStyle}>Cust No</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Address</th>
                <th style={thStyle}>Pay Term</th>
                <th style={thStyle}>Status</th>
                {canViewStamp  && <th style={thStyle}>Stamp</th>}
                {canActivate   && <th style={{ ...thStyle, textAlign: 'center' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {/* Skeleton rows */}
              {loading && Array.from({ length: 5 }, (_, i) => (
                <tr key={`skel-${i}`}>
                  <SkeletonCell width="60px"  C={C} isDark={isDark} />
                  <SkeletonCell width="140px" C={C} isDark={isDark} />
                  <SkeletonCell width="170px" C={C} isDark={isDark} />
                  <SkeletonCell width="70px"  C={C} isDark={isDark} />
                  <SkeletonCell width="75px"  C={C} isDark={isDark} />
                  {canViewStamp && <SkeletonCell width="200px" C={C} isDark={isDark} />}
                  {canActivate  && <SkeletonCell width="65px"  C={C} isDark={isDark} />}
                </tr>
              ))}

              {/* Empty state */}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={colCount} style={{ padding: '64px 32px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <Inbox size={44} style={{ color: C.outlineVariant, opacity: 0.5 }} />
                      <p style={{ margin: 0, fontSize: '14px', color: C.onSurfaceVariant, fontWeight: 600 }}>
                        {debouncedSearch
                          ? `No archived results for "${debouncedSearch}"`
                          : 'No archived customers'}
                      </p>
                      {debouncedSearch.trim() && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          style={{ background: 'none', border: 'none', color: C.primary, cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {!loading && filtered.map((cust, idx) => (
                <DeletedRow
                  key={cust.custno}
                  customer={cust}
                  idx={idx}
                  C={C}
                  isDark={isDark}
                  canViewStamp={canViewStamp}
                  canActivate={canActivate}
                  onActivate={() => setConfirmActivate(cust)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Confirm-activate modal ── */}
      {confirmActivate && (
        <ConfirmActivateModal
          customer={confirmActivate}
          loading={actionLoading}
          error={actionError}
          C={C}
          isDark={isDark}
          onConfirm={handleActivate}
          onCancel={() => { setConfirmActivate(null); setActionError(null); }}
        />
      )}
    </div>
  );
};
