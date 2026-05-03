import React, { useState, useEffect, useMemo } from 'react';
import { ShieldAlert, Search, RefreshCw } from 'lucide-react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';
import { auditLogService, formatAuditAction, formatAuditTable, type AuditLog } from '../../services/auditLogService';
import { LogDetailsModal } from '../../components/audits/LogDetailsModal';
import { DefaultTable } from '../../components/ui/DefaultTable';

export const LogsPage: React.FC = () => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    const { logs: fetchedLogs, error: err } = await auditLogService.fetchLogs(500);
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

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const s = searchTerm.toLowerCase();
      if (!s) return true;
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
  }, [logs, searchTerm]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage]);

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
          {searchTerm.trim() && !loading && (
            <span style={{ fontSize: '12px', color: C.onSurfaceVariant, whiteSpace: 'nowrap' }}>
              {filteredLogs.length} of {logs.length} shown
            </span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '16px', backgroundColor: `${C.error}1a`, color: C.error, borderRadius: '8px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {/* Table with pagination */}
        <DefaultTable.Container
          pagination={{
            currentPage,
            totalPages,
            totalItems: filteredLogs.length,
            itemsPerPage,
            onPageChange: setCurrentPage,
          }}
        >
          <thead>
            <tr>
              <DefaultTable.Th>Date / Time</DefaultTable.Th>
              <DefaultTable.Th>Action</DefaultTable.Th>
              <DefaultTable.Th>Table</DefaultTable.Th>
              <DefaultTable.Th>User</DefaultTable.Th>
              <DefaultTable.Th>Record ID</DefaultTable.Th>
            </tr>
          </thead>
          <tbody>
            {loading && logs.length === 0 ? (
              <DefaultTable.Tr>
                <DefaultTable.Td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: C.onSurfaceVariant }}>
                  Loading logs...
                </DefaultTable.Td>
              </DefaultTable.Tr>
            ) : filteredLogs.length === 0 ? (
              <DefaultTable.Tr>
                <DefaultTable.Td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: C.onSurfaceVariant }}>
                  No logs found.
                </DefaultTable.Td>
              </DefaultTable.Tr>
            ) : (
              paginatedLogs.map(log => {
                const actionStyle = getActionColor(log);
                const userDisplay = log.app_user 
                  ? (`${log.app_user.first_name || ''} ${log.app_user.last_name || ''}`.trim() || log.app_user.username || log.app_user.email) 
                  : log.user_id || 'System';

                return (
                  <DefaultTable.Tr 
                    key={log.id} 
                    onClick={() => setSelectedLog(log)}
                    style={{ cursor: 'pointer' }}
                  >
                    <DefaultTable.Td style={{ whiteSpace: 'nowrap' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </DefaultTable.Td>
                    <DefaultTable.Td>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                        backgroundColor: actionStyle.bg, color: actionStyle.color
                      }}>
                        {formatAuditAction(log)}
                      </span>
                    </DefaultTable.Td>
                    <DefaultTable.Td style={{ fontWeight: 500 }}>
                      {formatAuditTable(log.table_name)}
                    </DefaultTable.Td>
                    <DefaultTable.Td style={{ color: C.onSurfaceVariant }}>
                      {userDisplay}
                    </DefaultTable.Td>
                    <DefaultTable.Td style={{ color: C.onSurfaceVariant, fontFamily: 'monospace' }}>
                      {log.id.substring(0, 8)}...
                    </DefaultTable.Td>
                  </DefaultTable.Tr>
                );
              })
            )}
          </tbody>
        </DefaultTable.Container>
      </div>

      {selectedLog && (
        <LogDetailsModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
};
