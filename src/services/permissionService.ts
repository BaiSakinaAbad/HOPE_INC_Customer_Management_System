/**
 * permissionService — Supabase data-access layer for `user_permission`
 * and `app_permission` tables.
 *
 * Provides:
 *  - fetchUserPermissions(userId)   → map of permission_id → is_granted
 *  - fetchUserPermissionsDetailed(userId, roleHint?) → full rows with descriptions/modules
 *  - updateUserPermission(userId, permissionId, isGranted) → toggle one perm
 *  - resetPermissionsToDefaults(userId, role) → overwrite all perms for a role
 *
 * All DB reads have hardcoded fallbacks for when RLS blocks access.
 */
import { supabase } from '../lib/supabase';

// ── Default permissions matrix (matches the DB seed / PRD table) ─────────────

export type PermissionId =
  | 'ADM_USER'
  | 'ADM_VIEW'
  | 'ADM_ROLE'
  | 'ADM_DEACTIVATE'
  | 'CUST_ADD'
  | 'CUST_DEL'
  | 'CUST_EDIT'
  | 'CUST_VIEW'
  | 'CUST_VIEW_INACTIVE'
  | 'CUST_RECOVER'
  | 'CUST_STAMP'
  | 'PRICE_VIEW'
  | 'PROD_VIEW'
  | 'SALES_VIEW'
  | 'SD_VIEW';

export const ALL_PERMISSION_IDS: PermissionId[] = [
  'ADM_USER',
  'ADM_VIEW',
  'ADM_ROLE',
  'ADM_DEACTIVATE',
  'CUST_ADD',
  'CUST_DEL',
  'CUST_EDIT',
  'CUST_VIEW',
  'CUST_VIEW_INACTIVE',
  'CUST_RECOVER',
  'CUST_STAMP',
  'PRICE_VIEW',
  'PROD_VIEW',
  'SALES_VIEW',
  'SD_VIEW',
];

const DEFAULTS: Record<string, Record<PermissionId, boolean>> = {
  user: {
    ADM_USER: false, ADM_VIEW: false, ADM_ROLE: false, ADM_DEACTIVATE: false,
    CUST_ADD: false, CUST_DEL: false, CUST_EDIT: false, CUST_VIEW: true,
    CUST_VIEW_INACTIVE: false, CUST_RECOVER: false, CUST_STAMP: false,
    PRICE_VIEW: true, PROD_VIEW: true, SALES_VIEW: true, SD_VIEW: true,
  },
  admin: {
    ADM_USER: true, ADM_VIEW: true, ADM_ROLE: false, ADM_DEACTIVATE: false,
    CUST_ADD: true, CUST_DEL: false, CUST_EDIT: true, CUST_VIEW: true,
    CUST_VIEW_INACTIVE: true, CUST_RECOVER: true, CUST_STAMP: true,
    PRICE_VIEW: true, PROD_VIEW: true, SALES_VIEW: true, SD_VIEW: true,
  },
  superadmin: {
    ADM_USER: true, ADM_VIEW: true, ADM_ROLE: true, ADM_DEACTIVATE: true,
    CUST_ADD: true, CUST_DEL: true, CUST_EDIT: true, CUST_VIEW: true,
    CUST_VIEW_INACTIVE: true, CUST_RECOVER: true, CUST_STAMP: true,
    PRICE_VIEW: true, PROD_VIEW: true, SALES_VIEW: true, SD_VIEW: true,
  },
};

/** Return the static default map for a normalised role. */
export function getDefaultPermissions(role: string): Record<PermissionId, boolean> {
  const key = role.toLowerCase();
  return { ...(DEFAULTS[key] ?? DEFAULTS.user) };
}

// ── Hardcoded metadata fallbacks (used when RLS blocks app_permission / app_module) ──

const PERMISSION_META: Record<PermissionId, { description: string; module_id: string }> = {
  ADM_USER:           { description: 'Admin Activate User',              module_id: 'Adm_Mod' },
  ADM_VIEW:           { description: 'View User List',                   module_id: 'Adm_Mod' },
  ADM_ROLE:           { description: 'Change User Roles',               module_id: 'Adm_Mod' },
  ADM_DEACTIVATE:     { description: 'Deactivate Users',                module_id: 'Adm_Mod' },
  CUST_ADD:           { description: 'Add Customer',                    module_id: 'Cust_Mod' },
  CUST_DEL:           { description: 'Soft Delete Customer',            module_id: 'Cust_Mod' },
  CUST_EDIT:          { description: 'Edit Customer',                   module_id: 'Cust_Mod' },
  CUST_VIEW:          { description: 'View Customers',                  module_id: 'Cust_Mod' },
  CUST_VIEW_INACTIVE: { description: 'View Inactive Customers',         module_id: 'Cust_Mod' },
  CUST_RECOVER:       { description: 'Recover Soft-Deleted Customers',  module_id: 'Cust_Mod' },
  CUST_STAMP:         { description: 'View Audit Stamps',               module_id: 'Cust_Mod' },
  PRICE_VIEW:         { description: 'View Price History',              module_id: 'Prod_Mod' },
  PROD_VIEW:          { description: 'View Products',                   module_id: 'Prod_Mod' },
  SALES_VIEW:         { description: 'View Sales',                      module_id: 'Sales_Mod' },
  SD_VIEW:            { description: 'View Sales Detail',               module_id: 'Sales_Mod' },
};

