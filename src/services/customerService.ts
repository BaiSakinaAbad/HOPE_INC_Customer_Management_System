/**
 * customerService — Supabase data access layer for the `customers` table.
 *
 * CRITICAL RULES (enforced here):
 *  1. NO `.delete()` calls anywhere in this file — soft-delete only.
 *  2. `getCustomers` adds `record_status = ACTIVE` filter for non-elevated roles.
 *  3. `stamp` is auto-generated as "<ACTION> by <ROLE>:<user> @ <ISO timestamp>".
 *  4. Permission checks use DB-backed permission flags (not just role strings).
 */
import { supabase } from '../lib/supabase';
import type { Customer, CustomerServiceResult } from '../types/customer';

const COLS = `
  custno:customer_no,
  custname:customer_name,
  address,
  payterm:payment_term,
  recordstatus:record_status,
  stamp:audit_stamp
`;

/** Build a human-readable audit stamp under 60 chars. */
const buildStamp = (action: string, role: string, performedBy: string) => {
  const user = performedBy.split('@')[0].substring(0, 15);
  const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const stamp = `${action} by ${role.toUpperCase()}:${user} @ ${dateStr}`;
  return stamp.substring(0, 60);
};

// ── Permission-checking helper ───────────────────────────────────────────────

/** Shorthand: check if a specific permission is granted. */
const hasPermission = (permissions: Record<string, boolean>, id: string): boolean =>
  permissions[id] === true;

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch active customers.
 * Requires CUST_VIEW permission.
 */
export async function getCustomers(
  _role: string,
  permissions?: Record<string, boolean>,
): Promise<CustomerServiceResult<Customer[]>> {
  if (permissions && !hasPermission(permissions, 'CUST_VIEW')) {
    return { data: null, error: 'Permission denied: you do not have access to view customers.' };
  }

  const { data, error } = await supabase
    .from('customers')
    .select(COLS)
    .eq('record_status', 'ACTIVE')
    .order('customer_name', { ascending: true });

  if (error) return { data: null, error: error.message };
  const rows = (data as Customer[]) ?? [];
  return { data: rows, error: null };
}

/**
 * Fetch soft-deleted (INACTIVE) customers.
 * Requires CUST_VIEW_INACTIVE permission.
 */
export async function getDeletedCustomers(
  _role: string,
  permissions?: Record<string, boolean>,
): Promise<CustomerServiceResult<Customer[]>> {
  if (permissions && !hasPermission(permissions, 'CUST_VIEW_INACTIVE')) {
    return { data: null, error: 'Permission denied: you do not have access to view inactive customers.' };
  }

  const { data, error } = await supabase
    .from('customers')
    .select(COLS)
    .eq('record_status', 'INACTIVE')
    .order('customer_name', { ascending: true });

  if (error) return { data: null, error: error.message };
  const rows = (data as Customer[]) ?? [];
  return { data: rows, error: null };
}

/**
 * Returns the total count of INACTIVE customers — for the stats card.
 * Requires CUST_VIEW_INACTIVE permission.
 */
export async function getInactiveCustomerCount(
  _role: string,
  permissions?: Record<string, boolean>,
): Promise<number> {
  if (permissions && !hasPermission(permissions, 'CUST_VIEW_INACTIVE')) return 0;

  const { count } = await supabase
    .from('customers')
    .select('customer_no', { count: 'exact', head: true })
    .eq('record_status', 'INACTIVE');
  return count ?? 0;
}

/**
 * Soft-delete a customer by setting `record_status` to 'INACTIVE'.
 * Requires CUST_DEL permission.
 * ⚠️ This NEVER issues a SQL DELETE — only an UPDATE.
 */
export async function softDeleteCustomer(
  custno: string,
  performedBy: string,
  role: string,
  currentStatus: 'ACTIVE' | 'INACTIVE' = 'ACTIVE',
  permissions?: Record<string, boolean>,
): Promise<CustomerServiceResult<null>> {
  if (permissions && !hasPermission(permissions, 'CUST_DEL')) {
    return { data: null, error: 'Permission denied: you do not have permission to delete customers.' };
  }

  const stamp = buildStamp(`Deleted [${currentStatus}]`, role, performedBy);
  const { error } = await supabase
    .from('customers')
    .update({ record_status: 'INACTIVE', audit_stamp: stamp })
    .eq('customer_no', custno);

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

/**
 * Restore a soft-deleted customer by setting `record_status` to 'ACTIVE'.
 * Requires CUST_RECOVER permission.
 */
export async function activateCustomer(
  custno: string,
  performedBy: string,
  role: string,
  targetStatus: 'ACTIVE' | 'INACTIVE' = 'ACTIVE',
  permissions?: Record<string, boolean>,
): Promise<CustomerServiceResult<null>> {
  if (permissions && !hasPermission(permissions, 'CUST_RECOVER')) {
    return { data: null, error: 'Permission denied: you do not have permission to restore customers.' };
  }

  const stamp = buildStamp('Restored', role, performedBy);
  const { error } = await supabase
    .from('customers')
    .update({ record_status: targetStatus, audit_stamp: stamp })
    .eq('customer_no', custno);

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

/**
 * Update a customer's information.
 * Requires CUST_EDIT permission.
 */
export async function updateCustomer(
  custno: string,
  updates: Partial<Pick<Customer, 'custname' | 'address' | 'payterm'>>,
  performedBy: string,
  role: string,
  permissions?: Record<string, boolean>,
): Promise<CustomerServiceResult<null>> {
  if (permissions && !hasPermission(permissions, 'CUST_EDIT')) {
    return { data: null, error: 'Permission denied: you do not have permission to edit customers.' };
  }

  const stamp = buildStamp('Updated', role, performedBy);
  const dbUpdates: Record<string, string | null> = { audit_stamp: stamp };
  if (updates.custname !== undefined) dbUpdates.customer_name = updates.custname;
  if (updates.address !== undefined) dbUpdates.address = updates.address;
  if (updates.payterm !== undefined) dbUpdates.payment_term = updates.payterm;
  const { error } = await supabase
    .from('customers')
    .update(dbUpdates)
    .eq('customer_no', custno);

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

/**
 * Create a new customer with auto-generated custno.
 * Requires CUST_ADD permission.
 */
export async function createCustomer(
  data: Pick<Customer, 'custname' | 'address' | 'payterm'>,
  performedBy: string,
  role: string,
  permissions?: Record<string, boolean>,
): Promise<CustomerServiceResult<null>> {
  if (permissions && !hasPermission(permissions, 'CUST_ADD')) {
    return { data: null, error: 'Permission denied: you do not have permission to add customers.' };
  }

  // Get the highest customer number currently in the DB.
  const { data: maxRecord, error: maxError } = await supabase
    .from('customers')
    .select('customer_no')
    .order('customer_no', { ascending: false })
    .limit(1);
    
  if (maxError) return { data: null, error: maxError.message };

  let newCustNo = 'C0001';
  if (maxRecord && maxRecord.length > 0) {
    const lastCustNo = maxRecord[0].customer_no;
    const match = lastCustNo.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      newCustNo = `C${String(num + 1).padStart(4, '0')}`;
    }
  }

  const stamp = buildStamp('Created', role, performedBy);
  const { error } = await supabase
    .from('customers')
    .insert({
      customer_no: newCustNo,
      customer_name: data.custname,
      address: data.address,
      payment_term: data.payterm,
      record_status: 'ACTIVE',
      audit_stamp: stamp,
    });

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}
