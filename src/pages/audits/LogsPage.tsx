// Shows all audit logs with search, filtering, pagination, and bulk delete.
// Superadmin: can select (checkbox), delete, and view logs.
// Admin and other roles: view-only (no checkboxes, no delete).
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ShieldAlert, Search, RefreshCw, Trash2, X, AlertTriangle, Loader2, Check } from 'lucide-react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';
import { useAuth } from '../../providers/AuthProvider';
import {
  auditLogService, formatAuditAction, formatAuditTable, type AuditLog,
} from '../../services/auditLogService';
import { LogDetailsModal } from '../../components/audits/LogDetailsModal';
import { DefaultTable } from '../../components/ui/DefaultTable';

// ─── helpers ────────────────────────────────────────────────────────────────

const getActionColor = (log: AuditLog, C: ReturnType<typeof getDashboardTokens>) => {
  const act = formatAuditAction(log);
  switch (act) {
    case 'INSERT':
    case 'CREATED':     return { bg: `${C.primary}1a`,        color: C.primary };
    case 'DELETED':
    case 'DELETE':      return { bg: `${C.error}1a`,          color: C.error };
    case 'DEACTIVATED':
    case 'REVOKED':     return { bg: '#f973161a',              color: '#f97316' };
    case 'RESTORED':
    case 'ACTIVATED':
    case 'GRANTED':     return { bg: 'rgba(34,197,94,0.10)',  color: '#22c55e' };
    case 'UPDATED':
    case 'UPDATE':      return { bg: '#eab3081a',              color: '#eab308' };
    default:            return { bg: `${C.outlineVariant}33`, color: C.onSurface };
  }
};

const getUserDisplay = (log: AuditLog) =>
  log.app_user
    ? (`${log.app_user.first_name || ''} ${log.app_user.last_name || ''}`.trim()
        || log.app_user.username
        || log.app_user.email
        || 'System')
    : log.user_id || 'System';

// ─── Custom checkbox ─────────────────────────────────────────────────────────
// Renders a small pill-styled checkbox that matches the app design system.
// Indeterminate state (dash) is used for the header "select page" checkbox.

interface StyledCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (e: React.MouseEvent) => void;
  primary: string;
  isDark: boolean;
}

const StyledCheckbox: React.FC<StyledCheckboxProps> = ({ checked, indeterminate, onChange, primary, isDark }) => {
  const [hovered, setHovered] = useState(false);

  const active = checked || indeterminate;
  const bg      = active ? primary : 'transparent';
  const border  = active
    ? primary
    : hovered
      ? `${primary}88`
      : isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.22)';

  return (
    <div
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      tabIndex={0}
      onClick={onChange}
      onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') onChange(e as any); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '17px', height: '17px',
        borderRadius: '5px',
        border: `2px solid ${border}`,
        backgroundColor: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0,
        transition: 'background-color 0.15s, border-color 0.15s',
        boxShadow: hovered && !active ? `0 0 0 3px ${primary}22` : 'none',
        outline: 'none',
      }}
    >
      {indeterminate && !checked && (
        <span style={{ width: '9px', height: '2px', backgroundColor: '#fff', borderRadius: '1px', display: 'block' }} />
      )}
      {checked && (
        <Check size={11} color="#fff" strokeWidth={3} />
      )}
    </div>
  );
};

// ─── component ───────────────────────────────────────────────────────────────

