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
   * Fetch all audit logs, sorted by most recent first
   */
  async fetchLogs(limit: number = 100, offset: number = 0): Promise<{ logs: AuditLog[]; error: PostgrestError | null }> {
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
  }
};
