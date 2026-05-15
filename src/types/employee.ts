/** Defines the data structures and roles for employees in the HOPE INC Management System. */
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';
export type EmployeeRole = 'user' | 'admin' | 'superadmin';

export interface Employee {
  id: string;
  username: string | null;
  email: string | null;
  role: EmployeeRole;
  recordstatus: EmployeeStatus;
}