export const LogsPage: React.FC = () => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  const { role } = useAuth();

  // Superadmin is the only role that can select and delete logs
  const canEdit = role === 'superadmin';

  // ── data ──
  const [logs, setLogs]       = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // ── modal ──
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // ── search / pagination ──
  const [searchTerm, setSearchTerm]   = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // ── multi-selection (superadmin only) ──
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const lastClickedIndexRef = useRef<number | null>(null);

  // ── delete ──
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting]           = useState(false);
  const [deleteError, setDeleteError]     = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { logs: fetched, error: err } = await auditLogService.fetchLogs(500);
    if (err) setError(err.message || 'Failed to load audit logs.');
    else setLogs(fetched);
    setLoading(false);
  }, []);

  useEffect(() => { void fetchLogs(); }, [fetchLogs]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
    lastClickedIndexRef.current = null;
  }, [searchTerm]);

  // ── derived ──
  const filteredLogs = useMemo(() => {
    const s = searchTerm.toLowerCase();
    if (!s) return logs;
    return logs.filter(log => {
      const user = getUserDisplay(log);
      return (
        formatAuditTable(log.table_name).toLowerCase().includes(s) ||
        formatAuditAction(log).toLowerCase().includes(s)           ||
        user.toLowerCase().includes(s)                             ||
        log.id.toLowerCase().includes(s)
      );
    });
  }, [logs, searchTerm]);

  const totalPages    = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage]);

  // ── selection helpers ──
  const allFilteredIds    = useMemo(() => filteredLogs.map(l => l.id), [filteredLogs]);
  const pageIds           = useMemo(() => paginatedLogs.map(l => l.id), [paginatedLogs]);
  const someSelected      = selectedIds.size > 0;
  const isAllSelected     = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedIds.has(id));
  const pageAllSelected   = pageIds.length > 0 && pageIds.every(id => selectedIds.has(id));
  const pageSomeSelected  = pageIds.some(id => selectedIds.has(id));
  // Header checkbox is "indeterminate" when some (but not all) page rows are checked
  const pageIndeterminate = pageSomeSelected && !pageAllSelected;

  /**
   * Handle selection (row body or checkbox click).
   * - Plain click (canEdit): toggle selection + open modal
   * - Shift+click (canEdit): range-select, no modal (multi-selecting)
   * - fromCheckbox: skip modal (checkbox is purely for selection)
   */
  const handleRowClick = (
    log: AuditLog,
    filteredIndex: number,
    e: React.MouseEvent,
    fromCheckbox = false,
  ) => {
    if (e.shiftKey && lastClickedIndexRef.current !== null) {
      // Range select: never opens the modal
      const from = Math.min(lastClickedIndexRef.current, filteredIndex);
      const to   = Math.max(lastClickedIndexRef.current, filteredIndex);
      setSelectedIds(prev => {
        const next = new Set(prev);
        for (let i = from; i <= to; i++) next.add(filteredLogs[i].id);
        return next;
      });
      return; // keep anchor unchanged
    }

    // Capture selection state BEFORE toggling so we know whether this is a
    // select or a deselect click.
    const wasAlreadySelected = selectedIds.has(log.id);

    // Plain toggle
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(log.id) ? next.delete(log.id) : next.add(log.id);
      return next;
    });
    lastClickedIndexRef.current = filteredIndex;

    // Open the detail modal only when SELECTING (not when deselecting).
    // Clicking an already-checked row deselects it cleanly with no modal.
    if (!fromCheckbox && !wasAlreadySelected) {
      setSelectedLog(log);
    }
  };

  const togglePageAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pageAllSelected) {
      setSelectedIds(prev => { const n = new Set(prev); pageIds.forEach(id => n.delete(id)); return n; });
    } else {
      setSelectedIds(prev => { const n = new Set(prev); pageIds.forEach(id => n.add(id)); return n; });
    }
    lastClickedIndexRef.current = null;
  };

  const selectAll = () => { setSelectedIds(new Set(allFilteredIds)); lastClickedIndexRef.current = null; };
  const clearAll  = () => { setSelectedIds(new Set()); lastClickedIndexRef.current = null; };

  // ── delete ──
  const handleDelete = async () => {
    if (!selectedIds.size) return;
    setDeleting(true);
    setDeleteError(null);

    const { count, error: err } = await auditLogService.deleteLogs([...selectedIds]);
    if (err) {
      setDeleteError(err.message || 'Failed to delete logs.');
      setDeleting(false);
      return;
    }

    if (!count) {
      setDeleteError('No audit logs were deleted. This may be a delete permission issue.');
      setDeleting(false);
      return;
    }

    setLogs(prev => prev.filter(l => !selectedIds.has(l.id)));
    setSelectedIds(new Set());
    lastClickedIndexRef.current = null;
    setDeleteConfirm(false);
    setDeleting(false);
  };

  // colSpan depends on whether checkbox column is shown
  const colSpan = canEdit ? 6 : 5;

  return (
    <div style={{ flex: 1, padding: '32px 24px 48px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{
              margin: 0, fontFamily: C.font.headline, fontSize: '28px',
              fontWeight: 800, color: isDark ? '#fff' : '#1a1a2e',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <ShieldAlert size={28} color={C.primary} />
              Audit Logs
            </h1>
            <p style={{ margin: '4px 0 0', color: C.onSurfaceVariant, fontSize: '14px' }}>
              Track all creation, modification, and deletion events across the system.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Selection actions — superadmin only */}
            {canEdit && someSelected && (
              <>
                {!isAllSelected && (
                  <button
                    onClick={selectAll}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '7px',
                      padding: '9px 14px', borderRadius: '10px',
                      border: `1px solid ${C.primary}44`,
                      backgroundColor: `${C.primary}0f`, color: C.primary,
                      fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Select all {filteredLogs.length}
                  </button>
                )}
                <button
                  onClick={clearAll}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    padding: '9px 14px', borderRadius: '10px',
                    border: `1px solid ${C.outlineVariant}55`,
                    backgroundColor: 'transparent', color: C.onSurfaceVariant,
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Deselect all
                </button>
                <button
                  onClick={() => { setDeleteError(null); setDeleteConfirm(true); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    padding: '9px 14px', borderRadius: '10px',
                    backgroundColor: `${C.error}18`, border: `1px solid ${C.error}44`,
                    color: C.error, cursor: 'pointer',
                    fontSize: '13px', fontWeight: 600,
                  }}
                >
                  <Trash2 size={14} />
                  Delete {selectedIds.size}
                </button>
              </>
            )}

            <button
              onClick={() => void fetchLogs()}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '9px 14px', borderRadius: '10px',
                backgroundColor: 'transparent', border: `1px solid ${C.outlineVariant}55`,
                color: C.onSurfaceVariant, cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '13px', fontWeight: 600, opacity: loading ? 0.6 : 1,
              }}
            >
              <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Search ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          backgroundColor: C.surface, padding: '12px 16px', borderRadius: '12px',
          border: `1px solid ${C.outlineVariant}33`, boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}>
          <Search size={18} color={C.onSurfaceVariant} />
          <input
            type="text"
            placeholder="Search logs by table, action, user, or record ID…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: C.onSurface, fontSize: '14px', fontFamily: C.font.body,
            }}
          />
          {searchTerm.trim() && !loading && (
            <span style={{ fontSize: '12px', color: C.onSurfaceVariant, whiteSpace: 'nowrap' }}>
              {filteredLogs.length} of {logs.length} shown
            </span>
          )}
        </div>

        {/* ── Selection hint bar ── */}
        {canEdit && someSelected && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 14px', borderRadius: '8px',
            backgroundColor: `${C.primary}0d`, border: `1px solid ${C.primary}28`,
            fontSize: '12px', color: C.onSurfaceVariant,
          }}>
            <span style={{ color: C.primary, fontWeight: 600 }}>{selectedIds.size}</span>
            <span>selected — Shift+click to range-select · rows are view-only while selecting</span>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', borderRadius: '10px',
            backgroundColor: `${C.error}18`, border: `1px solid ${C.error}33`,
            color: C.error, fontSize: '13px',
          }}>
            <AlertTriangle size={16} /><span>{error}</span>
          </div>
        )}

        {/* ── Table ── */}
        <DefaultTable.Container
          pagination={{
            currentPage, totalPages,
            totalItems: filteredLogs.length,
            itemsPerPage,
            onPageChange: setCurrentPage,
          }}
        >
          <thead>
            <tr>
              {/* Checkbox header — superadmin only */}
              {canEdit && (
                <th style={{
                  width: '48px', padding: '12px 8px 12px 18px',
                  backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.06)',
                  borderBottom: `1px solid ${C.outlineVariant}33`,
                  verticalAlign: 'middle',
                }}>
                  <StyledCheckbox
                    checked={pageAllSelected}
                    indeterminate={pageIndeterminate}
                    onChange={togglePageAll}
                    primary={C.primary}
                    isDark={isDark}
                  />
                </th>
              )}
              <DefaultTable.Th>Date / Time</DefaultTable.Th>
              <DefaultTable.Th>Action</DefaultTable.Th>
              <DefaultTable.Th>Table</DefaultTable.Th>
              <DefaultTable.Th>User</DefaultTable.Th>
              <DefaultTable.Th>Record ID</DefaultTable.Th>
            </tr>
          </thead>
          <tbody>
            {loading && logs.length === 0 ? (
              <tr>
                <td colSpan={colSpan} style={{ padding: '48px', textAlign: 'center', color: C.onSurfaceVariant }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Loading logs…
                  </div>
                </td>
              </tr>
            ) : paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan={colSpan} style={{ padding: '48px', textAlign: 'center', color: C.onSurfaceVariant, fontSize: '14px' }}>
                  No logs found.
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log, pageIdx) => {
                const actionStyle  = getActionColor(log, C);
                const userDisplay  = getUserDisplay(log);
                const isChecked    = selectedIds.has(log.id);
                const filteredIdx  = (currentPage - 1) * itemsPerPage + pageIdx;

                return (
                  <DefaultTable.Tr
                    key={log.id}
                    onClick={e => {
                      if (canEdit) {
                        // Superadmin: row click toggles selection (+ opens modal on plain click)
                        handleRowClick(log, filteredIdx, e, false);
                      } else {
                        // View-only: always open modal
                        setSelectedLog(log);
                      }
                    }}
                    style={{
                      cursor: 'pointer',
                      ...(isChecked
                        ? { backgroundColor: isDark ? `${C.primary}1c` : `${C.primary}0c` }
                        : {}),
                    }}
                  >
                    {/* Checkbox cell — superadmin only; stops propagation so it doesn't double-fire the row handler */}
                    {canEdit && (
                      <DefaultTable.Td style={{ width: '48px', padding: '13px 8px 13px 18px' }}>
                        <StyledCheckbox
                          checked={isChecked}
                          onChange={e => {
                            e.stopPropagation();
                            handleRowClick(log, filteredIdx, e, true);
                          }}
                          primary={C.primary}
                          isDark={isDark}
                        />
                      </DefaultTable.Td>
                    )}

                    <DefaultTable.Td style={{ whiteSpace: 'nowrap' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </DefaultTable.Td>

                    <DefaultTable.Td>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 9px', borderRadius: '6px',
                        fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em',
                        backgroundColor: actionStyle.bg, color: actionStyle.color,
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

                    <DefaultTable.Td style={{ fontFamily: 'monospace', fontSize: '12px', color: C.onSurfaceVariant }}>
                      {log.id.substring(0, 8)}…
                    </DefaultTable.Td>
                  </DefaultTable.Tr>
                );
              })
            )}
          </tbody>
        </DefaultTable.Container>
      </div>

      {/* ── Log Details Modal ── */}
      {selectedLog && (
        <LogDetailsModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirm && canEdit && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }}>
          <div
            onClick={() => { if (!deleting) setDeleteConfirm(false); }}
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          />
          <div style={{
            position: 'relative', width: '100%', maxWidth: '440px',
            backgroundColor: isDark ? C.surfaceContainerHigh : '#ffffff',
            borderRadius: '20px', border: `1px solid ${C.outlineVariant}33`,
            boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '24px 24px 16px',
              borderBottom: `1px solid ${C.outlineVariant}22`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                  backgroundColor: `${C.error}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Trash2 size={22} style={{ color: C.error }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: C.onSurface }}>
                    Delete Audit Logs
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: C.onSurfaceVariant }}>
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <button
                onClick={() => { if (!deleting) { setDeleteConfirm(false); setDeleteError(null); } }}
                style={{ background: 'none', border: 'none', color: C.onSurfaceVariant, cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: C.onSurface, lineHeight: 1.6 }}>
                You are about to permanently delete{' '}
                <strong style={{ color: C.error }}>{selectedIds.size}</strong>{' '}
                audit log{selectedIds.size !== 1 ? 's' : ''}. These records cannot be recovered.
              </p>

              {deleteError && (
                <div style={{
                  marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 14px', borderRadius: '8px',
                  backgroundColor: `${C.error}15`, border: `1px solid ${C.error}33`,
                  color: C.error, fontSize: '13px',
                }}>
                  <AlertTriangle size={15} />{deleteError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  onClick={() => { setDeleteConfirm(false); setDeleteError(null); }}
                  disabled={deleting}
                  style={{
                    padding: '9px 20px', borderRadius: '10px',
                    border: `1px solid ${C.outlineVariant}55`,
                    backgroundColor: 'transparent', color: C.onSurfaceVariant,
                    fontSize: '13px', fontWeight: 600,
                    cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => void handleDelete()}
                  disabled={deleting}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    padding: '9px 20px', borderRadius: '10px',
                    border: 'none', backgroundColor: C.error,
                    color: '#fff', fontSize: '13px', fontWeight: 600,
                    cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.8 : 1,
                  }}
                >
                  {deleting
                    ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Deleting…</>
                    : <><Trash2 size={14} /> Delete {selectedIds.size} log{selectedIds.size !== 1 ? 's' : ''}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
