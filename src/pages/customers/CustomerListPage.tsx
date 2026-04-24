/**
 * CustomerListPage — Active customer records with search, soft-delete, and role gating.
 *
 * Security rules enforced here (mirroring service + RLS):
 *  - employee  : sees ACTIVE only, no stamp column, soft-delete allowed
 *  - admin/SA  : sees ALL records, stamp column visible, soft-delete allowed
 *
 * Search bar: 300 ms debounce, filters custno / custname / address / payterm client-side.
 * Soft-delete: confirmation modal → UPDATE record_status='INACTIVE' (no SQL DELETE).
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search, Trash2, RefreshCw, X,
  AlertTriangle, Users, ChevronUp, ChevronDown,
  Plus, Eye, Edit2
} from 'lucide-react';
import { useTheme, getDashboardTokens, type DashboardTokens } from '../../providers/ThemeProvider';
import { useAuth } from '../../providers/AuthProvider';
import { useRights } from '../../hooks/useRights';
import { getCustomers, softDeleteCustomer } from '../../services/customerService';
import type { Customer } from '../../types/customer';
import { DefaultTable, Button } from '../../components/ui';

// ── Skeleton cell ─────────────────────────────────────────────────────────────
const SkeletonCell: React.FC<{ width?: string; C: DashboardTokens; isDark: boolean }> = ({
  width = '80px', C, isDark,
}) => (
  <DefaultTable.Td>
    <div style={{
      height: '13px', borderRadius: '6px', width,
      backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
      animation: 'pulse 1.4s ease-in-out infinite',
    }} />
  </DefaultTable.Td>
);

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const isActive = status === 'ACTIVE';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '999px',
      fontSize: '11px', fontWeight: 700,
      backgroundColor: isActive ? 'rgba(34,197,94,0.12)' : 'rgba(120,120,140,0.1)',
      color: isActive ? '#22c55e' : '#888898',
      border: `1px solid ${isActive ? 'rgba(34,197,94,0.28)' : 'rgba(120,120,140,0.22)'}`,
    }}>
      <span style={{
        width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
        backgroundColor: isActive ? '#22c55e' : '#888898',
      }} />
      {status}
    </span>
  );
};

// ── Customer row ──────────────────────────────────────────────────────────────
interface RowProps {
  customer: Customer;
  idx: number;
  C: DashboardTokens;
  isDark: boolean;
  canViewStamp: boolean;
  canSoftDelete: boolean;
  onDelete: () => void;
}

const CustomerRow: React.FC<RowProps> = ({
  customer: c, idx, C, isDark, canViewStamp, canSoftDelete, onDelete,
}) => {
  const [btnHovered, setBtnHovered] = useState(false);
  const [viewHovered, setViewHovered] = useState(false);
  const [editHovered, setEditHovered] = useState(false);

  return (
    <DefaultTable.Tr>
      {/* Cust No */}
      <DefaultTable.Td style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: C.primary }}>
        {c.custno}
      </DefaultTable.Td>
      {/* Name */}
      <DefaultTable.Td style={{ fontWeight: 600 }}>{c.custname}</DefaultTable.Td>
      {/* Address */}
      <DefaultTable.Td
        style={{ color: C.onSurfaceVariant, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        title={c.address ?? ''}
      >
        {c.address || '—'}
      </DefaultTable.Td>
      {/* Pay Term */}
      <DefaultTable.Td style={{ color: C.onSurfaceVariant }}>{c.payterm || '—'}</DefaultTable.Td>
      {/* Status */}
      <DefaultTable.Td><StatusBadge status={c.recordstatus} /></DefaultTable.Td>
      {/* Stamp (admin / superadmin only) */}
      {canViewStamp && (
        <DefaultTable.Td
          style={{ fontFamily: 'monospace', fontSize: '11px', color: C.onSurfaceVariant, maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          title={c.stamp ?? ''}
        >
          {c.stamp || '—'}
        </DefaultTable.Td>
      )}
      {/* Actions */}
      <DefaultTable.Td style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'center' }}>
          <button
            type="button"
            onMouseEnter={() => setViewHovered(true)}
            onMouseLeave={() => setViewHovered(false)}
            title="View customer details"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '6px 10px', borderRadius: '7px', border: 'none',
              backgroundColor: viewHovered ? C.primary : `${C.primary}18`,
              color: viewHovered ? '#fff' : C.primary,
              fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.18s ease',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <Eye size={13} />
            View
          </button>
          
          <button
            type="button"
            onMouseEnter={() => setEditHovered(true)}
            onMouseLeave={() => setEditHovered(false)}
            title="Edit customer details"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '6px 10px', borderRadius: '7px', border: 'none',
              backgroundColor: editHovered ? '#f59e0b' : 'rgba(245, 158, 11, 0.1)',
              color: editHovered ? '#fff' : '#f59e0b',
              fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.18s ease',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <Edit2 size={13} />
            Edit
          </button>

          {canSoftDelete && (
            <button
              type="button"
              onClick={onDelete}
              onMouseEnter={() => setBtnHovered(true)}
              onMouseLeave={() => setBtnHovered(false)}
              title="Archive this customer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '6px 10px', borderRadius: '7px', border: 'none',
                backgroundColor: btnHovered ? C.error : `${C.error}18`,
                color: btnHovered ? '#fff' : C.error,
                fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.18s ease',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <Trash2 size={13} />
              Delete
            </button>
          )}
        </div>
      </DefaultTable.Td>
    </DefaultTable.Tr>
  );
};

