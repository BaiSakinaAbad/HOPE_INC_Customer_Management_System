import React, { useState } from 'react';
import { Power, PowerOff } from 'lucide-react';
import { type DashboardTokens } from '../../providers/ThemeProvider';
import { type Employee } from '../../types/employee';
import { DefaultTable } from '../../components/ui/DefaultTable';

interface EmployeeRowProps {
  employee: Employee;
  C: DashboardTokens;
  isDark: boolean;
  onToggleStatus: (employee: Employee) => void;
}

export const EmployeeRow: React.FC<EmployeeRowProps> = React.memo(({
  employee: e, C, isDark, onToggleStatus,
}) => {
  const [btnHovered, setBtnHovered] = useState(false);
  const isActive = e.recordstatus === 'ACTIVE';

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
        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.primary }}>
          {e.role}
        </span>
      </DefaultTable.Td>
      <DefaultTable.Td>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
          backgroundColor: isActive ? 'rgba(34,197,94,0.12)' : 'rgba(120,120,140,0.1)',
          color: isActive ? '#22c55e' : '#888898',
          border: `1px solid ${isActive ? 'rgba(34,197,94,0.28)' : 'rgba(120,120,140,0.22)'}`,
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0, backgroundColor: isActive ? '#22c55e' : '#888898' }} />
          {e.recordstatus}
        </span>
      </DefaultTable.Td>
      <DefaultTable.Td style={{ textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => onToggleStatus(e)}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          title={isActive ? "Deactivate Employee" : "Activate Employee"}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '6px 10px', borderRadius: '7px', border: 'none',
            backgroundColor: btnHovered ? (isActive ? C.error : '#22c55e') : (isActive ? `${C.error}18` : 'rgba(34,197,94,0.15)'),
            color: btnHovered ? '#fff' : (isActive ? C.error : '#22c55e'),
            fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s ease', fontFamily: 'Inter, sans-serif',
          }}
        >
          {isActive ? <PowerOff size={13} /> : <Power size={13} />}
          {isActive ? 'Deactivate' : 'Activate'}
        </button>
      </DefaultTable.Td>
    </DefaultTable.Tr>
  );
});