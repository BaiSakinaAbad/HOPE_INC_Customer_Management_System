import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, AlertTriangle, Inbox, ShieldOff, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';
import { useAuth } from '../../providers/AuthProvider';
import { useRights } from '../../hooks/useRights';
import { getDeletedCustomers, activateCustomer } from '../..//services/customerService';
import type { Customer } from '../../types/customer';
import { DefaultTable, SearchBar, DashboardHeader } from '../../components/ui';

// Import our reusable feature components
import { ActionModal } from '../../components/customers/ActionModal';
import { DeletedRow } from '../../components/customers/DeletedRow';

export const DeletedCustomersPage: React.FC = () => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  const { role, user } = useAuth();
  const { canViewInactive, canActivate, canViewStamp } = useRights();

  const metadata = user?.user_metadata ?? {};
  const fullName = (metadata.full_name as string | undefined)
    || `${(metadata.first_name as string | undefined) ?? ''} ${(metadata.last_name as string | undefined) ?? ''}`.trim();
  const displayName = fullName || (metadata.username as string | undefined) || user?.email || 'unknown';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortAsc, setSortAsc] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);
  
  // Modal State
  const [confirmActivate, setConfirmActivate] = useState<Customer | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: svcError } = await getDeletedCustomers(role ?? 'employee');
    setCustomers(svcError ? [] : (data ?? []));
    setError(svcError);
    setLoading(false);
  }, [role]);

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

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const handleActivate = async () => {
    if (!confirmActivate) return;
    setActionLoading(true);
    setActionError(null);
    const performedBy = displayName;
    
    let targetStatus: 'ACTIVE' | 'INACTIVE' = 'ACTIVE';
    if (confirmActivate.stamp && confirmActivate.stamp.includes('Deleted [INACTIVE]')) {
      targetStatus = 'INACTIVE';
    }

    const { error: svcError } = await activateCustomer(
      confirmActivate.custno, 
      performedBy, 
      role ?? 'admin',
      targetStatus
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
      
      <DashboardHeader
        title="Deleted Customers"
        description="View and manage soft-deleted customer records. These records are hidden from regular users but remain in the database for auditing and recovery."
        statsTitle="Archived Customers"
        totalCount={customers.length}
        chartType="none"
        roleDisplay={role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Unknown'}
        policyDescription="You have access to view and restore archived customer records."
        allowedActions={[
          'View Archived Customers',
          ...(canViewStamp ? ['View Audit Stamps'] : []),
          ...(canActivate ? ['Restore Customers'] : [])
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
        <SearchBar onSearch={setDebouncedSearch} placeholder="Search by name, address, code, pay term…" />
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

          {!loading && paginated.map((cust) => (
            <DeletedRow
              key={cust.custno}
              customer={cust}
              C={C}
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
            will be restored to its previous state ({confirmActivate?.stamp?.includes('Deleted [INACTIVE]') ? 'INACTIVE' : 'ACTIVE'}).
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
