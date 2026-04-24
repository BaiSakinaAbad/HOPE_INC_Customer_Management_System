import React, { useState } from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { type DashboardTokens } from '../../providers/ThemeProvider';
import { type Customer } from '../../types/customer';
import { DefaultTable } from '../../components/ui/DefaultTable';

// Local StatusBadge helper
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const isActive = status === 'ACTIVE';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '999px',
      fontSize: '11px', fontWeight: 700,
      backgroundColor: isActive ? 'rgba(34,197,94,0.12)' : 'rgba(120,120,140,0.1)',
      color: isActive ? '#22c55e' : '#888898',
      border: `1px solid ${isActive ? 'rgba(34,197,94,0.28)' : 'rgba(120,120,140,0.22)'}`,
    }}>
      <span style={{
        width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0,
        backgroundColor: isActive ? '#22c55e' : '#888898',
      }} />
      {status}
    </span>
  );
};

interface CustomerRowProps {
  customer: Customer;
  C: DashboardTokens;
  isDark: boolean;
  canViewStamp: boolean;
  canSoftDelete: boolean;
  onDelete: (customer: Customer) => void;
}

// React.memo prevents re-renders if props haven't changed
export const CustomerRow: React.FC<CustomerRowProps> = React.memo(({
  customer: c, C, isDark, canViewStamp, canSoftDelete, onDelete,
}) => {
  const [btnHovered, setBtnHovered] = useState(false);
  const [viewHovered, setViewHovered] = useState(false);
  const [editHovered, setEditHovered] = useState(false);

  return (
    <DefaultTable.Tr>
      <DefaultTable.Td style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: C.primary }}>
        {c.custno}
      </DefaultTable.Td>
      <DefaultTable.Td style={{ fontWeight: 600 }}>{c.custname}</DefaultTable.Td>
      <DefaultTable.Td
        style={{ color: C.onSurfaceVariant, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        title={c.address ?? ''}
      >
        {c.address || '—'}
      </DefaultTable.Td>
      <DefaultTable.Td style={{ color: C.onSurfaceVariant }}>{c.payterm || '—'}</DefaultTable.Td>
      <DefaultTable.Td><StatusBadge status={c.recordstatus} /></DefaultTable.Td>
      
      {canViewStamp && (
        <DefaultTable.Td
          style={{ fontFamily: 'monospace', fontSize: '11px', color: C.onSurfaceVariant, maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          title={c.stamp ?? ''}
        >
          {c.stamp || '—'}
        </DefaultTable.Td>
      )}
      
      <DefaultTable.Td style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'center' }}>
          <button
            type="button"
            onMouseEnter={() => setViewHovered(true)}
            onMouseLeave={() => setViewHovered(false)}
            title="View customer details"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '6px 10px', borderRadius: '7px', border: 'none',
              backgroundColor: viewHovered ? C.primary : `${C.primary}18`,
              color: viewHovered ? '#fff' : C.primary,
              fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s ease', fontFamily: 'Inter, sans-serif',
            }}
          >
            <Eye size={13} /> View
          </button>
          
          <button
            type="button"
            onMouseEnter={() => setEditHovered(true)}
            onMouseLeave={() => setEditHovered(false)}
            title="Edit customer details"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '6px 10px', borderRadius: '7px', border: 'none',
              backgroundColor: editHovered ? '#f59e0b' : 'rgba(245, 158, 11, 0.1)',
              color: editHovered ? '#fff' : '#f59e0b',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s ease', fontFamily: 'Inter, sans-serif',
            }}
          >
            <Edit2 size={13} /> Edit
          </button>

          {canSoftDelete && (
            <button
              type="button"
              onClick={() => onDelete(c)}
              onMouseEnter={() => setBtnHovered(true)}
              onMouseLeave={() => setBtnHovered(false)}
              title="Archive this customer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '6px 10px', borderRadius: '7px', border: 'none',
                backgroundColor: btnHovered ? C.error : `${C.error}18`,
                color: btnHovered ? '#fff' : C.error,
                fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s ease', fontFamily: 'Inter, sans-serif',
              }}
            >
              <Trash2 size={13} /> Delete
            </button>
          )}
        </div>
      </DefaultTable.Td>
    </DefaultTable.Tr>
  );
});