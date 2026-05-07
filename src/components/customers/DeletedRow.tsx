import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { type DashboardTokens } from '../../providers/ThemeProvider';
import { type Customer } from '../../types/customer';
import { DefaultTable } from '../../components/ui/DefaultTable';

interface DeletedRowProps {
  customer: Customer;
  C: DashboardTokens;
  canViewStamp: boolean;
  canActivate: boolean;
  onActivate: (customer: Customer) => void;
}

export const DeletedRow: React.FC<DeletedRowProps> = React.memo(({
  customer: c, C, canViewStamp, canActivate, onActivate,
}) => {
  const [btnHovered, setBtnHovered] = useState(false);
  const green = '#22c55e';

  return (
    <DefaultTable.Tr>
      <DefaultTable.Td style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: C.onSurfaceVariant }}>
        {c.custno}
      </DefaultTable.Td>
      <DefaultTable.Td style={{ fontWeight: 600, color: C.onSurfaceVariant }}>{c.custname}</DefaultTable.Td>
      <DefaultTable.Td
        style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: C.onSurfaceVariant }}
        title={c.address ?? ''}
      >
        {c.address || '—'}
      </DefaultTable.Td>
      <DefaultTable.Td style={{ color: C.onSurfaceVariant }}>{c.payterm || '—'}</DefaultTable.Td>
      <DefaultTable.Td>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
          backgroundColor: 'rgba(120,120,140,0.1)', color: '#888898',
          border: '1px solid rgba(120,120,140,0.22)',
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#888898', flexShrink: 0 }} />
          INACTIVE
        </span>
      </DefaultTable.Td>
      
      {canViewStamp && (
        <DefaultTable.Td
          style={{ fontFamily: 'monospace', fontSize: '11px', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          title={c.stamp ?? ''}
        >
          {c.stamp || '—'}
        </DefaultTable.Td>
      )}
      
      {canActivate && (
        <DefaultTable.Td style={{ textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => onActivate(c)}
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
            title="Restore this customer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '6px 12px', borderRadius: '7px', border: 'none',
              backgroundColor: btnHovered ? green : 'rgba(34,197,94,0.15)',
              color: btnHovered ? '#fff' : green,
              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.18s ease', fontFamily: 'Inter, sans-serif',
            }}
          >
            <CheckCircle2 size={13} /> Restore
          </button>
        </DefaultTable.Td>
      )}
    </DefaultTable.Tr>
  );
});
