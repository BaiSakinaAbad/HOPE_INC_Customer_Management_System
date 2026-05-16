//auditLogService — Handles all interaction with the audit_logs table. Provides
// methods for fetching and formatting audit records, including event labeling and user information.
import { supabase } from '../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

export interface AuditLog {
  id: string;
  table_name: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  record_id: string;
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  user_id: string | null;
  created_at: string;
  app_user?: {
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
  } | null;
}

export function formatAuditAction(log: AuditLog): string {
  if (log.action === 'UPDATE') {
    // The trigger stores identical data in old_data and new_data (both from NEW row),
    // so we read the audit_stamp that customerService writes to determine the real action.
    const stamp = ((log.new_data?.audit_stamp ?? log.old_data?.audit_stamp) as string || '').toLowerCase();
    if (stamp.startsWith('deleted'))      return 'DELETED';
    if (stamp.startsWith('restored'))     return 'RESTORED';
    if (stamp.startsWith('deactivated'))  return 'DEACTIVATED';
    if (stamp.startsWith('activated'))    return 'ACTIVATED';
    if (stamp.startsWith('created'))      return 'CREATED';
    if (stamp.startsWith('updated'))      return 'UPDATED';

    // For tables without audit_stamp (e.g. app_user), check record_status changes
    const oldStatus = log.old_data?.record_status;
    const newStatus = log.new_data?.record_status;
    if (oldStatus !== newStatus && oldStatus && newStatus) {
      if (newStatus === 'INACTIVE') return 'DEACTIVATED';
      if (newStatus === 'ACTIVE')   return 'ACTIVATED';
    }

    // For user_permission table, detect grant/revoke
    if (log.table_name === 'user_permission') {
      const oldGranted = log.old_data?.is_granted;
      const newGranted = log.new_data?.is_granted;
      if (oldGranted !== newGranted) {
        return newGranted ? 'GRANTED' : 'REVOKED';
      }
    }
  }
  return log.action;
}

export function formatAuditTable(tableName: string): string {
  const map: Record<string, string> = {
    'app_user': 'Users',
    'customers': 'Customers',
    'products': 'Products',
    'sales': 'Sales',
    'user_permission': 'User Permissions',
  };
  return map[tableName.toLowerCase()] || tableName;
}

export const auditLogService = {
  /**
   * Fetch all audit logs, sorted by most recent first.
   * Requires admin or superadmin role (canViewLogs is role-derived).
   */
  async fetchLogs(
    limit: number = 100,
    offset: number = 0,
    role?: string,
  ): Promise<{ logs: AuditLog[]; error: PostgrestError | null }> {
    // Guard: only admin/superadmin can view logs
    if (role) {
      const normalizedRole = role.toLowerCase();
      if (normalizedRole !== 'admin' && normalizedRole !== 'superadmin') {
        return { logs: [], error: { message: 'Permission denied: you do not have access to view audit logs.', details: '', hint: '', code: 'PERM_DENIED' } as PostgrestError };
      }
    }

    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          *,
          app_user:user_id (
            username,
            email,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching audit logs:', error);
        return { logs: [], error };
      }

      return { logs: data as AuditLog[], error: null };
    } catch (err) {
      console.error('Unexpected error fetching audit logs:', err);
      return { logs: [], error: err as PostgrestError };
    }
  },

  /**
   * Delete one or more audit log entries by ID.
   * Returns the count of deleted rows, or an error.
   */
  async deleteLogs(
    ids: string[],
  ): Promise<{ count: number; error: PostgrestError | null }> {
    if (!ids.length) return { count: 0, error: null };
    try {
      const { error, count } = await supabase
        .from('audit_logs')
        .delete({ count: 'exact' })
        .in('id', ids);

      if (error) {
        console.error('Error deleting audit logs:', error);
        return { count: 0, error };
      }

      const deletedCount = count ?? 0;
      if (deletedCount === 0) {
        return {
          count: 0,
          error: {
            message: 'No audit logs were deleted. This usually means the delete policy blocked the operation.',
            details: 'No rows were affected by the delete statement.',
            hint: 'Verify that the DELETE policy on audit_logs allows this user to delete these records.',
            code: 'NO_ROWS_DELETED',
          } as PostgrestError,
        };
      }

      return { count: deletedCount, error: null };
    } catch (err) {
      console.error('Unexpected error deleting audit logs:', err);
      return { count: 0, error: err as PostgrestError };
    }
  },
};
