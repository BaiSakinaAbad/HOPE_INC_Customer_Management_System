import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import type { Customer } from '../../types/customer';
import { type DashboardTokens } from '../../providers/ThemeProvider';
import { Button, Input } from '../ui';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: Pick<Customer, 'custname' | 'address' | 'payterm'>) => Promise<void>;
  loading: boolean;
  error: string | null;
  C: DashboardTokens;
  isDark: boolean;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen, onClose, onAdd, loading, error, C, isDark,
}) => {
  const [custname, setCustname] = useState('');
  const [address, setAddress] = useState('');
  const [payterm, setPayterm] = useState('COD');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd({ custname, address, payterm });
    // Reset form on success is handled by unmounting or external state, but we can reset here too
    if (!error) {
      setCustname('');
      setAddress('');
      setPayterm('COD');
    }
  };

  const overlayBg = isDark ? 'rgba(0,0,0,0.6)' : 'rgba(25,25,35,0.4)';
  const modalBg = isDark ? C.surfaceContainerHigh : '#ffffff';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: overlayBg, backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px', animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        backgroundColor: modalBg, borderRadius: '16px',
        width: '100%', maxWidth: '440px',
        boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column', position: 'relative',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 24px 16px', borderBottom: `1px solid ${C.outlineVariant}33` }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              position: 'absolute', top: '24px', right: '24px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: C.onSurfaceVariant, padding: '4px', display: 'flex',
            }}
          >
            <X size={20} />
          </button>
          <h2 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 700, color: C.onSurface, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Add New Customer
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: C.onSurfaceVariant }}>
            Enter the details for the new customer.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={(e) => void handleSubmit(e)} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <Input
            label="Customer No"
            value="Auto assigned"
            disabled
            readOnly
            style={{ opacity: 0.6, cursor: 'not-allowed' }}
          />

          <Input
            label="Customer Name"
            placeholder="Enter customer name"
            value={custname}
            onChange={(e) => setCustname(e.target.value)}
            required
          />

          <Input
            label="Address"
            placeholder="Enter full address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '6px', padding: '0 4px',
            }}>
              <label style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                color: C.onSurfaceVariant,
              }}>
                Payment Term
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <select
                value={payterm}
                onChange={(e) => setPayterm(e.target.value)}
                style={{
                  width: '100%', height: '44px',
                  backgroundColor: isDark ? C.surfaceContainerHigh : '#ffffff',
                  border: `1px solid ${C.outlineVariant}33`,
                  borderRadius: '10px',
                  padding: '0 13px',
                  fontSize: '13px', fontFamily: "'Inter', sans-serif",
                  color: C.onSurface, outline: 'none', boxSizing: 'border-box',
                  transition: 'background-color 0.2s',
                  appearance: 'none',
                }}
              >
                <option value="COD">COD</option>
                <option value="30D">30D</option>
                <option value="45D">45D</option>
              </select>
              <div style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.onSurfaceVariant} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: C.error, fontSize: '13px', marginTop: '-8px' }}>
              <AlertTriangle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 20px', borderRadius: '10px',
                border: `1px solid ${C.outlineVariant}`, background: 'transparent',
                color: C.onSurface, fontWeight: 600, fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Cancel
            </button>
            <Button type="submit" isLoading={loading} style={{ width: 'auto', padding: '0 24px' }}>
              Add Customer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
