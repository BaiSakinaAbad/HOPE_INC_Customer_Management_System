import { supabase } from '../lib/supabase';
import type { Employee, EmployeeRole, EmployeeStatus } from '../types/employee';

export async function getEmployees() {
  const { data, error } = await supabase
    .from('app_user')
    .select('id, username, email, role, record_status')
    .order('email', { ascending: true });

  const rows = (data ?? []).map((row) => ({
    id: row.id,
    username: row.username,
    email: row.email,
    role: String(row.role ?? 'USER').toLowerCase() as EmployeeRole,
    recordstatus: row.record_status as EmployeeStatus,
  }));

  return { data: rows as Employee[] | null, error: error?.message || null };
}

export async function updateEmployeeStatus(id: string, currentStatus: EmployeeStatus) {
  const newStatus: EmployeeStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  const { error } = await supabase
    .from('app_user')
    .update({ record_status: newStatus })
    .eq('id', id);

  return { error: error?.message || null };
}

export async function updateEmployeeRole(
  id: string,
  targetCurrentRole: EmployeeRole,
  newRole: EmployeeRole,
  actorRole: string,
) {
  const normalizedActorRole = actorRole.toLowerCase();
  if (normalizedActorRole !== 'superadmin') {
    return { error: 'Only superadmin can change employee roles.' };
  }
  if (targetCurrentRole === 'superadmin') {
    return { error: 'Superadmin role cannot be changed.' };
  }
  if (targetCurrentRole === newRole) {
    return { error: null };
  }

  const { error } = await supabase
    .from('app_user')
    .update({ role: newRole.toUpperCase() })
    .eq('id', id);

  return { error: error?.message || null };
}
