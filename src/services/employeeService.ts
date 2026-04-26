import { supabase } from '../lib/supabase';
import type { Employee, EmployeeRole, EmployeeStatus } from '../types/employee';

const buildStamp = (action: string, role: string, performedBy: string) => {
  const user = performedBy.split('@')[0].substring(0, 15);
  const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const stamp = `${action} by ${role.toUpperCase()}:${user} @ ${dateStr}`;
  return stamp.substring(0, 60);
};

export async function getEmployees() {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .ilike('empno', 'E%')
    .order('empno', { ascending: true });
    
  return { data: data as Employee[] | null, error: error?.message || null };
}

export async function toggleEmployeeStatus(empno: string, currentStatus: EmployeeStatus, performedBy: string, role: string) {
  const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  const action = newStatus === 'ACTIVE' ? 'Activated' : 'Deactivated';
  const stamp = buildStamp(action, role, performedBy);

  const { error } = await supabase
    .from('employees')
    .update({ recordstatus: newStatus, stamp })
    .eq('empno', empno);

  return { error: error?.message || null };
}

export async function updateEmployeeStatus(
  empno: string,
  targetRole: EmployeeRole,
  targetUserId: string,
  currentStatus: EmployeeStatus,
  actionType: 'deactivate' | 'block',
  performedBy: string,
  role: string,
  actorUserId: string,
) {
  const normalizedActorRole = role.toLowerCase();
  const isActorSuperadmin = normalizedActorRole === 'superadmin';
  const isActorAdmin = normalizedActorRole === 'admin';

  let newStatus: EmployeeStatus | null = null;
  let action = '';

  if (actionType === 'deactivate') {
    if (currentStatus === 'BLOCKED') {
      return { error: 'Blocked users cannot be deactivated. Unblock first.' };
    }
    newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    action = newStatus === 'INACTIVE' ? 'Deactivated' : 'Activated';
  } else {
    if (!(isActorAdmin || isActorSuperadmin)) {
      return { error: 'Only admin or superadmin can block/unblock users.' };
    }
    if (currentStatus === 'INACTIVE') {
      return { error: 'Deactivated users cannot be blocked.' };
    }
    if (isActorAdmin) {
      const isSelf = actorUserId === targetUserId;
      if (!(targetRole === 'employee' || (targetRole === 'admin' && isSelf))) {
        return { error: 'Admins can only block/unblock themselves and employees.' };
      }
    }
    if (currentStatus === 'BLOCKED') {
      newStatus = 'ACTIVE';
      action = 'Unblocked';
    } else {
      newStatus = 'BLOCKED';
      action = 'Blocked';
    }
  }

  const stamp = buildStamp(action, role, performedBy);
  const { error } = await supabase
    .from('employees')
    .update({ recordstatus: newStatus, stamp })
    .eq('empno', empno);

  return { error: error?.message || null };
}

export async function updateEmployeeRole(
  empno: string,
  targetCurrentRole: EmployeeRole,
  newRole: EmployeeRole,
  performedBy: string,
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

  const stamp = buildStamp(`Role->${newRole.toUpperCase()}`, actorRole, performedBy);
  const { error } = await supabase
    .from('employees')
    .update({ role: newRole, stamp })
    .eq('empno', empno);

  return { error: error?.message || null };
}