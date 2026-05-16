export type DashboardFilter = 
  | { type: 'NONE' }
  | { type: 'CUSTOMER_STATUS', status: 'ACTIVE' | 'INACTIVE' }
  | { type: 'CUSTOMER', custno: string, name: string }
  | { type: 'PRODUCT', code: string, name: string }
  | { type: 'DATE', label: string };
