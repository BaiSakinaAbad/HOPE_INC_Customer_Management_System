import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, AlertTriangle, ShieldOff, Power, PowerOff, ShieldBan } from 'lucide-react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';
import { useAuth } from '../../providers/AuthProvider';
import { useRights } from '../../hooks/useRights';
import { getEmployees, updateEmployeeStatus, updateEmployeeRole } from '../../services/employeeService';
import type { Employee, EmployeeRole, EmployeeStatus } from '../../types/employee';
import { DefaultTable, DashboardHeader } from '../../components/ui';
import { EmployeeRow } from '../../components/employees/EmployeeRow';
import { ActionModal } from '../../components/customers/ActionModal'; // Reusing the generic modal!

export const EmployeeListPage: React.FC = () => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  const { role, user } = useAuth();
  const { canManageEmployees } = useRights();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modal State
  const [pendingStatusAction, setPendingStatusAction] = useState<{ employee: Employee; action: 'deactivate' | 'block' } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [roleUpdatingEmpno, setRoleUpdatingEmpno] = useState<string | null>(null);

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
    const performedBy = (user?.user_metadata?.email as string | undefined) ?? user?.email ?? 'unknown';

    const { employee, action } = pendingStatusAction;
    const { error: svcError } = await updateEmployeeStatus(
      employee.empno,
      employee.role,
      employee.user_id,
      employee.recordstatus,
      action,
      performedBy,
      role ?? 'admin',
      user?.id ?? '',
    );

    if (svcError) {
      setActionError(svcError);
    } else {
      let nextStatus: EmployeeStatus = employee.recordstatus;
      if (action === 'deactivate') {
        nextStatus = employee.recordstatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      } else {
        nextStatus = employee.recordstatus === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
      }
      setEmployees((prev) => prev.map((emp) => (
        emp.empno === employee.empno ? { ...emp, recordstatus: nextStatus } : emp
      )));
      setPendingStatusAction(null);
    }
    setActionLoading(false);
  };

  const handleRoleChange = async (employee: Employee, newRole: EmployeeRole) => {
    if (employee.role === newRole) return;
    setRoleUpdatingEmpno(employee.empno);
    setActionError(null);
    const performedBy = (user?.user_metadata?.email as string | undefined) ?? user?.email ?? 'unknown';
    const { error: svcError } = await updateEmployeeRole(
      employee.empno,
      employee.role,
      newRole,
      performedBy,
      role ?? 'admin',
    );
    if (svcError) {
      setActionError(svcError);
    } else {
      setEmployees((prev) => prev.map((emp) => (
        emp.empno === employee.empno ? { ...emp, role: newRole } : emp
      )));
    }
    setRoleUpdatingEmpno(null);
  };

  if (!canManageEmployees) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: '16px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '20px', backgroundColor: `${C.error}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShieldOff size={36} style={{ color: C.error }} />
        </div>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '24px', fontWeight: 800, color: isDark ? '#fff' : '#1a1a2e', margin: 0 }}>Access Denied</h2>
        <p style={{ fontSize: '14px', color: C.onSurfaceVariant, maxWidth: '360px', textAlign: 'center', lineHeight: 1.6 }}>Employee management requires Admin or SuperAdmin privileges.</p>
      </div>
    );
  }

  const activeCount = employees.filter(e => e.recordstatus === 'ACTIVE').length;
  const inactiveCount = employees.filter(e => e.recordstatus === 'INACTIVE').length;
  const blockedCount = employees.filter(e => e.recordstatus === 'BLOCKED').length;
  const roleDisplay = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Unknown';
  const isDeactivateAction = pendingStatusAction?.action === 'deactivate';
  const pendingIsActive = pendingStatusAction?.employee.recordstatus === 'ACTIVE';
  const pendingIsBlocked = pendingStatusAction?.employee.recordstatus === 'BLOCKED';

  return (
    <div style={{ flex: 1, padding: '32px 24px 48px', fontFamily: 'Inter, sans-serif' }}>

      <DashboardHeader
        title="Employee Registry"
        description="Manage employee records and activation status for user accounts."
        statsTitle="Registered Employees"
        totalCount={employees.length}
        activeCount={activeCount}
        inactiveCount={inactiveCount}
        blockedCount={blockedCount}
        roleDisplay={roleDisplay}
        policyDescription="You can view all employee records and toggle employee activation status."
        allowedActions={['View Employees', 'Activate Employees', 'Deactivate Employees']}
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

      {/* Table */}
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
            <DefaultTable.Th>Emp No</DefaultTable.Th>
            <DefaultTable.Th>Name</DefaultTable.Th>
            <DefaultTable.Th>Gender</DefaultTable.Th>
            <DefaultTable.Th>Birthdate</DefaultTable.Th>
            <DefaultTable.Th>Hire Date</DefaultTable.Th>
            <DefaultTable.Th>Sep Date</DefaultTable.Th>
            <DefaultTable.Th>Role</DefaultTable.Th>
            <DefaultTable.Th>Status</DefaultTable.Th>
            <DefaultTable.Th style={{ textAlign: 'center' }}>Actions</DefaultTable.Th>
          </tr>
        </thead>
        <tbody>
          {!loading && paginated.map((emp) => (
            (() => {
              const actorRole = (role ?? '').toLowerCase();
              const isSelf = (user?.id ?? '') === emp.user_id;
              const canBlockAction = actorRole === 'superadmin'
                || (actorRole === 'admin' && (emp.role === 'employee' || (emp.role === 'admin' && isSelf)));
              const blockActionDisabledReason = actorRole === 'admin' && !canBlockAction
                ? 'Admins can only block/unblock themselves and employees.'
                : '';
              return (
            <EmployeeRow
              key={emp.empno}
              employee={emp}
              C={C}
              isDark={isDark}
              onStatusAction={(employee, actionType) => setPendingStatusAction({ employee, action: actionType })}
              canEditRole={role === 'superadmin' && emp.role !== 'superadmin'}
              canBlockAction={canBlockAction}
              blockActionDisabledReason={blockActionDisabledReason}
              roleUpdating={roleUpdatingEmpno === emp.empno}
              onRoleChange={handleRoleChange}
            />
              );
            })()
          ))}
        </tbody>
      </DefaultTable.Container>

      {/* Reusable Action Modal */}
      <ActionModal
        isOpen={!!pendingStatusAction}
        title={
          isDeactivateAction
            ? (pendingIsActive ? 'Deactivate Employee?' : pendingIsBlocked ? 'Status Update Unavailable' : 'Activate Employee?')
            : (pendingIsBlocked ? 'Unblock Employee?' : 'Block Employee?')
        }
        description={
          <>
            <strong style={{ color: C.onSurface }}>{pendingStatusAction?.employee.lastname}, {pendingStatusAction?.employee.firstname}</strong>{' '}
            <span style={{ fontFamily: 'monospace', fontSize: '12px', opacity: 0.8 }}>({pendingStatusAction?.employee.empno})</span>{' '}
            {isDeactivateAction
              ? (pendingIsActive
                ? 'will be marked as INACTIVE.'
                : pendingIsBlocked
                  ? 'is currently BLOCKED and cannot be deactivated.'
                  : 'will be marked as ACTIVE.')
              : (pendingIsBlocked ? 'will be marked as ACTIVE.' : 'will be marked as BLOCKED.')}
          </>
        }
        icon={
          isDeactivateAction
            ? (pendingIsActive ? <PowerOff size={26} style={{ color: C.error }} /> : <Power size={26} style={{ color: '#22c55e' }} />)
            : <ShieldBan size={26} style={{ color: C.error }} />
        }
        iconBg={(isDeactivateAction && !pendingIsActive) ? 'rgba(34,197,94,0.15)' : `${C.error}18`}
        confirmText={isDeactivateAction ? (pendingIsActive ? 'Deactivate' : 'Activate') : (pendingIsBlocked ? 'Unblock' : 'Block')}
        confirmColor={isDeactivateAction ? (pendingIsActive ? C.error : '#22c55e') : C.error}
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