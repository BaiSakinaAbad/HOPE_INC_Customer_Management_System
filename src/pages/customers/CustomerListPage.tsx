/**
 * Main customer management page layout.
 * Implements a responsive 60/40 split-screen view with a searchable, sortable master list 
 * of customers and a detailed right-hand side panel. Handles role-gated actions.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, AlertTriangle, Users, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';
import { useAuth } from '../../providers/AuthProvider';
import { useRights } from '../../hooks/useRights';
import { getCustomers, softDeleteCustomer, updateCustomer, createCustomer, getInactiveCustomerCount } from '../../services/customerService';
import type { Customer } from '../../types/customer';
import { DefaultTable, Button, SearchBar, DashboardHeader } from '../../components/ui';
import { useNavigation } from '../../providers/NavigationProvider';

// Import our new Feature Components
import { CustomerRow } from '../../components/customers/CustomerRow';
import { ActionModal } from '../../components/customers/ActionModal';
import { EditCustomerModal } from '../../components/customers/EditCustomerModal';
import { AddCustomerModal } from '../../components/customers/AddCustomerModal';
import { CustomerDetailsPanel } from '../../components/customers/CustomerDetailsPanel';
import { TableSkeleton } from '../../components/ui/Skeletons';

export const CustomerListPage: React.FC = () => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  const { role, user, permissions } = useAuth();
  const { canViewStamp, canSoftDelete, canEditCustomer: canEdit, canAddCustomer } = useRights();

  const metadata = user?.user_metadata ?? {};
  const fullName = (metadata.full_name as string | undefined)
    || `${(metadata.first_name as string | undefined) ?? ''} ${(metadata.last_name as string | undefined) ?? ''}`.trim();
  const displayName = fullName || (metadata.username as string | undefined) || user?.email || 'unknown';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inactiveTotal, setInactiveTotal] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  
  // Navigation context for initial filters
  const { navParams } = useNavigation();
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>(navParams?.statusFilter ?? 'ALL');

  // Search state is much simpler now
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortAsc, setSortAsc] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Reset page to 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);
  
  // Modal & Selection State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [{ data, count, error: svcError }, inactiveCount] = await Promise.all([
      getCustomers(role ?? 'employee', permissions, currentPage, itemsPerPage),
      getInactiveCustomerCount(role ?? 'employee', permissions),
    ]);
    setCustomers(svcError ? [] : (data ?? []));
    setTotalItems(count ?? 0);
    setInactiveTotal(inactiveCount);
    setError(svcError);
    setLoading(false);
  }, [role, permissions, currentPage, itemsPerPage]);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => {
    let result = customers;
    
    if (statusFilter !== 'ALL') {
      result = result.filter(cust => cust.recordstatus === statusFilter);
    }

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
  }, [customers, debouncedSearch, sortAsc, statusFilter]);

  const paginated = useMemo(() => {
    return filtered; // Server-side paginated
  }, [filtered]);

  const handleSoftDelete = async () => {
    if (!confirmDelete) return;
    setActionLoading(true);
    setActionError(null);
    const performedBy = displayName;
    
    const { error: svcError } = await softDeleteCustomer(
      confirmDelete.custno, 
      performedBy, 
      role ?? 'employee',
      confirmDelete.recordstatus,
      permissions,
    );
    
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
    const performedBy = displayName;
    
    const { error: svcError } = await updateCustomer(custno, data, performedBy, role ?? 'employee', permissions);
    
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
    const performedBy = displayName;
    
    const { error: svcError } = await createCustomer(data, performedBy, role ?? 'employee', permissions);
    
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
  const roleDisplay = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Unknown';
  // For elevated roles: total = active on page + all inactive in DB
  const displayTotal = canViewStamp ? activeCount + inactiveTotal : activeCount;

  return (
    <div className="flex w-full h-full overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* Left Panel (60% or 100%) */}
      <div className={`${selectedCustomer ? 'w-[60%]' : 'w-full'} h-full overflow-y-auto`} style={{ 
        padding: '32px 24px 48px', 
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column'
      }}>
      
     <DashboardHeader
        title="Customer Registry"
        description=""
        note="* Note: Deletion is a soft-delete mechanism and can be reversed by an administrator."
        statsTitle="Registered Customers"
        totalCount={displayTotal}
        activeCount={activeCount}
        inactiveCount={inactiveTotal}
        showInactiveCount={canViewStamp}
        roleDisplay={roleDisplay}
        policyDescription={
          canViewStamp 
            ? 'Stamp columns and administrative modifications are enabled for your current session.' 
            : 'You can view and manage active customers.'
        }
        showStatsCard={false}
        allowedActions={[
          'View Active Customers',
          ...(canViewStamp ? ['View Audit Stamps'] : []),
          ...(canAddCustomer ? ['Add Customers'] : []),
          ...(canEdit ? ['Edit Customers'] : []),
          ...(canSoftDelete ? ['Delete Customers'] : [])
        ]}
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
            {canAddCustomer && (
              <Button
                compact
                /* Test hook for the customer creation action. */
                data-testid="add-customer-btn"
                style={{ width: 'auto', padding: '0 20px', height: '35px' }}
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus size={16} style={{ marginRight: '6px' }} /> Add Customer
              </Button>
            )}
          </>
        }
      />

      {/* Extracted Search Bar & Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <SearchBar onSearch={setDebouncedSearch} placeholder="Search by name, address, code, pay term…" />
        </div>
        {canViewStamp && (
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={{ 
              padding: '9px 12px', 
              borderRadius: '8px', 
              border: `1px solid ${C.outlineVariant}55`, 
              backgroundColor: isDark ? C.surfaceContainer : '#fff',
              color: C.onSurface,
              fontSize: '13px',
              fontWeight: 500,
              outline: 'none'
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        )}
        {(debouncedSearch.trim() || statusFilter !== 'ALL') && !loading && (
          <span style={{ fontSize: '12px', color: C.onSurfaceVariant, padding: '5px 10px', borderRadius: '7px', backgroundColor: isDark ? `${C.surfaceContainerHigh}88` : `${C.outlineVariant}22` }}>
            {filtered.length} shown
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

      {/* Loading Skeleton */}
      {loading && <TableSkeleton rows={itemsPerPage} />}

      {/* Table */}
      {!loading && (
        <DefaultTable.Container
        pagination={{
          currentPage,
          totalPages: Math.ceil(totalItems / itemsPerPage),
          totalItems: totalItems,
          itemsPerPage,
          onPageChange: setCurrentPage,
        }}
      >
        <thead>
          <tr>
            <DefaultTable.Th onClick={() => setSortAsc(prev => prev === null ? true : !prev)} style={{ cursor: 'pointer', userSelect: 'none', width: '12%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Customer ID {sortAsc === true && <ChevronUp size={14} />} {sortAsc === false && <ChevronDown size={14} />}
              </div>
            </DefaultTable.Th>
            <DefaultTable.Th style={{ width: '18%' }}>Name</DefaultTable.Th>
            <DefaultTable.Th style={{ width: '20%' }}>Address</DefaultTable.Th>
            <DefaultTable.Th style={{ width: '10%' }}>Pay Term</DefaultTable.Th>
            <DefaultTable.Th style={{ width: '10%' }}>Status</DefaultTable.Th>
            {/* Test hook for stamp column visibility checks. */}
            {canViewStamp && <DefaultTable.Th data-testid="stamp-column" className="w-1/4 truncate text-ellipsis overflow-hidden whitespace-nowrap">Stamp</DefaultTable.Th>}
            <DefaultTable.Th style={{ textAlign: 'center', width: '10%' }}>Actions</DefaultTable.Th>
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

          {!loading && paginated.map((cust) => (
            <CustomerRow
              key={cust.custno}
              customer={cust}
              C={C}
              isDark={isDark}
              canViewStamp={canViewStamp}
              canSoftDelete={canSoftDelete}
              canEdit={canEdit}
              isSelected={selectedCustomer?.custno === cust.custno}
              onClick={() => setSelectedCustomer(cust.custno === selectedCustomer?.custno ? null : cust)}
              onEdit={setEditingCustomer}
              onDelete={setConfirmDelete}
            />
          ))}
        </tbody>
      </DefaultTable.Container>
      )}

      </div>

      {/* Right Panel (40%) */}
      {selectedCustomer && (
        <div className="w-[40%] h-full overflow-y-auto">
          <CustomerDetailsPanel
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
            C={C}
            isDark={isDark}
          />
        </div>
      )}

      <ActionModal
        isOpen={!!confirmDelete}
        title="Delete Customer"
        description={
          <>
            This will soft-delete the customer "{confirmDelete?.custname}". The record will be hidden from regular users but can be recovered by Admin or SuperAdmin.
          </>
        }
        confirmText="Delete"
        confirmColor="#e60000"
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
