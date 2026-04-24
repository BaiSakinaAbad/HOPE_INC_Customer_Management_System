import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, AlertTriangle, Users, ChevronUp, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';
import { useAuth } from '../../providers/AuthProvider';
import { useRights } from '../../hooks/useRights';
import { getCustomers, softDeleteCustomer, updateCustomer, createCustomer } from '../../services/customerService';
import type { Customer } from '../../types/customer';
import { DefaultTable, Button, SearchBar, DashboardHeader } from '../../components/ui';

// Import our new Feature Components
import { CustomerRow } from '../../components/customers/CustomerRow';
import { ActionModal } from '../../components/customers/ActionModal';
import { EditCustomerModal } from '../../components/customers/EditCustomerModal';
import { AddCustomerModal } from '../../components/customers/AddCustomerModal';

export const CustomerListPage: React.FC = () => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  const { role, user } = useAuth();
  const { canViewStamp, canSoftDelete } = useRights();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search state is much simpler now
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortAsc, setSortAsc] = useState<boolean | null>(null);
  
  // Modal State
  const [confirmDelete, setConfirmDelete] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: svcError } = await getCustomers(role ?? 'employee');
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

  const handleSoftDelete = async () => {
    if (!confirmDelete) return;
    setActionLoading(true);
    setActionError(null);
    const performedBy = (user?.user_metadata?.email as string | undefined) ?? user?.email ?? 'unknown';
    
    const { error: svcError } = await softDeleteCustomer(confirmDelete.custno, performedBy, role ?? 'employee');
    
    if (svcError) {
      setActionError(svcError);
    } else {
      setConfirmDelete(null);
      void load();
    }
    setActionLoading(false);
  };

  const handleEditSubmit = async (custno: string, data: Partial<Pick<Customer, 'custname' | 'address' | 'payterm'>>) => {
    setActionLoading(true);
    setActionError(null);
    const performedBy = (user?.user_metadata?.email as string | undefined) ?? user?.email ?? 'unknown';
    
    const { error: svcError } = await updateCustomer(custno, data, performedBy, role ?? 'employee');
    
    if (svcError) {
      setActionError(svcError);
    } else {
      setEditingCustomer(null);
      void load();
    }
    setActionLoading(false);
  };

  const handleAddSubmit = async (data: Pick<Customer, 'custname' | 'address' | 'payterm'>) => {
    setActionLoading(true);
    setActionError(null);
    const performedBy = (user?.user_metadata?.email as string | undefined) ?? user?.email ?? 'unknown';
    
    const { error: svcError } = await createCustomer(data, performedBy, role ?? 'employee');
    
    if (svcError) {
      setActionError(svcError);
    } else {
      setIsAddModalOpen(false);
      void load();
    }
    setActionLoading(false);
  };

  const colCount = 5 + (canViewStamp ? 1 : 0) + 1;

  const activeCount = customers.filter(c => c.recordstatus === 'ACTIVE').length;
  const inactiveCount = customers.filter(c => c.recordstatus === 'INACTIVE').length;
  const roleDisplay = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Unknown';

  return (
    <div style={{ flex: 1, padding: '32px 24px 48px', fontFamily: 'Inter, sans-serif' }}>
      
      <DashboardHeader
        title="Customer Registry"
        description="The central hub for your customer data. View detailed profiles, onboard new customers, or manage by deleting customers."
        note="* Note: Deletion is a soft-delete mechanism and can be reversed by an administrator."
        statsTitle="Registered Customers"
        totalCount={customers.length}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        roleDisplay={roleDisplay}
        policyDescription={
          canViewStamp 
            ? 'Stamp columns and administrative modifications are enabled for your current session.' 
            : 'You can view and manage active customers.'
        }
        actions={
          <>
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
            <Button compact style={{ width: 'auto', padding: '0 20px', height: '35px' }} onClick={() => setIsAddModalOpen(true)}>
              <Plus size={16} style={{ marginRight: '6px' }} /> Add Customer
            </Button>
          </>
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
        <div style={{ /* ... error styles */ }}>
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
            <DefaultTable.Th style={{ textAlign: 'center' }}>Actions</DefaultTable.Th>
          </tr>
        </thead>
        <tbody>
          {!loading && filtered.length === 0 && (
             <DefaultTable.Tr>
               <DefaultTable.Td colSpan={colCount} style={{ padding: '64px 32px', textAlign: 'center' }}>
                 <Users size={44} style={{ color: C.outlineVariant, opacity: 0.5 }} />
                 <p>{debouncedSearch ? `No results for "${debouncedSearch}"` : 'No customers found'}</p>
               </DefaultTable.Td>
             </DefaultTable.Tr>
          )}

          {!loading && filtered.map((cust) => (
            <CustomerRow
              key={cust.custno}
              customer={cust}
              C={C}
              isDark={isDark}
              canViewStamp={canViewStamp}
              canSoftDelete={canSoftDelete}
              onEdit={setEditingCustomer}
              onDelete={setConfirmDelete}
            />
          ))}
        </tbody>
      </DefaultTable.Container>

      {/* Unified Action Modal */}
      <ActionModal
        isOpen={!!confirmDelete}
        title="Archive Customer?"
        description={
          <>
            <strong style={{ color: C.onSurface }}>{confirmDelete?.custname}</strong>{' '}
            <span style={{ fontFamily: 'monospace', fontSize: '12px', opacity: 0.8 }}>({confirmDelete?.custno})</span>{' '}
            will be moved to the deleted list. An Admin or SuperAdmin can restore this record at any time.
          </>
        }
        icon={<AlertTriangle size={26} style={{ color: C.error }} />}
        iconBg={`${C.error}18`}
        confirmText="Archive"
        confirmColor={C.error}
        loading={actionLoading}
        error={actionError}
        C={C}
        isDark={isDark}
        onConfirm={handleSoftDelete}
        onCancel={() => { setConfirmDelete(null); setActionError(null); }}
      />

      <EditCustomerModal
        isOpen={!!editingCustomer}
        customer={editingCustomer}
        onClose={() => { setEditingCustomer(null); setActionError(null); }}
        onSave={handleEditSubmit}
        loading={actionLoading}
        error={actionError}
        C={C}
        isDark={isDark}
      />

      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setActionError(null); }}
        onAdd={handleAddSubmit}
        loading={actionLoading}
        error={actionError}
        C={C}
        isDark={isDark}
      />
    </div>
  );
};