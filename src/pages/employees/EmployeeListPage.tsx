import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, AlertTriangle, ShieldOff, Power, PowerOff, X, Check, Loader2, Lock, RotateCcw } from 'lucide-react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';
import { useAuth } from '../../providers/AuthProvider';
import { useRights } from '../../hooks/useRights';
import { getEmployees, updateEmployeeStatus, updateEmployeeRole } from '../../services/employeeService';
import { fetchUserPermissionsDetailed, updateUserPermission, resetPermissionsToDefaults } from '../../services/permissionService';
import type { DetailedPermission } from '../../services/permissionService';
import type { Employee, EmployeeRole, EmployeeStatus } from '../../types/employee';
import { DefaultTable, DashboardHeader } from '../../components/ui';
import { EmployeeRow } from '../../components/employees/EmployeeRow';
import { ActionModal } from '../../components/customers/ActionModal';

// ── Module display order for grouping permissions in the modal ────────────────
const MODULE_ORDER = ['Customer Module', 'Sales Module', 'Product Module', 'Admin Module'];

export const EmployeeListPage: React.FC = () => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  const { role, refreshPermissions } = useAuth();
  const { canManageEmployees, canChangeRoles, canDeactivateUsers, canActivateUsers } = useRights();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [pendingStatusAction, setPendingStatusAction] = useState<Employee | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [roleUpdatingUserId, setRoleUpdatingUserId] = useState<string | null>(null);

  // ── Permissions modal state ──
  const [viewingPermissionsFor, setViewingPermissionsFor] = useState<Employee | null>(null);
  const [detailedPermissions, setDetailedPermissions] = useState<DetailedPermission[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const [togglingPermId, setTogglingPermId] = useState<string | null>(null);
  const [activePermTab, setActivePermTab] = useState(MODULE_ORDER[0]);
  const [resettingPerms, setResettingPerms] = useState(false);

  /** Determine if the current user can edit the target's permissions. */
  const canEditTargetPermissions = useMemo(() => {
    if (!viewingPermissionsFor) return false;
    const targetRole = viewingPermissionsFor.role;
    const targetStatus = viewingPermissionsFor.recordstatus;
    const actorRole = (role ?? '').toLowerCase();

    // Only ACTIVE users can have permissions changed
    if (targetStatus !== 'ACTIVE') return false;

    // Superadmin can edit user and admin perms, but NOT other superadmins
    if (actorRole === 'superadmin') {
      return targetRole !== 'superadmin';
    }

    // Admin cannot edit permissions (they can only view user-role perms)
    return false;
  }, [viewingPermissionsFor, role]);

  // ── Load permissions when viewing ──
  useEffect(() => {
    if (!viewingPermissionsFor) {
      setDetailedPermissions([]);
      setPermissionsError(null);
      return;
    }
    const loadPerms = async () => {
      setPermissionsLoading(true);
      setPermissionsError(null);
      const { data, error: err } = await fetchUserPermissionsDetailed(viewingPermissionsFor.id, viewingPermissionsFor.role);
      if (err) {
        setPermissionsError(err);
        setDetailedPermissions([]);
      } else {
        setDetailedPermissions(data ?? []);
      }
      setPermissionsLoading(false);
    };
    void loadPerms();
  }, [viewingPermissionsFor]);

  const handleTogglePermission = async (permissionId: string, currentValue: boolean) => {
    if (!viewingPermissionsFor || !canEditTargetPermissions) return;
    setTogglingPermId(permissionId);
    setPermissionsError(null);
    const { error: err } = await updateUserPermission(
      viewingPermissionsFor.id,
      permissionId,
      !currentValue,
    );
    if (err) {
      // Show the error — do NOT update local state since DB didn't change
      setPermissionsError(err);
    } else {
      // Re-fetch from DB to ensure perfect sync
      const { data } = await fetchUserPermissionsDetailed(
        viewingPermissionsFor.id,
        viewingPermissionsFor.role,
      );
      if (data) setDetailedPermissions(data);
    }
    setTogglingPermId(null);
  };

  const handleResetPermissions = async () => {
    if (!viewingPermissionsFor || !canEditTargetPermissions) return;
    setResettingPerms(true);
    setPermissionsError(null);
    const { error: err } = await resetPermissionsToDefaults(
      viewingPermissionsFor.id,
      viewingPermissionsFor.role,
    );
    if (err) {
      setPermissionsError(err);
    } else {
      // Re-fetch from DB to reflect the reset
      const { data } = await fetchUserPermissionsDetailed(
        viewingPermissionsFor.id,
        viewingPermissionsFor.role,
      );
      if (data) setDetailedPermissions(data);
    }
    setResettingPerms(false);
  };

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
      // Refresh the current user's own permissions in case they were affected
      void refreshPermissions();
    }
    setRoleUpdatingUserId(null);
  };

  /**
   * Determine if "View Permissions" should appear for a given employee.
   *
   * - Users (role=user): Can't even access this page (gated above).
   * - Admin: Can see permissions for role=user only.
   *   Cannot see their own, other admins', or superadmins' permissions.
   * - Superadmin: Can see everyone's permissions.
   */
  const canViewPermissionsFor = (emp: Employee): boolean => {
    const actorRole = (role ?? '').toLowerCase();
    if (actorRole === 'superadmin') return true;
    if (actorRole === 'admin') return emp.role === 'user';
    return false;
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

  // ── Group permissions by module for the modal ──
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, DetailedPermission[]> = {};
    for (const perm of detailedPermissions) {
      const moduleName = perm.module_name || 'Other';
      if (!groups[moduleName]) groups[moduleName] = [];
      groups[moduleName].push(perm);
    }
    const ordered: { module: string; perms: DetailedPermission[] }[] = [];
    for (const m of MODULE_ORDER) {
      if (groups[m]) {
        ordered.push({ module: m, perms: groups[m] });
      }
    }
    for (const m of Object.keys(groups)) {
      if (!MODULE_ORDER.includes(m)) {
        ordered.push({ module: m, perms: groups[m] });
      }
    }
    return ordered;
  }, [detailedPermissions]);

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
        allowedActions={[
          'View Users',
          ...(canActivateUsers ? ['Activate Users'] : []),
          ...(canDeactivateUsers ? ['Deactivate Users'] : []),
          ...(canChangeRoles ? ['Change Roles'] : []),
        ]}
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
              canEditRole={canChangeRoles && emp.role !== 'superadmin' && emp.recordstatus === 'ACTIVE'}
              roleUpdating={roleUpdatingUserId === emp.id}
              onRoleChange={handleRoleChange}
              canEditStatus={
                emp.role !== 'superadmin' && (
                  emp.recordstatus === 'ACTIVE' ? canDeactivateUsers : canActivateUsers
                )
              }
              canViewPermissions={canViewPermissionsFor(emp)}
              onViewPermissions={setViewingPermissionsFor}
              showActions={(role ?? '').toLowerCase() !== 'user'}
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

      {/* ── Permissions Modal (DB-backed, tabbed) ── */}
      {viewingPermissionsFor && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <style>{`
            .perm-modal-body::-webkit-scrollbar { width: 6px; }
            .perm-modal-body::-webkit-scrollbar-track { background: transparent; margin: 8px 0; }
            .perm-modal-body::-webkit-scrollbar-thumb {
              background: ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'};
              border-radius: 3px;
            }
            .perm-modal-body::-webkit-scrollbar-thumb:hover {
              background: ${isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.22)'};
            }
            .perm-tab:hover {
              background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'} !important;
            }
          `}</style>
          <div style={{
            width: '100%', maxWidth: '600px', maxHeight: '85vh',
            backgroundColor: isDark ? C.surfaceContainerHigh : '#ffffff',
            borderRadius: '20px', border: `1px solid ${C.outlineVariant}33`,
            boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.1)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{ padding: '24px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.outlineVariant}33` }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: C.onSurface }}>Permissions</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: C.onSurfaceVariant }}>
                  {viewingPermissionsFor.username || viewingPermissionsFor.email} ({viewingPermissionsFor.role.toUpperCase()})
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {!canEditTargetPermissions && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', backgroundColor: `${C.onSurfaceVariant}15`, color: C.onSurfaceVariant, fontSize: '11px', fontWeight: 600 }}>
                    <Lock size={11} /> Read-only
                  </span>
                )}
                {viewingPermissionsFor.recordstatus !== 'ACTIVE' && canEditTargetPermissions && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', backgroundColor: `${C.error}15`, color: C.error, fontSize: '11px', fontWeight: 600 }}>
                    Inactive — read-only
                  </span>
                )}
                <button type="button" onClick={() => { setViewingPermissionsFor(null); setActivePermTab(MODULE_ORDER[0]); }} style={{ background: 'none', border: 'none', color: C.onSurfaceVariant, cursor: 'pointer', padding: '4px' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', padding: '0 16px', borderBottom: `1px solid ${C.outlineVariant}22` }}>
              {MODULE_ORDER.map((tab) => {
                const isActive = activePermTab === tab;
                const tabLabel = tab.replace(' Module', '');
                return (
                  <button
                    key={tab}
                    type="button"
                    className="perm-tab"
                    onClick={() => setActivePermTab(tab)}
                    style={{
                      flex: 1, padding: '12px 8px', border: 'none',
                      background: 'transparent', cursor: 'pointer',
                      fontSize: '12px', fontWeight: isActive ? 700 : 500,
                      color: isActive ? C.primary : C.onSurfaceVariant,
                      borderBottom: isActive ? `2px solid ${C.primary}` : '2px solid transparent',
                      transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                      letterSpacing: '0.02em', borderRadius: '6px 6px 0 0',
                    }}
                  >
                    {tabLabel}
                  </button>
                );
              })}
            </div>

            {/* Body */}
            <div
              className="perm-modal-body"
              style={{
                flex: 1, overflow: 'auto', padding: '4px 24px 24px',
                scrollbarWidth: 'thin',
                scrollbarColor: isDark ? 'rgba(255,255,255,0.15) transparent' : 'rgba(0,0,0,0.12) transparent',
              }}
            >
              {permissionsLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: '10px', color: C.onSurfaceVariant }}>
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '14px' }}>Loading permissions…</span>
                </div>
              ) : permissionsError ? (
                <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: `${C.error}15`, color: C.error, fontSize: '13px' }}>
                  {permissionsError}
                </div>
              ) : (
                (groupedPermissions.find(g => g.module === activePermTab)?.perms ?? []).map((perm) => (
                  <div key={perm.permission_id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 0', borderBottom: `1px solid ${C.outlineVariant}12`,
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ color: C.onSurface, fontSize: '14px', fontWeight: 500 }}>
                        {perm.description}
                      </span>
                      <span style={{ color: C.onSurfaceVariant, fontSize: '11px', fontFamily: 'monospace', opacity: 0.5 }}>
                        {perm.permission_id}
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={!canEditTargetPermissions || togglingPermId === perm.permission_id}
                      onClick={() => handleTogglePermission(perm.permission_id, perm.is_granted)}
                      style={{
                        width: '46px', height: '26px', borderRadius: '13px',
                        backgroundColor: perm.is_granted ? '#22c55e' : (isDark ? '#4a4a5a' : '#d1d5db'),
                        position: 'relative', border: 'none',
                        cursor: canEditTargetPermissions ? 'pointer' : 'default',
                        transition: 'background-color 0.2s', padding: 0,
                        opacity: canEditTargetPermissions ? 1 : 0.6, flexShrink: 0,
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: '2px',
                        left: perm.is_granted ? '22px' : '2px',
                        width: '22px', height: '22px', borderRadius: '50%',
                        backgroundColor: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }}>
                        {togglingPermId === perm.permission_id ? (
                          <Loader2 size={12} color={C.onSurfaceVariant} style={{ animation: 'spin 1s linear infinite' }} />
                        ) : perm.is_granted ? (
                          <Check size={12} color="#22c55e" strokeWidth={3} />
                        ) : (
                          <X size={12} color={isDark ? '#4a4a5a' : '#d1d5db'} strokeWidth={3} />
                        )}
                      </div>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer — Reset button */}
            {canEditTargetPermissions && (
              <div style={{
                padding: '12px 24px', borderTop: `1px solid ${C.outlineVariant}33`,
                display: 'flex', justifyContent: 'flex-end',
              }}>
                <button
                  type="button"
                  disabled={resettingPerms}
                  onClick={handleResetPermissions}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '8px',
                    border: `1px solid ${C.outlineVariant}44`,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    color: C.onSurfaceVariant, fontSize: '12px', fontWeight: 600,
                    cursor: resettingPerms ? 'not-allowed' : 'pointer',
                    opacity: resettingPerms ? 0.6 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  {resettingPerms ? (
                    <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <RotateCcw size={13} />
                  )}
                  Reset to Defaults
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
