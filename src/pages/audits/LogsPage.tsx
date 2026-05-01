import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, RefreshCw } from 'lucide-react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';
import { auditLogService, formatAuditAction, formatAuditTable, type AuditLog } from '../../services/auditLogService';
import { LogDetailsModal } from '../../components/audits/LogDetailsModal';

export const LogsPage: React.FC = () => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    const { logs: fetchedLogs, error: err } = await auditLogService.fetchLogs(200);
    if (err) {
      setError(err.message || 'Failed to load audit logs.');
    } else {
      setLogs(fetchedLogs);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const s = searchTerm.toLowerCase();
    const userDisplay = log.app_user 
      ? (`${log.app_user.first_name || ''} ${log.app_user.last_name || ''}`.trim() || log.app_user.username || log.app_user.email) 
      : log.user_id;
    
    return (
      formatAuditTable(log.table_name).toLowerCase().includes(s) ||
      formatAuditAction(log).toLowerCase().includes(s) ||
      (userDisplay && userDisplay.toLowerCase().includes(s)) ||
      log.id.toLowerCase().includes(s)
    );
  });

  const getActionColor = (log: AuditLog) => {
    const act = formatAuditAction(log);
    switch (act) {
      case 'INSERT':
      case 'CREATED':      return { bg: `${C.primary}1a`, color: C.primary };
      case 'DELETED':
      case 'DELETE':        return { bg: `${C.error}1a`, color: C.error };
      case 'DEACTIVATED':   return { bg: '#f973161a', color: '#f97316' }; // orange
      case 'RESTORED':
      case 'ACTIVATED':     return { bg: 'rgba(34,197,94,0.1)', color: '#22c55e' }; // green
      case 'UPDATED':
      case 'UPDATE':        return { bg: '#eab3081a', color: '#eab308' }; // yellow
      default:              return { bg: `${C.outlineVariant}33`, color: C.onSurface };
    }
  };

  return (
    <div style={{ flex: 1, padding: '32px 24px 48px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: C.font.headline, fontSize: '28px', color: C.onSurface, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldAlert size={28} color={C.primary} />
              Audit Logs
            </h1>
            <p style={{ margin: '4px 0 0', color: C.onSurfaceVariant, fontSize: '14px' }}>
              Track all creation, modification, and deletion events across the system.
            </p>
          </div>
          <button
            onClick={fetchLogs}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 16px', borderRadius: '8px',
              backgroundColor: C.surfaceContainerHigh, border: `1px solid ${C.outlineVariant}44`,
              color: C.onSurface, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: C.font.body, fontSize: '14px', fontWeight: 500,
              opacity: loading ? 0.7 : 1, transition: 'all 0.2s'
            }}
          >
            <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '12px',
          backgroundColor: C.surface, padding: '12px 16px', borderRadius: '12px',
          border: `1px solid ${C.outlineVariant}33`, boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <Search size={20} color={C.onSurfaceVariant} />
          <input
            type="text"
            placeholder="Search logs by table, action, user, or record ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: C.onSurface, fontSize: '15px', fontFamily: C.font.body
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '16px', backgroundColor: `${C.error}1a`, color: C.error, borderRadius: '8px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {/* Table */}
        <div style={{
          backgroundColor: C.surface, borderRadius: '12px', border: `1px solid ${C.outlineVariant}33`,
          overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ backgroundColor: C.surfaceContainerLow, borderBottom: `1px solid ${C.outlineVariant}33` }}>
                  <th style={{ padding: '16px', color: C.onSurfaceVariant, fontSize: '13px', fontWeight: 600 }}>Date / Time</th>
                  <th style={{ padding: '16px', color: C.onSurfaceVariant, fontSize: '13px', fontWeight: 600 }}>Action</th>
                  <th style={{ padding: '16px', color: C.onSurfaceVariant, fontSize: '13px', fontWeight: 600 }}>Table</th>
                  <th style={{ padding: '16px', color: C.onSurfaceVariant, fontSize: '13px', fontWeight: 600 }}>User</th>
                  <th style={{ padding: '16px', color: C.onSurfaceVariant, fontSize: '13px', fontWeight: 600 }}>Record ID</th>
                </tr>
              </thead>
              <tbody>
                {loading && logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: C.onSurfaceVariant }}>
                      Loading logs...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: C.onSurfaceVariant }}>
                      No logs found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => {
                    const actionStyle = getActionColor(log);
                    const userDisplay = log.app_user 
                      ? (`${log.app_user.first_name || ''} ${log.app_user.last_name || ''}`.trim() || log.app_user.username || log.app_user.email) 
                      : log.user_id || 'System';

                    return (
                      <tr 
                        key={log.id} 
                        onClick={() => setSelectedLog(log)}
                        style={{ 
                          borderBottom: `1px solid ${C.outlineVariant}22`, cursor: 'pointer',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = `${C.primary}0a`}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '16px', color: C.onSurface, fontSize: '14px', whiteSpace: 'nowrap' }}>
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ 
                            padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                            backgroundColor: actionStyle.bg, color: actionStyle.color || (actionStyle as any).text
                          }}>
                            {formatAuditAction(log)}
                          </span>
                        </td>
                        <td style={{ padding: '16px', color: C.onSurface, fontSize: '14px', fontWeight: 500 }}>
                          {formatAuditTable(log.table_name)}
                        </td>
                        <td style={{ padding: '16px', color: C.onSurfaceVariant, fontSize: '14px' }}>
                          {userDisplay}
                        </td>
                        <td style={{ padding: '16px', color: C.onSurfaceVariant, fontSize: '14px', fontFamily: 'monospace' }}>
                          {log.id.substring(0, 8)}...
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedLog && (
        <LogDetailsModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
};//push
