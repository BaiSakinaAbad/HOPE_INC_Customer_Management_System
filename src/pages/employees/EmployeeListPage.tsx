import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, AlertTriangle, ShieldOff, Power, PowerOff, X, Check } from 'lucide-react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';
import { useAuth } from '../../providers/AuthProvider';
import { useRights } from '../../hooks/useRights';
import { getEmployees, updateEmployeeStatus, updateEmployeeRole } from '../../services/employeeService';
import type { Employee, EmployeeRole, EmployeeStatus } from '../../types/employee';
import { DefaultTable, DashboardHeader } from '../../components/ui';
import { EmployeeRow } from '../../components/employees/EmployeeRow';
import { ActionModal } from '../../components/customers/ActionModal';

export const EmployeeListPage: React.FC = () => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  const { role } = useAuth();
  const { canManageEmployees } = useRights();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [pendingStatusAction, setPendingStatusAction] = useState<Employee | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [roleUpdatingUserId, setRoleUpdatingUserId] = useState<string | null>(null);

  const [viewingPermissionsFor, setViewingPermissionsFor] = useState<Employee | null>(null);
  const [localPermissions, setLocalPermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (viewingPermissionsFor) {
      const r = viewingPermissionsFor.role;
      setLocalPermissions({
        admin_activate_user: r === 'admin' || r === 'superadmin',
        add_customer: true,
        soft_delete_customer: r === 'admin' || r === 'superadmin',
        edit_customer: true,
        view_customers: true,
        view_price_history: r === 'admin' || r === 'superadmin',
        view_products: true,
        view_sales: true,
        view_sales_detail: true,
      });
    }
  }, [viewingPermissionsFor]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: svcError } = await getEmployees();
    setEmployees(svcError ? [] : (data ?? []));
    setError(svcError);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    setCurrentPage(1);
  }, [employees.length]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return employees.slice(start, start + itemsPerPage);
  }, [employees, currentPage]);

  const handleStatusAction = async () => {
    if (!pendingStatusAction) return;
    setActionLoading(true);
    setActionError(null);

    const { error: svcError } = await updateEmployeeStatus(
      pendingStatusAction.id,
      pendingStatusAction.recordstatus,
    );

    if (svcError) {
      setActionError(svcError);
    } else {
      const nextStatus: EmployeeStatus = pendingStatusAction.recordstatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      setEmployees((prev) => prev.map((emp) => (
        emp.id === pendingStatusAction.id ? { ...emp, recordstatus: nextStatus } : emp
      )));
      setPendingStatusAction(null);
    }
    setActionLoading(false);
  };

  const handleRoleChange = async (employee: Employee, newRole: EmployeeRole) => {
    if (employee.role === newRole) return;
    setRoleUpdatingUserId(employee.id);
    setActionError(null);
    const { error: svcError } = await updateEmployeeRole(
      employee.id,
      employee.role,
      newRole,
      role ?? 'admin',
    );
    if (svcError) {
      setActionError(svcError);
    } else {
      setEmployees((prev) => prev.map((emp) => (
        emp.id === employee.id ? { ...emp, role: newRole } : emp
      )));
    }
    setRoleUpdatingUserId(null);
  };

  if (!canManageEmployees) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '16px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '20px', backgroundColor: `${C.error}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldOff size={36} style={{ color: C.error }} />
        </div>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '24px', fontWeight: 800, color: isDark ? '#fff' : '#1a1a2e', margin: 0 }}>Access Denied</h2>
        <p style={{ fontSize: '14px', color: C.onSurfaceVariant, maxWidth: '360px', textAlign: 'center', lineHeight: 1.6 }}>User management requires Admin or SuperAdmin privileges.</p>
      </div>
    );
  }

  const activeCount = employees.filter(e => e.recordstatus === 'ACTIVE').length;
  const inactiveCount = employees.filter(e => e.recordstatus === 'INACTIVE').length;
  const roleDisplay = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Unknown';
  const pendingIsActive = pendingStatusAction?.recordstatus === 'ACTIVE';

  return (
    <div style={{ flex: 1, padding: '32px 24px 48px', fontFamily: 'Inter, sans-serif' }}>
      <DashboardHeader
        title="User Registry"
        description="Manage application users, roles, and activation status."
        statsTitle="Registered Users"
        totalCount={employees.length}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        roleDisplay={roleDisplay}
        policyDescription="You can view all app users and manage roles for active accounts."
        allowedActions={['View Users', 'Activate Users', 'Deactivate Users', 'Change Roles']}
        actions={(
          <button type="button" onClick={() => void load()} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 16px', borderRadius: '10px', border: `1px solid ${C.outlineVariant}55`, backgroundColor: 'transparent', color: C.onSurfaceVariant, fontSize: '13px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
          </button>
        )}
      />

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', backgroundColor: `${C.error}18`, border: `1px solid ${C.error}33`, color: C.error, fontSize: '13px' }}>
          <AlertTriangle size={16} /> <span>{error}</span>
        </div>
      )}
      {actionError && !pendingStatusAction && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', backgroundColor: `${C.error}18`, border: `1px solid ${C.error}33`, color: C.error, fontSize: '13px' }}>
          <AlertTriangle size={16} /> <span>{actionError}</span>
        </div>
      )}

      <DefaultTable.Container
        pagination={{
          currentPage,
          totalPages: Math.ceil(employees.length / itemsPerPage),
          totalItems: employees.length,
          itemsPerPage,
          onPageChange: setCurrentPage,
        }}
      >
        <thead>
          <tr>
            <DefaultTable.Th>User ID</DefaultTable.Th>
            <DefaultTable.Th>Username</DefaultTable.Th>
            <DefaultTable.Th>Email</DefaultTable.Th>
            <DefaultTable.Th>Role</DefaultTable.Th>
            <DefaultTable.Th>Status</DefaultTable.Th>
            <DefaultTable.Th style={{ textAlign: 'center' }}>Actions</DefaultTable.Th>
          </tr>
        </thead>
        <tbody>
          {!loading && paginated.map((emp) => (
            <EmployeeRow
              key={emp.id}
              employee={emp}
              C={C}
              isDark={isDark}
              onStatusAction={setPendingStatusAction}
              canEditRole={role === 'superadmin' && emp.role !== 'superadmin'}
              roleUpdating={roleUpdatingUserId === emp.id}
              onRoleChange={handleRoleChange}
              canEditStatus={emp.role !== 'superadmin'}
              onViewPermissions={setViewingPermissionsFor}
            />
          ))}
        </tbody>
      </DefaultTable.Container>

      <ActionModal
        isOpen={!!pendingStatusAction}
        title={pendingIsActive ? 'Deactivate User?' : 'Activate User?'}
        description={
          <>
            <strong style={{ color: C.onSurface }}>{pendingStatusAction?.username || pendingStatusAction?.email}</strong>{' '}
            <span style={{ fontFamily: 'monospace', fontSize: '12px', opacity: 0.8 }}>
              ({pendingStatusAction?.id?.slice(0, 8)})
            </span>{' '}
            will be marked as {pendingIsActive ? 'INACTIVE' : 'ACTIVE'}.
          </>
        }
        icon={pendingIsActive ? <PowerOff size={26} style={{ color: C.error }} /> : <Power size={26} style={{ color: '#22c55e' }} />}
        iconBg={pendingIsActive ? `${C.error}18` : 'rgba(34,197,94,0.15)'}
        confirmText={pendingIsActive ? 'Deactivate' : 'Activate'}
        confirmColor={pendingIsActive ? C.error : '#22c55e'}
        loading={actionLoading}
        error={actionError}
        C={C}
        isDark={isDark}
        onConfirm={handleStatusAction}
        onCancel={() => { setPendingStatusAction(null); setActionError(null); }}
      />

      {viewingPermissionsFor && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <div style={{
            width: '100%', maxWidth: '600px',
            backgroundColor: isDark ? C.surfaceContainerHigh : '#ffffff',
            borderRadius: '20px', border: `1px solid ${C.outlineVariant}33`,
            boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.1)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '24px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.outlineVariant}33` }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: C.onSurface }}>Permissions (UI no functionality)</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: C.onSurfaceVariant }}>
                  {viewingPermissionsFor.username || viewingPermissionsFor.email} ({viewingPermissionsFor.role.toUpperCase()})
                </p>
              </div>
              <button type="button" onClick={() => setViewingPermissionsFor(null)} style={{ background: 'none', border: 'none', color: C.onSurfaceVariant, cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '8px 24px 24px', display: 'flex', flexDirection: 'column' }}>
              {[
                { id: 'admin_activate_user', label: 'Admin Activate User' },
                { id: 'add_customer', label: 'Add Customer' },
                { id: 'soft_delete_customer', label: 'Soft Delete Customer' },
                { id: 'edit_customer', label: 'Edit Customer' },
                { id: 'view_customers', label: 'View Customers' },
                { id: 'view_price_history', label: 'View Price History' },
                { id: 'view_products', label: 'View Products' },
                { id: 'view_sales', label: 'View Sales' },
                { id: 'view_sales_detail', label: 'View Sales Detail' },
              ].map(perm => (
                <div key={perm.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${C.outlineVariant}15` }}>
                  <span style={{ color: C.onSurface, fontSize: '14px', fontWeight: 500 }}>{perm.label}</span>
                  <button 
                    type="button" 
                    onClick={() => setLocalPermissions(prev => ({ ...prev, [perm.id]: !prev[perm.id] }))}
                    style={{
                      width: '46px', height: '26px', borderRadius: '13px',
                      backgroundColor: localPermissions[perm.id] ? '#22c55e' : C.error,
                      position: 'relative', border: 'none', cursor: 'pointer',
                      transition: 'background-color 0.2s', padding: 0
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: '2px', left: localPermissions[perm.id] ? '22px' : '2px',
                      width: '22px', height: '22px', borderRadius: '50%',
                      backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }}>
                      {localPermissions[perm.id] ? <Check size={12} color="#22c55e" strokeWidth={3} /> : <X size={12} color={C.error} strokeWidth={3} />}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
