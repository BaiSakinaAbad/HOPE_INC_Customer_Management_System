import { supabase } from '../lib/supabase';
import type { Employee, EmployeeRole, EmployeeStatus } from '../types/employee';
import { resetPermissionsToDefaults } from './permissionService';

export async function getEmployees() {
  const { data, error } = await supabase
    .from('app_user')
    .select('id, username, email, role, record_status')
    .order('email', { ascending: true });

  const rows = (data ?? []).map((row) => ({
    id: String(row.id || ''),
    username: row.username,
    email: row.email,
    role: String(row.role ?? 'USER').toLowerCase() as EmployeeRole,
    recordstatus: String(row.record_status || 'ACTIVE').toUpperCase() as EmployeeStatus,
  }));

  return { data: rows as Employee[] | null, error: error?.message || null };
}

export async function updateEmployeeStatus(id: string, currentStatus: EmployeeStatus) {
  const newStatus: EmployeeStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  const { error } = await supabase
    .from('app_user')
    .update({ record_status: newStatus })
    .eq('id', id);

  if (error) return { error: error.message };

  // When activating a user, ensure their permission rows exist
  if (newStatus === 'ACTIVE') {
    // Fetch the user's role to determine correct defaults
    const { data: userData } = await supabase
      .from('app_user')
      .select('role')
      .eq('id', id)
      .maybeSingle();

    const userRole = (userData?.role as string ?? 'USER').toLowerCase();

    // Upsert creates missing rows, doesn't overwrite existing ones' is_granted values
    // Actually we use resetPermissionsToDefaults which does upsert — safe to call
    const { error: permError } = await resetPermissionsToDefaults(id, userRole);
    if (permError) {
      console.error('[employeeService] failed to create permissions on activation:', permError);
    }
  }

  return { error: null };
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

  if (error) return { error: error.message };

  // Auto-reset permissions to the new role's defaults
  const { error: permError } = await resetPermissionsToDefaults(id, newRole);
  if (permError) {
    console.error('[employeeService] failed to reset permissions after role change:', permError);
    // Don't block the role change — permissions reset is best-effort
  }

  return { error: null };
}
