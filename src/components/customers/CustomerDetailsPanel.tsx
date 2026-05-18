/**
 * The 40% side-overlay panel component for the Customer Registry layout.
 * Displays customer metadata, a detailed transaction breakdown, and features an 
 * interactive popup tracing the historical pricing data of individual purchased items.
 */
import React, { useState, useEffect } from 'react';
import { X, Clock, DollarSign, TrendingUp, Package } from 'lucide-react';
import { type Customer } from '../../types/customer';
import { type DashboardTokens } from '../../providers/ThemeProvider';
import { getSales, type SaleTransaction } from '../../services/salesService';
import { getProductPriceHistory } from '../../services/productService';
import { useRights } from '../../hooks/useRights';

interface CustomerDetailsPanelProps {
  customer: Customer;
  onClose: () => void;
  C: DashboardTokens;
  isDark: boolean;
}

export const CustomerDetailsPanel: React.FC<CustomerDetailsPanelProps> = ({ customer, onClose, C, isDark }) => {
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePriceProduct, setActivePriceProduct] = useState<{ code: string, desc: string } | null>(null);
  const [priceHistoryData, setPriceHistoryData] = useState<{effdate: string; unitprice: number}[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const { canViewSalesDetail } = useRights();

  useEffect(() => {
    let mounted = true;
    if (activePriceProduct) {
      setLoadingHistory(true);
      void getProductPriceHistory(activePriceProduct.code).then(({ data }) => {
        if (mounted) {
          setPriceHistoryData(data || []);
          setLoadingHistory(false);
        }
      });
    } else {
      setPriceHistoryData([]);
    }
    return () => { mounted = false; };
  }, [activePriceProduct]);

  useEffect(() => {
    let mounted = true;
    const fetchSales = async () => {
      setLoading(true);
      const { data } = await getSales(customer.custno, undefined, undefined, 1, 9999);
      if (mounted) {
        setSales(data || []);
        setLoading(false);
      }
    };
    void fetchSales();
    return () => { mounted = false; };
  }, [customer.custno]);

  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalOrders = sales.length;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: isDark ? C.surfaceContainer : '#ffffff',
      borderLeft: `1px solid ${C.outlineVariant}33`,
      boxShadow: isDark ? '-4px 0 24px rgba(0,0,0,0.4)' : '-4px 0 24px rgba(0,0,0,0.08)',
      overflowY: 'auto'
    }}>
      {/* Section A: Header */}
      <div style={{
        padding: '24px',
        borderBottom: `1px solid ${C.outlineVariant}33`,
        position: 'sticky',
        top: 0,
        backgroundColor: isDark ? C.surfaceContainer : '#ffffff',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 800, color: C.onSurface, lineHeight: 1.2 }}>
              {customer.custname}
            </h2>
            <div style={{ fontSize: '13px', color: C.onSurfaceVariant, fontFamily: 'monospace', fontWeight: 600 }}>
              {customer.custno}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: isDark ? `${C.surfaceContainerHigh}88` : '#f1f1f5',
              border: 'none', cursor: 'pointer',
              color: C.onSurfaceVariant, display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '6px', borderRadius: '50%',
              transition: 'background 0.2s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', backgroundColor: `${C.primary}15`, color: C.primary, fontWeight: 700 }}>
            Term: {customer.payterm || 'None'}
          </span>
          <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', backgroundColor: customer.recordstatus === 'ACTIVE' ? 'rgba(34,197,94,0.12)' : 'rgba(120,120,140,0.1)', color: customer.recordstatus === 'ACTIVE' ? '#22c55e' : '#888898', fontWeight: 700 }}>
            {customer.recordstatus}
          </span>
        </div>
        
        {customer.address && (
          <div style={{ fontSize: '13px', color: C.onSurfaceVariant, backgroundColor: isDark ? `${C.surfaceContainerHigh}44` : '#f8f8fb', padding: '10px 12px', borderRadius: '8px' }}>
            {customer.address}
          </div>
        )}
      </div>

      {/* Metrics Summary Hero Card */}
      {!loading && sales.length > 0 && (
        <div style={{
          margin: '24px 24px 0 24px',
          padding: '24px',
          borderRadius: '16px',
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8f8fc',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '8px' }}>
              Accumulated Sales
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#34d399', lineHeight: 1 }}>
              {totalSales.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '8px' }}>
              Total Orders
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: C.onSurface, lineHeight: 1 }}>
              {totalOrders} {totalOrders === 1 ? 'Transaction' : 'Transactions'}
            </div>
          </div>
        </div>
      )}

      {/* Sections B, C, D: Sales History and Items Breakdown */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: C.onSurface, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color={C.primary} /> Transaction Breakdown
        </h3>

        {loading ? (
          <div style={{ fontSize: '14px', color: C.onSurfaceVariant, textAlign: 'center', padding: '40px' }}>Loading transactions...</div>
        ) : !canViewSalesDetail ? (
          <div style={{ fontSize: '14px', color: C.onSurfaceVariant, textAlign: 'center', padding: '40px', backgroundColor: isDark ? `${C.surfaceContainerHigh}44` : '#f8f8fb', borderRadius: '12px' }}>
            You do not have permission to view transaction details.
          </div>
        ) : sales.length === 0 ? (
          <div style={{ fontSize: '14px', color: C.onSurfaceVariant, textAlign: 'center', padding: '40px', backgroundColor: isDark ? `${C.surfaceContainerHigh}44` : '#f8f8fb', borderRadius: '12px' }}>
            No sales history found for this customer.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {sales.map((sale) => (
              <div key={sale.transno} style={{
                borderRadius: '16px',
                border: `1px solid ${C.outlineVariant}33`,
                backgroundColor: isDark ? C.surfaceContainerHigh : '#ffffff',
                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.04)',
                position: 'relative' // for any absolute children bounds if needed, though dropdown needs to break out
              }}>
                {/* Transaction Header */}
                <div style={{
                  padding: '16px 20px',
                  borderBottom: `1px solid ${C.outlineVariant}33`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: isDark ? `${C.surfaceContainerHigh}bb` : '#fafafa',
                  borderTopLeftRadius: '16px',
                  borderTopRightRadius: '16px'
                }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: C.onSurface }}>{sale.transno}</div>
                    <div style={{ fontSize: '12px', color: C.onSurfaceVariant, marginTop: '2px', fontWeight: 500 }}>
                      {new Date(sale.salesdate).toLocaleDateString()} • {sale.employeeName}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#22c55e' }}>
                      {sale.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </div>
                  </div>
                </div>

                {/* Product Items Breakdown */}
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '12px', marginBottom: '12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: C.onSurfaceVariant, fontWeight: 700 }}>
                    <div>Item (Code)</div>
                    <div style={{ textAlign: 'right' }}>Qty</div>
                    <div style={{ textAlign: 'right' }}>Unit Price</div>
                    <div style={{ textAlign: 'right' }}>Subtotal</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {sale.details.map((d, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '12px', fontSize: '13px', alignItems: 'center' }}>
                        <div style={{ color: C.onSurface, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.description}>
                            {d.description}
                          </span>
                          {/* Price History Tracing Interactive Popover */}
                          <div style={{ position: 'relative' }}>
                            <button 
                              type="button"
                              onClick={() => setActivePriceProduct(activePriceProduct?.code === d.product_code ? null : { code: d.product_code, desc: d.description })}
                              title="View Price History" 
                              style={{ 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                padding: '3px', borderRadius: '4px', 
                                backgroundColor: activePriceProduct?.code === d.product_code ? C.primary : `${C.primary}15`, 
                                color: activePriceProduct?.code === d.product_code ? '#fff' : C.primary, 
                                cursor: 'pointer', flexShrink: 0, border: 'none', transition: 'all 0.2s'
                              }}
                            >
                              <TrendingUp size={12} strokeWidth={2.5} />
                            </button>
                            
                            {activePriceProduct?.code === d.product_code && (
                              <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                marginTop: '8px',
                                zIndex: 50,
                                minWidth: '340px',
                                backgroundColor: '#131525',
                                border: `1px solid rgba(255,255,255,0.08)`,
                                borderRadius: '12px',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                                padding: '20px',
                                cursor: 'default',
                                color: '#fff'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                                    Price History: {activePriceProduct.desc}
                                  </div>
                                  <button onClick={() => setActivePriceProduct(null)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', borderRadius: '6px', padding: '5px', cursor: 'pointer', display: 'flex' }}>
                                    <X size={14} />
                                  </button>
                                </div>
                                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px', fontFamily: 'monospace' }}>
                                  {activePriceProduct.code}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  <div>Effective Date</div>
                                  <div>Price</div>
                                  <div>Status</div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0', maxHeight: '200px', overflowY: 'auto' }}>
                                  {loadingHistory ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Loading history...</div>
                                  ) : priceHistoryData.length === 0 ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>No history found</div>
                                  ) : priceHistoryData.map((h, hIdx) => {
                                    const isCurrent = hIdx === 0;
                                    return (
                                      <div key={hIdx} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '8px', fontSize: '13px', color: '#fff', alignItems: 'center', padding: '12px 0', borderBottom: hIdx < priceHistoryData.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                        <div style={{ fontWeight: 600 }}>{new Date(h.effdate).toLocaleDateString()}</div>
                                        <div style={{ fontWeight: 700 }}>{h.unitprice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
                                        <div>
                                          {isCurrent ? (
                                            <span style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#4ade80', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>Current</span>
                                          ) : (
                                            <span style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>Historical</span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{ color: C.onSurface, textAlign: 'right', fontWeight: 500 }}>{d.quantity}</div>
                        <div style={{ color: C.onSurfaceVariant, textAlign: 'right' }}>
                          {d.unitPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </div>
                        <div style={{ color: C.onSurface, textAlign: 'right', fontWeight: 700 }}>
                          {d.totalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
