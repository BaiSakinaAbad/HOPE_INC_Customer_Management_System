import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, AlertTriangle, ShieldOff, Power, PowerOff } from 'lucide-react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';
import { useAuth } from '../../providers/AuthProvider';
import { useRights } from '../../hooks/useRights';
import { getEmployees, toggleEmployeeStatus } from '../../services/employeeService';
import type { Employee } from '../../types/employee';
import { DefaultTable } from '../../components/ui';
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
  
  // Modal State
  const [confirmToggle, setConfirmToggle] = useState<Employee | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: svcError } = await getEmployees();
    setEmployees(svcError ? [] : (data ?? []));
    setError(svcError);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleToggle = async () => {
    if (!confirmToggle) return;
    setActionLoading(true);
    setActionError(null);
    const performedBy = (user?.user_metadata?.email as string | undefined) ?? user?.email ?? 'unknown';
    
    const { error: svcError } = await toggleEmployeeStatus(confirmToggle.empno, confirmToggle.recordstatus, performedBy, role ?? 'admin');
    
    if (svcError) {
      setActionError(svcError);
    } else {
      setConfirmToggle(null);
      void load();
    }
    setActionLoading(false);
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

  const isTogglingActive = confirmToggle?.recordstatus === 'ACTIVE';

  return (
    <div style={{ flex: 1, padding: '32px 24px 48px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '28px', fontWeight: 800, color: isDark ? '#fff' : '#1a1a2e', margin: 0, lineHeight: 1.1 }}>Employees (Temp)</h2>
          <p style={{ fontSize: '13px', color: C.onSurfaceVariant, margin: '6px 0 0' }}>{loading ? 'Loading records…' : `${employees.length} personnel records`}</p>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 16px', borderRadius: '10px', border: `1px solid ${C.outlineVariant}55`, backgroundColor: 'transparent', color: C.onSurfaceVariant, fontSize: '13px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', backgroundColor: `${C.error}18`, border: `1px solid ${C.error}33`, color: C.error, fontSize: '13px' }}>
          <AlertTriangle size={16} /> <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <DefaultTable.Container>
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
          {!loading && employees.map((emp) => (
            <EmployeeRow
              key={emp.empno}
              employee={emp}
              C={C}
              isDark={isDark}
              onToggleStatus={setConfirmToggle}
            />
          ))}
        </tbody>
      </DefaultTable.Container>

      {/* Reusable Action Modal */}
      <ActionModal
        isOpen={!!confirmToggle}
        title={isTogglingActive ? "Deactivate Employee?" : "Activate Employee?"}
        description={
          <>
            <strong style={{ color: C.onSurface }}>{confirmToggle?.lastname}, {confirmToggle?.firstname}</strong>{' '}
            <span style={{ fontFamily: 'monospace', fontSize: '12px', opacity: 0.8 }}>({confirmToggle?.empno})</span>{' '}
            will be marked as {isTogglingActive ? 'INACTIVE' : 'ACTIVE'}.
          </>
        }
        icon={isTogglingActive ? <PowerOff size={26} style={{ color: C.error }} /> : <Power size={26} style={{ color: '#22c55e' }} />}
        iconBg={isTogglingActive ? `${C.error}18` : 'rgba(34,197,94,0.15)'}
        confirmText={isTogglingActive ? "Deactivate" : "Activate"}
        confirmColor={isTogglingActive ? C.error : '#22c55e'}
        loading={actionLoading}
        error={actionError}
        C={C}
        isDark={isDark}
        onConfirm={handleToggle}
        onCancel={() => { setConfirmToggle(null); setActionError(null); }}
      />
    </div>
  );
};