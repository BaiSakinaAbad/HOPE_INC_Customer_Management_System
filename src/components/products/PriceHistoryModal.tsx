import React from 'react';
import { X } from 'lucide-react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';
import { DefaultTable } from '../ui/DefaultTable';

interface PriceHistoryModalProps {
  product: any;
  onClose: () => void;
}

export const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({ product, onClose }) => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.2)',
      backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        backgroundColor: isDark ? C.surfaceContainerHigh : '#ffffff',
        width: '90%', maxWidth: '650px',
        borderRadius: '16px',
        boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ padding: '24px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700, color: C.onSurface }}>
              Price History: {product.description}
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: C.onSurfaceVariant }}>
              {product.prodcode} - {product.unit}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: `1px solid ${C.outlineVariant}55`,
              borderRadius: '8px', cursor: 'pointer', padding: '6px',
              color: C.onSurfaceVariant, display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${C.onSurface}10`}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '0 24px 24px' }}>
          <div style={{ border: `1px solid ${C.outlineVariant}33`, borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <DefaultTable.Th>Effective Date</DefaultTable.Th>
                  <DefaultTable.Th>Price</DefaultTable.Th>
                  <DefaultTable.Th>Status</DefaultTable.Th>
                </tr>
              </thead>
              <tbody>
                {(!product.priceHistory || product.priceHistory.length === 0) && (
                  <DefaultTable.Tr>
                    <DefaultTable.Td colSpan={3} style={{ textAlign: 'center', padding: '32px', color: C.onSurfaceVariant }}>
                      No price history available.
                    </DefaultTable.Td>
                  </DefaultTable.Tr>
                )}
                {product.priceHistory?.map((hist: any, index: number) => (
                  <DefaultTable.Tr key={`${hist.effdate}-${hist.unitprice}`}>
                    <DefaultTable.Td style={{ fontWeight: 500 }}>{formatDate(hist.effdate)}</DefaultTable.Td>
                    <DefaultTable.Td style={{ fontWeight: 700, color: C.onSurface }}>{formatPrice(hist.unitprice)}</DefaultTable.Td>
                    <DefaultTable.Td>
                      {index === 0 ? (
                        <span style={{
                          display: 'inline-flex', padding: '4px 12px', borderRadius: '999px',
                          fontSize: '12px', fontWeight: 600,
                          backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e'
                        }}>
                          Current
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex', padding: '4px 12px', borderRadius: '999px',
                          fontSize: '12px', fontWeight: 600,
                          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', 
                          color: C.onSurfaceVariant
                        }}>
                          Historical
                        </span>
                      )}
                    </DefaultTable.Td>
                  </DefaultTable.Tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
