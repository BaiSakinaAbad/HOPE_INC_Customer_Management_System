import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, AlertTriangle, Inbox, ShieldOff, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';
import { useAuth } from '../../providers/AuthProvider';
import { useRights } from '../../hooks/useRights';
import { getDeletedCustomers, activateCustomer } from '../..//services/customerService';
import type { Customer } from '../../types/customer';
import { DefaultTable } from '../../components/ui';

// Import our reusable feature components
import { CustomerSearch } from '../../components/customers/CustomerSearch';
import { ActionModal } from '../../components/customers/ActionModal';
import { DeletedRow } from '../../components/customers/DeletedRow';

export const DeletedCustomersPage: React.FC = () => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  const { role, user } = useAuth();
  const { canViewInactive, canActivate, canViewStamp } = useRights();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortAsc, setSortAsc] = useState<boolean | null>(null);
  
  // Modal State
  const [confirmActivate, setConfirmActivate] = useState<Customer | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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
    let result = customers;
    const q = debouncedSearch.trim().toLowerCase();
    if (q) {
      result = result.filter(cust => 
        [cust.custno, cust.custname, cust.address ?? '', cust.payterm ?? '']
          .join(' ').toLowerCase().includes(q)
      );
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

  const handleActivate = async () => {
    if (!confirmActivate) return;
    setActionLoading(true);
    setActionError(null);
    const performedBy = (user?.user_metadata?.email as string | undefined) ?? user?.email ?? 'unknown';
    
    const { error: svcError } = await activateCustomer(confirmActivate.custno, performedBy, role ?? 'admin');
    
    if (svcError) {
      setActionError(svcError);
    } else {
      setConfirmActivate(null);
      void load();
    }
    setActionLoading(false);
  };

  const colCount = 5 + (canViewStamp ? 1 : 0) + (canActivate ? 1 : 0);

  // ── Access guard ──
  if (!canViewInactive) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '16px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '20px', backgroundColor: `${C.error}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldOff size={36} style={{ color: C.error }} />
        </div>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '24px', fontWeight: 800, color: isDark ? '#fff' : '#1a1a2e', margin: 0 }}>Access Denied</h2>
        <p style={{ fontSize: '14px', color: C.onSurfaceVariant, maxWidth: '360px', textAlign: 'center', lineHeight: 1.6 }}>Viewing deleted records requires Admin or SuperAdmin privileges.</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, padding: '32px 24px 48px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '28px', fontWeight: 800, color: isDark ? '#fff' : '#1a1a2e', margin: 0, lineHeight: 1.1 }}>Deleted Customers</h2>
          <p style={{ fontSize: '13px', color: C.onSurfaceVariant, margin: '6px 0 0' }}>{loading ? 'Loading records…' : `${customers.length} archived records`}</p>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading} style={{ /* ...refresh styles */ }}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {/* Extracted Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <CustomerSearch onSearch={setDebouncedSearch} C={C} isDark={isDark} />
        {debouncedSearch.trim() && !loading && (
          <span style={{ fontSize: '12px', color: C.onSurfaceVariant, padding: '5px 10px', borderRadius: '7px', backgroundColor: isDark ? `${C.surfaceContainerHigh}88` : `${C.outlineVariant}22` }}>
            {filtered.length} of {customers.length} shown
          </span>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{ /* ...error styles */ }}>
          <AlertTriangle size={16} /> <span>{error}</span>
          <button onClick={() => void load()}>Retry</button>
        </div>
      )}

      {/* Table */}
      <DefaultTable.Container>
        <thead>
          <tr>
            <DefaultTable.Th onClick={() => setSortAsc(prev => prev === null ? true : !prev)} style={{ cursor: 'pointer', userSelect: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Customer ID {sortAsc === true && <ChevronUp size={14} />} {sortAsc === false && <ChevronDown size={14} />}
              </div>
            </DefaultTable.Th>
            <DefaultTable.Th>Name</DefaultTable.Th>
            <DefaultTable.Th>Address</DefaultTable.Th>
            <DefaultTable.Th>Pay Term</DefaultTable.Th>
            <DefaultTable.Th>Status</DefaultTable.Th>
            {canViewStamp && <DefaultTable.Th>Stamp</DefaultTable.Th>}
            {canActivate && <DefaultTable.Th style={{ textAlign: 'center' }}>Actions</DefaultTable.Th>}
          </tr>
        </thead>
        <tbody>
          {!loading && filtered.length === 0 && (
             <DefaultTable.Tr>
               <DefaultTable.Td colSpan={colCount} style={{ padding: '64px 32px', textAlign: 'center' }}>
                 <Inbox size={44} style={{ color: C.outlineVariant, opacity: 0.5 }} />
                 <p>{debouncedSearch ? `No archived results for "${debouncedSearch}"` : 'No archived customers'}</p>
               </DefaultTable.Td>
             </DefaultTable.Tr>
          )}

          {!loading && filtered.map((cust) => (
            <DeletedRow
              key={cust.custno}
              customer={cust}
              C={C}
              isDark={isDark}
              canViewStamp={canViewStamp}
              canActivate={canActivate}
              onActivate={setConfirmActivate}
            />
          ))}
        </tbody>
      </DefaultTable.Container>

      {/* Unified Action Modal (Configured for Restoring) */}
      <ActionModal
        isOpen={!!confirmActivate}
        title="Restore Customer?"
        description={
          <>
            <strong style={{ color: C.onSurface }}>{confirmActivate?.custname}</strong>{' '}
            <span style={{ fontFamily: 'monospace', fontSize: '12px', opacity: 0.8 }}>({confirmActivate?.custno})</span>{' '}
            will be moved back to the active customers list.
          </>
        }
        icon={<CheckCircle2 size={26} style={{ color: '#22c55e' }} />}
        iconBg="rgba(34,197,94,0.15)"
        confirmText="Restore"
        confirmColor="#22c55e"
        loading={actionLoading}
        error={actionError}
        C={C}
        isDark={isDark}
        onConfirm={handleActivate}
        onCancel={() => { setConfirmActivate(null); setActionError(null); }}
      />
    </div>
  );
};