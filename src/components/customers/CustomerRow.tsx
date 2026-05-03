import React, { useState, useRef, useEffect } from 'react';
import { Edit2, MoreHorizontal, ShoppingCart, Trash2 } from 'lucide-react';
import { type DashboardTokens } from '../../providers/ThemeProvider';
import { type Customer } from '../../types/customer';
import { DefaultTable } from '../../components/ui/DefaultTable';
import { useNavigation } from '../../providers/NavigationProvider';
import { getSales, type SaleTransaction } from '../../services/salesService';

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
  canEdit: boolean;
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
  success?: boolean;
}> = ({ icon, label, onClick, C, danger, success }) => {
  const [hovered, setHovered] = useState(false);
  const color = danger ? C.error : success ? '#16a34a' : C.onSurface;
  const hoverBg = danger ? `${C.error}15` : success ? 'rgba(34,197,94,0.12)' : `${C.primary}10`;
  
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
      <span style={{ color: danger ? C.error : success ? '#16a34a' : C.onSurfaceVariant, display: 'flex' }}>{icon}</span>
      {label}
    </button>
  );
};

// React.memo prevents re-renders if props haven't changed
export const CustomerRow: React.FC<CustomerRowProps> = React.memo(({
  customer: c, C, isDark, canViewStamp, canSoftDelete, canEdit, onEdit, onDelete,
}) => {
  const { navigate } = useNavigation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isSalesExpanded, setIsSalesExpanded] = useState(false);
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);

  const handleToggleSales = async () => {
    setDropdownOpen(false);
    if (!isSalesExpanded) {
      setIsSalesExpanded(true);
      setSalesLoading(true);
      const { data } = await getSales(c.custno);
      setSales(data || []);
      setSalesLoading(false);
    } else {
      setIsSalesExpanded(false);
    }
  };

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
    <React.Fragment>
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
                label={isSalesExpanded ? "Hide Sales" : "View Sales"} 
                onClick={handleToggleSales} 
                C={C} 
              />
              {canEdit && (
                <DropdownItem 
                  icon={<Edit2 size={15} />} 
                  label="Edit" 
                  onClick={() => { setDropdownOpen(false); onEdit(c); }} 
                  C={C} 
                />
              )}
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

    {isSalesExpanded && (
      <DefaultTable.Tr>
        <DefaultTable.Td colSpan={8} style={{ padding: 0, backgroundColor: isDark ? `${C.surfaceContainerHigh}40` : '#f8f8fb' }}>
          <div style={{ padding: '24px', borderTop: `1px solid ${C.outlineVariant}33`, borderBottom: `1px solid ${C.outlineVariant}33` }}>
            <h4 style={{ margin: '0 0 16px 0', color: C.onSurface, fontSize: '14px', fontWeight: 700 }}>
              Sales History for {c.custname}
            </h4>
            
            {salesLoading ? (
              <p style={{ color: C.onSurfaceVariant, fontSize: '13px' }}>Loading sales...</p>
            ) : sales.length === 0 ? (
              <p style={{ color: C.onSurfaceVariant, fontSize: '13px' }}>No sales transactions found.</p>
            ) : (
              <div style={{ 
                backgroundColor: isDark ? C.surfaceContainer : '#fff', 
                borderRadius: '8px', 
                border: `1px solid ${C.outlineVariant}55`,
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead style={{ backgroundColor: isDark ? `${C.surfaceContainerHigh}88` : '#f1f1f5' }}>
                    <tr>
                      <th style={{ padding: '10px 16px', color: C.onSurfaceVariant, fontWeight: 600, borderBottom: `1px solid ${C.outlineVariant}44` }}>Transaction No</th>
                      <th style={{ padding: '10px 16px', color: C.onSurfaceVariant, fontWeight: 600, borderBottom: `1px solid ${C.outlineVariant}44` }}>Date</th>
                      <th style={{ padding: '10px 16px', color: C.onSurfaceVariant, fontWeight: 600, borderBottom: `1px solid ${C.outlineVariant}44` }}>Facilitated By</th>
                      <th style={{ padding: '10px 16px', color: C.onSurfaceVariant, fontWeight: 600, borderBottom: `1px solid ${C.outlineVariant}44`, textAlign: 'right' }}>Grand Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale, idx) => (
                      <React.Fragment key={sale.transno}>
                        <tr style={{ backgroundColor: isDark ? `${C.surfaceContainerHigh}33` : '#fdfdfd' }}>
                          <td style={{ padding: '10px 16px', fontWeight: 700, color: C.onSurface }}>{sale.transno}</td>
                          <td style={{ padding: '10px 16px', color: C.onSurfaceVariant }}>{new Date(sale.salesdate).toLocaleDateString()}</td>
                          <td style={{ padding: '10px 16px', color: C.onSurface }}>{sale.employeeName}</td>
                          <td style={{ padding: '10px 16px', color: C.onSurface, textAlign: 'right', fontWeight: 700, fontSize: '14px' }}>
                            {sale.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={4} style={{ padding: '0 16px 16px 16px', borderBottom: idx < sales.length - 1 ? `1px solid ${C.outlineVariant}55` : 'none' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '4px', fontSize: '12px' }}>
                              <thead style={{ borderBottom: `1px solid ${C.outlineVariant}33` }}>
                                <tr>
                                  <th style={{ padding: '4px 8px', color: C.onSurfaceVariant, fontWeight: 500, textAlign: 'left' }}>Product</th>
                                  <th style={{ padding: '4px 8px', color: C.onSurfaceVariant, fontWeight: 500, textAlign: 'right' }}>Qty</th>
                                  <th style={{ padding: '4px 8px', color: C.onSurfaceVariant, fontWeight: 500, textAlign: 'right' }}>Price</th>
                                  <th style={{ padding: '4px 8px', color: C.onSurfaceVariant, fontWeight: 500, textAlign: 'right' }}>Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sale.details?.map((d, i) => (
                                  <tr key={i} style={{ borderBottom: `1px dashed ${C.outlineVariant}22` }}>
                                    <td style={{ padding: '6px 8px', color: C.onSurface }}>{d.description} <span style={{ opacity: 0.5 }}>({d.product_code})</span></td>
                                    <td style={{ padding: '6px 8px', color: C.onSurface, textAlign: 'right' }}>{d.quantity}</td>
                                    <td style={{ padding: '6px 8px', color: C.onSurfaceVariant, textAlign: 'right' }}>
                                      {d.unitPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                    </td>
                                    <td style={{ padding: '6px 8px', color: C.onSurface, textAlign: 'right', fontWeight: 600 }}>
                                      {d.totalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DefaultTable.Td>
      </DefaultTable.Tr>
    )}
    </React.Fragment>
  );
});
