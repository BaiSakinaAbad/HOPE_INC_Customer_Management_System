import { supabase } from '../lib/supabase';
import type { Employee, EmployeeStatus } from '../types/employee';

export async function getEmployees() {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('empno', { ascending: true });
    
  return { data: data as Employee[] | null, error: error?.message || null };
}

export async function toggleEmployeeStatus(empno: string, currentStatus: EmployeeStatus, performedBy: string, role: string) {
  const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  const action = newStatus === 'ACTIVE' ? 'Activated' : 'Deactivated';
  const stamp = `${action} by ${role.toUpperCase()}:${performedBy} @ ${new Date().toISOString()}`;

  const { error } = await supabase
    .from('employees')
    .update({ recordstatus: newStatus, stamp })
    .eq('empno', empno);

  return { error: error?.message || null };
}