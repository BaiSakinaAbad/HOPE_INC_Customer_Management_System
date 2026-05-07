import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, MoreHorizontal, Power, PowerOff, Shield } from 'lucide-react';
import { type DashboardTokens } from '../../providers/ThemeProvider';
import { type Employee, type EmployeeRole, type EmployeeStatus } from '../../types/employee';
import { DefaultTable } from '../../components/ui/DefaultTable';

interface EmployeeRowProps {
  employee: Employee;
  C: DashboardTokens;
  isDark: boolean;
  onStatusAction: (employee: Employee) => void;
  canEditRole: boolean;
  roleUpdating: boolean;
  onRoleChange: (employee: Employee, newRole: EmployeeRole) => void;
  canEditStatus: boolean;
  /** Whether the "View Permissions" item should appear in the dropdown. */
  canViewPermissions: boolean;
  onViewPermissions: (employee: Employee) => void;
  /** Whether the entire Actions column content should be shown. */
  showActions: boolean;
}

export const EmployeeRow: React.FC<EmployeeRowProps> = React.memo(({
  employee: e, C, isDark, onStatusAction, canEditRole, roleUpdating, onRoleChange,
  canEditStatus, canViewPermissions, onViewPermissions, showActions,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isActive = e.recordstatus === 'ACTIVE';

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
  };
  const statusColor = statusStyles[e.recordstatus] || {
    bg: 'rgba(120,120,140,0.10)',
    fg: '#888898',
    border: 'rgba(120,120,140,0.22)',
  };

  // Determine if there are any dropdown items to show
  const hasDropdownItems = canViewPermissions || canEditStatus;

  return (
    <DefaultTable.Tr>
      <DefaultTable.Td style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: C.primary }}>
        {e.id?.slice(0, 8) || 'No ID'}
      </DefaultTable.Td>
      <DefaultTable.Td style={{ fontWeight: 600 }}>
        {e.username || 'No username'}
      </DefaultTable.Td>
      <DefaultTable.Td style={{ color: C.onSurfaceVariant }}>
        {e.email || 'No email'}
      </DefaultTable.Td>
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
                  ? (isDark ? `${C.surfaceContainerHigh}aa` : '#eef0f3')
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
              }}
            >
              <option value="user">USER</option>
              <option value="admin">ADMIN</option>
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
        {showActions && hasDropdownItems ? (
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
              aria-label="User actions"
            >
              <MoreHorizontal size={18} />
            </button>

            {dropdownOpen && (
              <div style={{
                position: 'absolute', right: 0, top: '100%', zIndex: 10,
                minWidth: '160px', marginTop: '4px',
                backgroundColor: isDark ? C.surfaceContainerHigh : '#ffffff',
                border: `1px solid ${C.outlineVariant}33`,
                borderRadius: '8px',
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 14px rgba(0,0,0,0.08)',
                padding: '4px', display: 'flex', flexDirection: 'column', gap: '2px',
                textAlign: 'left',
              }}>
                {canViewPermissions && (
                  <button
                    type="button"
                    onClick={() => { setDropdownOpen(false); onViewPermissions(e); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      width: '100%', padding: '8px 12px', border: 'none',
                      background: 'transparent',
                      color: C.onSurface,
                      fontSize: '13px', fontWeight: 500,
                      borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Shield size={15} style={{ color: C.onSurfaceVariant }} />
                    View Permissions
                  </button>
                )}
                {canEditStatus && (
                  <button
                    type="button"
                    onClick={() => { setDropdownOpen(false); onStatusAction(e); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      width: '100%', padding: '8px 12px', border: 'none',
                      background: 'transparent',
                      color: isActive ? C.error : '#22c55e',
                      fontSize: '13px', fontWeight: 500,
                      borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isActive
                      ? <PowerOff size={15} style={{ color: C.error }} />
                      : <Power size={15} style={{ color: '#22c55e' }} />}
                    {isActive ? 'Deactivate' : 'Activate'}
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <span style={{ color: C.onSurfaceVariant, fontSize: '12px', opacity: 0.4 }}>—</span>
        )}
      </DefaultTable.Td>
    </DefaultTable.Tr>
  );
});
