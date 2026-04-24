/**
 * Shared TypeScript types for the Customer module.
 * `address` and `payterm` are nullable to reflect real-world DB values.
 * `stamp` holds the audit trail and is hidden from employee accounts.
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
