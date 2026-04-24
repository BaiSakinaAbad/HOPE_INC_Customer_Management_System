export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';
export type EmployeeRole = 'employee' | 'admin' | 'superadmin';

export interface Employee {
  empno: string;
  lastname: string;
  firstname: string;
  gender: 'M' | 'F';
  birthdate: string;
  hiredate: string;
  sepdate: string | null;
  role: EmployeeRole;
  recordstatus: EmployeeStatus;
  stamp: string | null;
  user_id: string; // Hidden in UI
  email: string;   // Hidden in UI
}