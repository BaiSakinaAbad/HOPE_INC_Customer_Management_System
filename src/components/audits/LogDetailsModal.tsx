import React from 'react';
import { X } from 'lucide-react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';
import { formatAuditAction, formatAuditTable, type AuditLog } from '../../services/auditLogService';

interface LogDetailsModalProps {
  log: AuditLog;
  onClose: () => void;
}

export const LogDetailsModal: React.FC<LogDetailsModalProps> = ({ log, onClose }) => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);

  const formatData = (data: any) => {
    if (!data) return 'None';
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      <div 
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)'
        }}
      />
      <div style={{
        position: 'relative', width: '100%', maxWidth: '800px',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        backgroundColor: C.surface, borderRadius: '16px',
        boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
        border: `1px solid ${C.outlineVariant}33`,
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px', borderBottom: `1px solid ${C.outlineVariant}22`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          backgroundColor: C.surfaceContainerLow
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: C.onSurface }}>
              Log Details
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: C.onSurfaceVariant }}>
              {formatAuditAction(log)} on {formatAuditTable(log.table_name)} - {new Date(log.created_at).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: C.onSurfaceVariant,
              cursor: 'pointer', padding: '8px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = `${C.onSurface}11`}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <InfoItem label="Log ID" value={log.id} C={C} />
            <InfoItem label="User" value={log.app_user ? (`${log.app_user.first_name || ''} ${log.app_user.last_name || ''}`.trim() || log.app_user.username || log.app_user.email || 'System') : log.user_id || 'System'} C={C} />
          </div>

          <DataSection log={log} C={C} isDark={isDark} formatData={formatData} />
        </div>
      </div>
    </div>
  );
};

/** Detects if old_data and new_data are identical (pre-fix trigger logs) */
const isDataIdentical = (a: any, b: any): boolean => {
  if (!a || !b) return false;
  try { return JSON.stringify(a) === JSON.stringify(b); } catch { return false; }
};

/** Smart data display: shows diff when data differs, or single snapshot when identical */
const DataSection: React.FC<{
  log: AuditLog; C: any; isDark: boolean;
  formatData: (d: any) => string;
}> = ({ log, C, isDark, formatData }) => {
  const preStyle = {
    margin: 0, padding: '16px', borderRadius: '8px',
    backgroundColor: isDark ? '#1e1e1e' : '#f5f5f5',
    color: isDark ? '#d4d4d4' : '#333',
    fontSize: '13px', fontFamily: 'monospace', overflowX: 'auto' as const,
    border: `1px solid ${C.outlineVariant}33`, whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
  };

  const bothExist = log.old_data && log.new_data;
  const identical = bothExist && isDataIdentical(log.old_data, log.new_data);

  // Case 1: Both exist but are identical (pre-fix trigger bug)
  if (identical) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{
          padding: '10px 14px', borderRadius: '8px', fontSize: '12px',
          backgroundColor: '#eab30812', border: '1px solid #eab30833',
          color: '#eab308', fontFamily: 'Inter, sans-serif',
        }}>
          ⚠ This log was recorded before the trigger fix — old and new data are identical. Only a snapshot is shown.
        </div>
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: C.onSurface }}>Data Snapshot</h3>
          <pre style={preStyle}>{formatData(log.new_data)}</pre>
        </div>
      </div>
    );
  }

  // Case 2: Both exist and differ — show field-level diff
  if (bothExist && !identical) {
    const allKeys = [...new Set([...Object.keys(log.old_data!), ...Object.keys(log.new_data!)])];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: C.onSurface }}>Changes</h3>
        <div style={{ ...preStyle, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontFamily: 'monospace' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.outlineVariant}33` }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', color: C.onSurfaceVariant, fontWeight: 600 }}>Field</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', color: C.onSurfaceVariant, fontWeight: 600 }}>Before</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', color: C.onSurfaceVariant, fontWeight: 600 }}>After</th>
              </tr>
            </thead>
            <tbody>
              {allKeys.map(key => {
                const oldVal = JSON.stringify(log.old_data![key] ?? null);
                const newVal = JSON.stringify(log.new_data![key] ?? null);
                const changed = oldVal !== newVal;
                return (
                  <tr key={key} style={{
                    borderBottom: `1px solid ${C.outlineVariant}15`,
                    backgroundColor: changed ? (isDark ? '#eab30808' : '#fef9c31a') : 'transparent',
                  }}>
                    <td style={{ padding: '8px 14px', fontWeight: changed ? 600 : 400, color: changed ? '#eab308' : C.onSurfaceVariant }}>{key}</td>
                    <td style={{ padding: '8px 14px', color: changed ? C.error : C.onSurfaceVariant, wordBreak: 'break-all' }}>{oldVal}</td>
                    <td style={{ padding: '8px 14px', color: changed ? '#22c55e' : C.onSurfaceVariant, wordBreak: 'break-all' }}>{newVal}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Case 3: Only one exists (INSERT or DELETE)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {log.old_data && (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: C.onSurface }}>Old Data</h3>
          <pre style={preStyle}>{formatData(log.old_data)}</pre>
        </div>
      )}
      {log.new_data && (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: C.onSurface }}>New Data</h3>
          <pre style={preStyle}>{formatData(log.new_data)}</pre>
        </div>
      )}
    </div>
  );
};

const InfoItem: React.FC<{ label: string, value: string, C: any }> = ({ label, value, C }) => (
  <div style={{
    padding: '12px 16px', borderRadius: '8px',
    backgroundColor: C.surfaceContainerLow, border: `1px solid ${C.outlineVariant}22`
  }}>
    <div style={{ fontSize: '12px', color: C.onSurfaceVariant, marginBottom: '4px' }}>{label}</div>
    <div style={{ fontSize: '14px', fontWeight: 500, color: C.onSurface, wordBreak: 'break-all' }}>{value || 'N/A'}</div>
  </div>
);
