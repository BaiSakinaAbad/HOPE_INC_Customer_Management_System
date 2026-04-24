import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Trash2, MoreHorizontal, ShoppingCart } from 'lucide-react';
import { type DashboardTokens } from '../../providers/ThemeProvider';
import { type Customer } from '../../types/customer';
import { DefaultTable } from '../../components/ui/DefaultTable';
import { useNavigation } from '../../providers/NavigationProvider';

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
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

// Dropdown Item Helper
const DropdownItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  C: DashboardTokens;
  danger?: boolean;
}> = ({ icon, label, onClick, C, danger }) => {
  const [hovered, setHovered] = useState(false);
  const color = danger ? C.error : C.onSurface;
  const hoverBg = danger ? `${C.error}15` : `${C.primary}10`;
  
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        width: '100%', padding: '8px 12px', border: 'none',
        background: hovered ? hoverBg : 'transparent',
        color: color, fontSize: '13px', fontWeight: 500,
        borderRadius: '6px', cursor: 'pointer', textAlign: 'left',
        transition: 'background 0.15s ease',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <span style={{ color: danger ? C.error : C.onSurfaceVariant, display: 'flex' }}>{icon}</span>
      {label}
    </button>
  );
};

// React.memo prevents re-renders if props haven't changed
export const CustomerRow: React.FC<CustomerRowProps> = React.memo(({
  customer: c, C, isDark, canViewStamp, canSoftDelete, onEdit, onDelete,
}) => {
  const { navigate } = useNavigation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              background: dropdownOpen ? `${C.primary}15` : 'none', 
              border: 'none', cursor: 'pointer',
              color: dropdownOpen ? C.primary : C.onSurfaceVariant, 
              padding: '6px', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}
          >
            <MoreHorizontal size={18} />
          </button>

          {dropdownOpen && (
            <div style={{
              position: 'absolute', right: 0, top: '100%', zIndex: 10,
              minWidth: '140px', marginTop: '4px',
              backgroundColor: isDark ? C.surfaceContainerHigh : '#ffffff',
              border: `1px solid ${C.outlineVariant}33`,
              borderRadius: '8px',
              boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 14px rgba(0,0,0,0.08)',
              padding: '4px', display: 'flex', flexDirection: 'column', gap: '2px',
              textAlign: 'left'
            }}>
              <DropdownItem 
                icon={<ShoppingCart size={15} />} 
                label="View Sales" 
                onClick={() => { setDropdownOpen(false); navigate('sales', { customerNo: c.custno }); }} 
                C={C} 
              />
              <DropdownItem 
                icon={<Edit2 size={15} />} 
                label="Edit" 
                onClick={() => { setDropdownOpen(false); onEdit(c); }} 
                C={C} 
              />
              {canSoftDelete && (
                <DropdownItem 
                  icon={<Trash2 size={15} />} 
                  label="Delete" 
                  onClick={() => { setDropdownOpen(false); onDelete(c); }} 
                  C={C} 
                  danger 
                />
              )}
            </div>
          )}
        </div>
      </DefaultTable.Td>
    </DefaultTable.Tr>
  );
});