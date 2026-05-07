/**
 * Shared TypeScript types for the Customer module.
 * The app keeps these legacy field names in the UI layer while the service
 * maps them to the updated database columns from `db-config.md`.
 */
export type CustomerStatus = 'ACTIVE' | 'INACTIVE';

export interface Customer {
  custno: string;
  custname: string;
  address: string | null;
  payterm: string | null;
  recordstatus: CustomerStatus;
  stamp: string | null;
}

export interface CustomerServiceResult<T> {
  data: T | null;
  error: string | null;
}