const MODULE_META: Record<string, string> = {
  'Adm_Mod':   'Admin Module',
  'Cust_Mod':  'Customer Module',
  'Prod_Mod':  'Product Module',
  'Sales_Mod': 'Sales Module',
};

// ── DB operations ────────────────────────────────────────────────────────────

export interface PermissionRow {
  permission_id: string;
  is_granted: boolean;
}

export interface DetailedPermission {
  permission_id: string;
  description: string;
  module_id: string;
  module_name: string;
  is_granted: boolean;
}

/**
 * Fetch the flat permission map for a user (permission_id → is_granted).
 */
export async function fetchUserPermissions(
  userId: string,
): Promise<{ data: Record<string, boolean> | null; error: string | null }> {
  const { data, error } = await supabase
    .from('user_permission')
    .select('permission_id, is_granted')
    .eq('user_id', userId);

  if (error) return { data: null, error: error.message };

  const map: Record<string, boolean> = {};
  for (const row of (data ?? []) as PermissionRow[]) {
    map[row.permission_id] = row.is_granted;
  }
  return { data: map, error: null };
}

/**
 * Fetch permissions with descriptions and module names for the modal UI.
 * Falls back to hardcoded metadata when DB tables are RLS-blocked.
 */
export async function fetchUserPermissionsDetailed(
  userId: string,
  roleHint?: string,
): Promise<{ data: DetailedPermission[] | null; error: string | null }> {
  // 1. Fetch user_permission rows (may be empty due to RLS)
  const { data: userPerms, error: upErr } = await supabase
    .from('user_permission')
    .select('permission_id, is_granted')
    .eq('user_id', userId);

  if (upErr) {
    console.warn('[permissionService] user_permission read blocked (RLS?):', upErr.message);
  }

  // 2. Fetch app_permission rows (may be empty due to RLS)
  const { data: appPerms } = await supabase
    .from('app_permission')
    .select('permission_id, description, module_id')
    .eq('status', 'ACTIVE');

  // 3. Fetch module names (may be empty due to RLS)
  const { data: modules } = await supabase
    .from('app_module')
    .select('module_id, module_name')
    .eq('status', 'ACTIVE');

  // Build module map — hardcoded first, then overlay DB values
  const moduleMap: Record<string, string> = { ...MODULE_META };
  for (const m of (modules ?? [])) {
    moduleMap[m.module_id] = m.module_name;
  }

  // Build user permission map — DB first, fall back to role defaults
  const userPermMap: Record<string, boolean> = {};
  const dbRows = (userPerms ?? []) as PermissionRow[];

  console.log('[permissionService] DB rows for user', userId, ':', JSON.stringify(dbRows));

  if (dbRows.length > 0) {
    for (const row of dbRows) {
      userPermMap[row.permission_id] = row.is_granted;
    }
  } else if (roleHint) {
    console.log('[permissionService] No DB rows, using role defaults for:', roleHint);
    const defaults = getDefaultPermissions(roleHint);
    for (const [k, v] of Object.entries(defaults)) {
      userPermMap[k] = v;
    }
  }

  console.log('[permissionService] userPermMap:', JSON.stringify(userPermMap));

  // Build permission list — use DB if available, otherwise hardcoded metadata
  const permList = (appPerms && appPerms.length > 0)
    ? (appPerms as { permission_id: string; description: string; module_id: string }[])
    : ALL_PERMISSION_IDS.map((pid) => ({
        permission_id: pid,
        description: PERMISSION_META[pid].description,
        module_id: PERMISSION_META[pid].module_id,
      }));

  const result: DetailedPermission[] = permList.map((ap) => ({
    permission_id: ap.permission_id,
    description: ap.description,
    module_id: ap.module_id,
    module_name: moduleMap[ap.module_id] ?? ap.module_id,
    is_granted: userPermMap[ap.permission_id] ?? false,
  }));

  console.log('[permissionService] Final result ADM_USER:', result.find(r => r.permission_id === 'ADM_USER'));

  return { data: result, error: null };
}

/**
 * Toggle a single permission for a user.
 * Verifies the update actually persisted (RLS can silently block writes).
 */
export async function updateUserPermission(
  userId: string,
  permissionId: string,
  isGranted: boolean,
): Promise<{ error: string | null }> {
  const { error, count } = await supabase
    .from('user_permission')
    .update({ is_granted: isGranted })
    .eq('user_id', userId)
    .eq('permission_id', permissionId)
    .select()
    .then(res => ({ ...res, count: res.data?.length ?? 0 }));

  if (error) return { error: error.message };

  if (count === 0) {
    return { error: 'Permission update was blocked. You may not have write access.' };
  }

  return { error: null };
}

/**
 * Reset ALL permissions for a user to the defaults for the given role.
 * Uses upsert to handle both existing and missing rows.
 */
export async function resetPermissionsToDefaults(
  userId: string,
  role: string,
): Promise<{ error: string | null }> {
  const defaults = getDefaultPermissions(role);
  const rows = ALL_PERMISSION_IDS.map((pid) => ({
    user_id: userId,
    permission_id: pid,
    is_granted: defaults[pid] ?? false,
  }));

  const { error } = await supabase
    .from('user_permission')
    .upsert(rows, { onConflict: 'user_id,permission_id' });

  if (error) return { error: error.message };
  return { error: null };
}
