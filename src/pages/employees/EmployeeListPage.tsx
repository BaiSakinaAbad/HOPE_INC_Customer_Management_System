import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, AlertTriangle, ShieldOff, Power, PowerOff } from 'lucide-react';
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
    </div>
  );
};