// ── Confirm-delete modal ──────────────────────────────────────────────────────
interface ConfirmDeleteModalProps {
  customer: Customer;
  loading: boolean;
  error: string | null;
  C: DashboardTokens;
  isDark: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  customer, loading, error, C, isDark, onConfirm, onCancel,
}) => (
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
        backgroundColor: `${C.error}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '20px',
      }}>
        <AlertTriangle size={26} style={{ color: C.error }} />
      </div>

      <h3 style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '20px', fontWeight: 800,
        color: isDark ? '#fff' : '#1a1a2e',
        margin: '0 0 10px',
      }}>
        Archive Customer?
      </h3>

      <p style={{
        fontFamily: 'Inter, sans-serif', fontSize: '14px',
        color: C.onSurfaceVariant, margin: '0 0 6px', lineHeight: 1.65,
      }}>
        <strong style={{ color: C.onSurface }}>{customer.custname}</strong>{' '}
        <span style={{ fontFamily: 'monospace', fontSize: '12px', opacity: 0.8 }}>
          ({customer.custno})
        </span>{' '}
        will be moved to the deleted list. An Admin or SuperAdmin can restore this record at any time.
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
        {/* Cancel */}
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
        {/* Confirm */}
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          style={{
            flex: 1, height: '42px', borderRadius: '10px',
            backgroundColor: C.error, color: '#fff', border: 'none',
            fontSize: '14px', fontFamily: 'Inter, sans-serif', fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          {loading
            ? <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            : <><Trash2 size={14} /> Archive</>}
        </button>
      </div>
    </div>
  </div>
);

// ── CustomerListPage ──────────────────────────────────────────────────────────
export const CustomerListPage: React.FC = () => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  const { role, user } = useAuth();
  const { canViewStamp, canSoftDelete } = useRights();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Customer | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean | null>(null);

  // ── 300 ms debounce ────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: svcError } = await getCustomers(role ?? 'employee');
    setCustomers(svcError ? [] : (data ?? []));
    setError(svcError);
    setLoading(false);
  }, [role]);

  useEffect(() => { void load(); }, [load]);

  // ── Client-side search filter & Sort ───────────────────────────────────────
  const filtered = useMemo(() => {
    let result = customers;
    const q = debouncedSearch.trim().toLowerCase();
    if (q) {
      result = result.filter(cust => {
        const hay = [
          cust.custno,
          cust.custname,
          cust.address ?? '',
          cust.payterm ?? '',
        ].join(' ').toLowerCase();
        return hay.includes(q);
      });
    }

    if (sortAsc !== null) {
      result = [...result].sort((a, b) => {
        if (a.custno < b.custno) return sortAsc ? -1 : 1;
        if (a.custno > b.custno) return sortAsc ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [customers, debouncedSearch, sortAsc]);

  // ── Soft-delete handler ────────────────────────────────────────────────────
  const performedBy: string =
    (user?.user_metadata?.email as string | undefined) ?? user?.email ?? 'unknown';

  const handleSoftDelete = async () => {
    if (!confirmDelete) return;
    setActionLoading(true);
    setActionError(null);
    const { error: svcError } = await softDeleteCustomer(
      confirmDelete.custno,
      performedBy,
      role ?? 'employee',
    );
    if (svcError) {
      setActionError(svcError);
    } else {
      setConfirmDelete(null);
      void load();
    }
    setActionLoading(false);
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  const colCount = 5 + (canViewStamp ? 1 : 0) + 1; // 1 for Actions

  // ── Render ─────────────────────────────────────────────────────────────────
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
            Customers
          </h2>
          <p style={{ fontSize: '13px', color: C.onSurfaceVariant, margin: '6px 0 0' }}>
            {loading
              ? 'Loading records…'
              : `${customers.length} record${customers.length !== 1 ? 's' : ''} total`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Refresh button */}
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
          
          <Button compact style={{ width: 'auto', padding: '0 20px', height: 'auto' }}>
            <Plus size={16} style={{ marginRight: '6px' }} />
            Add Customer
          </Button>
        </div>
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
            placeholder="Search by name, address, code, pay term…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', height: '42px',
              paddingLeft: '38px', paddingRight: searchQuery ? '36px' : '14px',
              backgroundColor: isDark ? `${C.surfaceContainerHigh}` : '#f0eef8',
              border: `1px solid ${C.outlineVariant}55`,
              borderRadius: '10px', fontSize: '13px',
              fontFamily: 'Inter, sans-serif', color: C.onSurface,
              outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.2s',
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
                color: C.onSurfaceVariant,
                display: 'flex', alignItems: 'center', padding: '2px',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Result count */}
        {debouncedSearch.trim() && !loading && (
          <span style={{
            fontSize: '12px', color: C.onSurfaceVariant,
            whiteSpace: 'nowrap',
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
      <DefaultTable.Container>
            <thead>
              <tr>
                <DefaultTable.Th 
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => setSortAsc(prev => prev === null ? true : !prev)}
                  title="Sort by Customer ID"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Customer ID
                    {sortAsc === true && <ChevronUp size={14} />}
                    {sortAsc === false && <ChevronDown size={14} />}
                    {sortAsc === null && <ChevronUp size={14} style={{ opacity: 0.3 }} />}
                  </div>
                </DefaultTable.Th>
                <DefaultTable.Th>Name</DefaultTable.Th>
                <DefaultTable.Th>Address</DefaultTable.Th>
                <DefaultTable.Th>Pay Term</DefaultTable.Th>
                <DefaultTable.Th>Status</DefaultTable.Th>
                {canViewStamp && <DefaultTable.Th>Stamp</DefaultTable.Th>}
                <DefaultTable.Th style={{ textAlign: 'center' }}>Actions</DefaultTable.Th>
              </tr>
            </thead>
            <tbody>
              {/* Skeleton rows while loading */}
              {loading && Array.from({ length: 6 }, (_, i) => (
                <DefaultTable.Tr key={`skel-${i}`}>
                  <SkeletonCell width="60px"  C={C} isDark={isDark} />
                  <SkeletonCell width="140px" C={C} isDark={isDark} />
                  <SkeletonCell width="170px" C={C} isDark={isDark} />
                  <SkeletonCell width="70px"  C={C} isDark={isDark} />
                  <SkeletonCell width="75px"  C={C} isDark={isDark} />
                  {canViewStamp  && <SkeletonCell width="200px" C={C} isDark={isDark} />}
                  <SkeletonCell width="160px"  C={C} isDark={isDark} />
                </DefaultTable.Tr>
              ))}

              {/* Empty state */}
              {!loading && filtered.length === 0 && (
                <DefaultTable.Tr>
                  <DefaultTable.Td colSpan={colCount} style={{ padding: '64px 32px', textAlign: 'center' }}>
                    <div style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: '12px',
                    }}>
                      <Users size={44} style={{ color: C.outlineVariant, opacity: 0.5 }} />
                      <p style={{
                        margin: 0, fontSize: '14px',
                        color: C.onSurfaceVariant, fontWeight: 600,
                      }}>
                        {debouncedSearch
                          ? `No results for "${debouncedSearch}"`
                          : 'No customers found'}
                      </p>
                      {debouncedSearch.trim() && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          style={{
                            background: 'none', border: 'none',
                            color: C.primary, cursor: 'pointer',
                            fontSize: '13px', fontWeight: 600,
                          }}
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </DefaultTable.Td>
                </DefaultTable.Tr>
              )}

              {/* Data rows */}
              {!loading && filtered.map((cust, idx) => (
                <CustomerRow
                  key={cust.custno}
                  customer={cust}
                  idx={idx}
                  C={C}
                  isDark={isDark}
                  canViewStamp={canViewStamp}
                  canSoftDelete={canSoftDelete}
                  onDelete={() => setConfirmDelete(cust)}
                />
              ))}
            </tbody>
      </DefaultTable.Container>

      {/* ── Confirm modal ── */}
      {confirmDelete && (
        <ConfirmDeleteModal
          customer={confirmDelete}
          loading={actionLoading}
          error={actionError}
          C={C}
          isDark={isDark}
          onConfirm={handleSoftDelete}
          onCancel={() => { setConfirmDelete(null); setActionError(null); }}
        />
      )}
    </div>
  );
};
