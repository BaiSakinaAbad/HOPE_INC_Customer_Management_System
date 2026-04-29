/**
 * customerService — Supabase data access layer for the `customers` table.
 *
 * CRITICAL RULES (enforced here):
 *  1. NO `.delete()` calls anywhere in this file — soft-delete only.
 *  2. `getCustomers` adds `record_status = ACTIVE` filter for non-elevated roles.
 *  3. `stamp` is auto-generated as "<ACTION> by <ROLE>:<user> @ <ISO timestamp>".
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

/** Roles that may fetch ALL records (including INACTIVE). */
const ELEVATED = ['admin', 'superadmin'] as const;

/** Build a human-readable audit stamp under 60 chars. */
const buildStamp = (action: string, role: string, performedBy: string) => {
  const user = performedBy.split('@')[0].substring(0, 15);
  const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const stamp = `${action} by ${role.toUpperCase()}:${user} @ ${dateStr}`;
  return stamp.substring(0, 60);
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch customers.
 * - `employee` (any non-elevated role): ACTIVE records only.
 * - `admin` / `superadmin`: all records (UI filters table, but header uses counts).
 */
export async function getCustomers(role: string): Promise<CustomerServiceResult<Customer[]>> {
  const isRestricted = !(ELEVATED as readonly string[]).includes(role.toLowerCase());
  const qb = supabase.from('customers').select(COLS);
  const { data, error } = await (
    isRestricted ? qb.eq('record_status', 'ACTIVE') : qb
  ).order('customer_name', { ascending: true });

  if (error) return { data: null, error: error.message };
  const rows = (data as Customer[]) ?? [];
  if (isRestricted) return { data: rows, error: null };

  // Elevated roles can view inactive records, but deleted records belong only
  // in the Deleted Customers page.
  const visibleRows = rows.filter((row) => !(row.stamp ?? '').toLowerCase().startsWith('deleted'));
  return { data: visibleRows, error: null };
}

/**
 * Fetch soft-deleted (INACTIVE) customers — for admin / superadmin only.
 * UI must gate access; this function fetches without role check as an
 * additional safety layer is provided by Supabase RLS policies.
 */
export async function getDeletedCustomers(role: string): Promise<CustomerServiceResult<Customer[]>> {
  if (!(ELEVATED as readonly string[]).includes(role.toLowerCase())) {
    return { data: null, error: 'Access denied' };
  }
  const { data, error } = await supabase
    .from('customers')
    .select(COLS)
    .eq('record_status', 'INACTIVE')
    .order('customer_name', { ascending: true });

  if (error) return { data: null, error: error.message };
  const rows = (data as Customer[]) ?? [];
  const deletedRows = rows.filter((row) => (row.stamp ?? '').toLowerCase().startsWith('deleted'));
  return { data: deletedRows, error: null };
}

/**
 * Soft-delete a customer by setting `record_status` to 'INACTIVE'.
 * ⚠️ This NEVER issues a SQL DELETE — only an UPDATE.
 */
export async function softDeleteCustomer(
  custno: string,
  performedBy: string,
  role: string,
  currentStatus: 'ACTIVE' | 'INACTIVE' = 'ACTIVE',
): Promise<CustomerServiceResult<null>> {
  if (role.toLowerCase() !== 'superadmin') {
    return { data: null, error: 'Only superadmin can soft-delete.' };
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
 * Toggle-like deactivation for normal status management.
 * Admin / superadmin only.
 */
export async function deactivateCustomer(
  custno: string,
  performedBy: string,
  role: string,
): Promise<CustomerServiceResult<null>> {
  if (!(ELEVATED as readonly string[]).includes(role.toLowerCase())) {
    return { data: null, error: 'Only admin and superadmin can deactivate.' };
  }
  const stamp = buildStamp('Deactivated', role, performedBy);
  const { error } = await supabase
    .from('customers')
    .update({ record_status: 'INACTIVE', audit_stamp: stamp })
    .eq('customer_no', custno);

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

/**
 * Restore a soft-deleted customer by setting `record_status` to 'ACTIVE'.
 * Admin / superadmin only — enforced at the UI layer via useRights().
 */
export async function activateCustomer(
  custno: string,
  performedBy: string,
  role: string,
  targetStatus: 'ACTIVE' | 'INACTIVE' = 'ACTIVE',
): Promise<CustomerServiceResult<null>> {
  if (!(ELEVATED as readonly string[]).includes(role.toLowerCase())) {
    return { data: null, error: 'Only admin and superadmin can restore.' };
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
 */
export async function updateCustomer(
  custno: string,
  updates: Partial<Pick<Customer, 'custname' | 'address' | 'payterm'>>,
  performedBy: string,
  role: string,
): Promise<CustomerServiceResult<null>> {
  if (!(ELEVATED as readonly string[]).includes(role.toLowerCase())) {
    return { data: null, error: 'Only admin and superadmin can edit customers.' };
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
 */
export async function createCustomer(
  data: Pick<Customer, 'custname' | 'address' | 'payterm'>,
  performedBy: string,
  role: string,
): Promise<CustomerServiceResult<null>> {
  if (!(ELEVATED as readonly string[]).includes(role.toLowerCase())) {
    return { data: null, error: 'Only admin and superadmin can add customers.' };
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
