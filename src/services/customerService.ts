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

const COLS = 'custno, custname, address, payterm, recordstatus, stamp';

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
 * - `admin` / `superadmin`: all records.
 */
export async function getCustomers(role: string): Promise<CustomerServiceResult<Customer[]>> {
  const isRestricted = !(ELEVATED as readonly string[]).includes(role.toLowerCase());
  const qb = supabase.from('customers').select(COLS);
  const { data, error } = await (
    isRestricted ? qb.eq('recordstatus', 'ACTIVE') : qb
  ).order('custname', { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data: data as Customer[], error: null };
}

/**
 * Fetch soft-deleted (INACTIVE) customers — for admin / superadmin only.
 * UI must gate access; this function fetches without role check as an
 * additional safety layer is provided by Supabase RLS policies.
 */
export async function getDeletedCustomers(): Promise<CustomerServiceResult<Customer[]>> {
  const { data, error } = await supabase
    .from('customers')
    .select(COLS)
    .eq('recordstatus', 'INACTIVE')
    .order('custname', { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data: data as Customer[], error: null };
}

/**
 * Soft-delete a customer by setting `record_status` to 'INACTIVE'.
 * ⚠️ This NEVER issues a SQL DELETE — only an UPDATE.
 */
export async function softDeleteCustomer(
  custno: string,
  performedBy: string,
  role: string,
): Promise<CustomerServiceResult<null>> {
  const stamp = buildStamp('Deleted', role, performedBy);
  const { error } = await supabase
    .from('customers')
    .update({ recordstatus: 'INACTIVE', stamp })
    .eq('custno', custno);

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
): Promise<CustomerServiceResult<null>> {
  const stamp = buildStamp('Restored', role, performedBy);
  const { error } = await supabase
    .from('customers')
    .update({ recordstatus: 'ACTIVE', stamp })
    .eq('custno', custno);

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
  const stamp = buildStamp('Updated', role, performedBy);
  const { error } = await supabase
    .from('customers')
    .update({ ...updates, stamp })
    .eq('custno', custno);

  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}
