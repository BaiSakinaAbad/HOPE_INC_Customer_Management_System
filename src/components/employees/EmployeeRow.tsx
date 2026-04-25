import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, MoreHorizontal, PowerOff, ShieldBan } from 'lucide-react';
import { type DashboardTokens } from '../../providers/ThemeProvider';
import { type Employee, type EmployeeRole, type EmployeeStatus } from '../../types/employee';
import { DefaultTable } from '../../components/ui/DefaultTable';

interface EmployeeRowProps {
  employee: Employee;
  C: DashboardTokens;
  isDark: boolean;
  onStatusAction: (employee: Employee, actionType: 'deactivate' | 'block') => void;
  canEditRole: boolean;
  canBlockAction: boolean;
  blockActionDisabledReason?: string;
  roleUpdating: boolean;
  onRoleChange: (employee: Employee, newRole: EmployeeRole) => void;
}

export const EmployeeRow: React.FC<EmployeeRowProps> = React.memo(({
  employee: e, C, isDark, onStatusAction, canEditRole, canBlockAction, blockActionDisabledReason, roleUpdating, onRoleChange,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isActive = e.recordstatus === 'ACTIVE';
  const isInactive = e.recordstatus === 'INACTIVE';
  const isBlocked = e.recordstatus === 'BLOCKED';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const statusStyles: Record<EmployeeStatus, { bg: string; fg: string; border: string }> = {
    ACTIVE: {
      bg: 'rgba(34,197,94,0.12)',
      fg: '#22c55e',
      border: 'rgba(34,197,94,0.28)',
    },
    INACTIVE: {
      bg: 'rgba(120,120,140,0.10)',
      fg: '#888898',
      border: 'rgba(120,120,140,0.22)',
    },
    BLOCKED: {
      bg: `${C.error}22`,
      fg: C.error,
      border: `${C.error}66`,
    },
  };
  const statusColor = statusStyles[e.recordstatus];

  return (
    <DefaultTable.Tr>
      <DefaultTable.Td style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: C.primary }}>
        {e.empno}
      </DefaultTable.Td>
      <DefaultTable.Td style={{ fontWeight: 600 }}>
        {e.lastname}, {e.firstname}
      </DefaultTable.Td>
      <DefaultTable.Td style={{ color: C.onSurfaceVariant }}>{e.gender}</DefaultTable.Td>
      <DefaultTable.Td style={{ color: C.onSurfaceVariant, fontSize: '12px' }}>{e.birthdate}</DefaultTable.Td>
      <DefaultTable.Td style={{ color: C.onSurfaceVariant, fontSize: '12px' }}>{e.hiredate}</DefaultTable.Td>
      <DefaultTable.Td style={{ color: C.onSurfaceVariant, fontSize: '12px' }}>{e.sepdate || '—'}</DefaultTable.Td>
      <DefaultTable.Td>
        {canEditRole ? (
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <select
              value={e.role}
              disabled={roleUpdating}
              onChange={(ev) => onRoleChange(e, ev.target.value as EmployeeRole)}
              style={{
                minWidth: '132px',
                padding: '6px 30px 6px 10px',
                borderRadius: '9px',
                border: `1px solid ${isDark ? `${C.outlineVariant}88` : `${C.outlineVariant}66`}`,
                backgroundColor: roleUpdating
                  ? (isDark ? `${C.surfaceContainerHighest}aa` : '#eef0f3')
                  : (isDark ? C.surfaceContainerHigh : '#ffffff'),
                color: C.primary,
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                cursor: roleUpdating ? 'not-allowed' : 'pointer',
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                boxShadow: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.03)' : 'inset 0 1px 0 rgba(255,255,255,0.75)',
              }}
            >
              <option value="employee">EMPLOYEE</option>
              <option value="admin">ADMIN</option>
              <option value="superadmin">SUPERADMIN</option>
            </select>
            <ChevronDown
              size={14}
              style={{
                position: 'absolute',
                right: '10px',
                pointerEvents: 'none',
                color: roleUpdating ? C.onSurfaceVariant : C.primary,
                opacity: roleUpdating ? 0.6 : 0.9,
              }}
            />
          </div>
        ) : (
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.primary }}>
            {e.role}
          </span>
        )}
      </DefaultTable.Td>
      <DefaultTable.Td>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
          backgroundColor: statusColor.bg,
          color: statusColor.fg,
          border: `1px solid ${statusColor.border}`,
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0, backgroundColor: statusColor.fg }} />
          {e.recordstatus}
        </span>
      </DefaultTable.Td>
      <DefaultTable.Td style={{ textAlign: 'center' }}>
        <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              background: dropdownOpen ? `${C.primary}15` : 'none',
              border: 'none',
              cursor: 'pointer',
              color: dropdownOpen ? C.primary : C.onSurfaceVariant,
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            aria-label="Employee actions"
          >
            <MoreHorizontal size={18} />
          </button>

          {dropdownOpen && (
            <div style={{
              position: 'absolute', right: 0, top: '100%', zIndex: 10,
              minWidth: '150px', marginTop: '4px',
              backgroundColor: isDark ? C.surfaceContainerHigh : '#ffffff',
              border: `1px solid ${C.outlineVariant}33`,
              borderRadius: '8px',
              boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 14px rgba(0,0,0,0.08)',
              padding: '4px', display: 'flex', flexDirection: 'column', gap: '2px',
              textAlign: 'left',
            }}>
              <button
                type="button"
                disabled={isBlocked}
                onClick={() => { setDropdownOpen(false); onStatusAction(e, 'deactivate'); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', padding: '8px 12px', border: 'none',
                  background: 'transparent',
                  color: isBlocked ? C.onSurfaceVariant : C.error,
                  fontSize: '13px', fontWeight: 500,
                  borderRadius: '6px', cursor: isBlocked ? 'not-allowed' : 'pointer', textAlign: 'left',
                  opacity: isBlocked ? 0.55 : 1,
                }}
                title={isBlocked ? 'Blocked users cannot be deactivated.' : ''}
              >
                <PowerOff size={15} style={{ color: isBlocked ? C.onSurfaceVariant : C.error }} />
                {isActive ? 'Deactivate' : 'Activate'}
              </button>

              <button
                type="button"
                disabled={isInactive || !canBlockAction}
                onClick={() => { setDropdownOpen(false); onStatusAction(e, 'block'); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', padding: '8px 12px', border: 'none',
                  background: 'transparent',
                  color: (isInactive || !canBlockAction) ? C.onSurfaceVariant : C.error,
                  fontSize: '13px', fontWeight: 500,
                  borderRadius: '6px', cursor: (isInactive || !canBlockAction) ? 'not-allowed' : 'pointer', textAlign: 'left',
                  opacity: (isInactive || !canBlockAction) ? 0.55 : 1,
                }}
                title={isInactive ? 'Deactivated users cannot be blocked.' : (blockActionDisabledReason ?? '')}
              >
                <ShieldBan size={15} style={{ color: (isInactive || !canBlockAction) ? C.onSurfaceVariant : C.error }} />
                {isBlocked ? 'Unblock' : 'Block'}
              </button>
            </div>
          )}
        </div>
      </DefaultTable.Td>
    </DefaultTable.Tr>
  );
});