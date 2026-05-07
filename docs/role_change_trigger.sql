-- ============================================================================
-- Trigger: Auto-reset user_permission rows when app_user.role changes
-- ============================================================================
-- This trigger fires AFTER an UPDATE on app_user when the role column changes.
-- It deletes the old permission rows and inserts the new role's defaults.
--
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor).
-- ============================================================================

-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION public.reset_permissions_on_role_change()
RETURNS TRIGGER AS $$
DECLARE
  perm_id TEXT;
  granted BOOLEAN;
  perm_defaults JSONB;
BEGIN
  -- Only act when the role actually changed
  IF NEW.role IS NOT DISTINCT FROM OLD.role THEN
    RETURN NEW;
  END IF;

  -- Define default permissions per role
  -- (matches the DEFAULTS in permissionService.ts)
  CASE LOWER(NEW.role)
    WHEN 'user' THEN
      perm_defaults := '{
        "ADM_USER": false, "ADM_VIEW": false, "ADM_ROLE": false, "ADM_DEACTIVATE": false,
        "CUST_ADD": false, "CUST_DEL": false, "CUST_EDIT": false, "CUST_VIEW": true,
        "CUST_VIEW_INACTIVE": false, "CUST_RECOVER": false, "CUST_STAMP": false,
        "PRICE_VIEW": true, "PROD_VIEW": true, "SALES_VIEW": true, "SD_VIEW": true
      }'::JSONB;
    WHEN 'admin' THEN
      perm_defaults := '{
        "ADM_USER": true, "ADM_VIEW": true, "ADM_ROLE": false, "ADM_DEACTIVATE": false,
        "CUST_ADD": true, "CUST_DEL": false, "CUST_EDIT": true, "CUST_VIEW": true,
        "CUST_VIEW_INACTIVE": true, "CUST_RECOVER": true, "CUST_STAMP": true,
        "PRICE_VIEW": true, "PROD_VIEW": true, "SALES_VIEW": true, "SD_VIEW": true
      }'::JSONB;
    WHEN 'superadmin' THEN
      perm_defaults := '{
        "ADM_USER": true, "ADM_VIEW": true, "ADM_ROLE": true, "ADM_DEACTIVATE": true,
        "CUST_ADD": true, "CUST_DEL": true, "CUST_EDIT": true, "CUST_VIEW": true,
        "CUST_VIEW_INACTIVE": true, "CUST_RECOVER": true, "CUST_STAMP": true,
        "PRICE_VIEW": true, "PROD_VIEW": true, "SALES_VIEW": true, "SD_VIEW": true
      }'::JSONB;
    ELSE
      -- Fallback to user defaults for unknown roles
      perm_defaults := '{
        "ADM_USER": false, "ADM_VIEW": false, "ADM_ROLE": false, "ADM_DEACTIVATE": false,
        "CUST_ADD": false, "CUST_DEL": false, "CUST_EDIT": false, "CUST_VIEW": true,
        "CUST_VIEW_INACTIVE": false, "CUST_RECOVER": false, "CUST_STAMP": false,
        "PRICE_VIEW": true, "PROD_VIEW": true, "SALES_VIEW": true, "SD_VIEW": true
      }'::JSONB;
  END CASE;

  -- Upsert all permission rows with the new role's defaults
  FOR perm_id, granted IN
    SELECT key, (value)::BOOLEAN
    FROM jsonb_each_text(perm_defaults)
  LOOP
    INSERT INTO public.user_permission (user_id, permission_id, is_granted)
    VALUES (NEW.id, perm_id, granted)
    ON CONFLICT (user_id, permission_id)
    DO UPDATE SET is_granted = granted;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop any existing version of the trigger (idempotent)
DROP TRIGGER IF EXISTS trg_reset_permissions_on_role_change ON public.app_user;

-- 3. Create the trigger
CREATE TRIGGER trg_reset_permissions_on_role_change
  AFTER UPDATE OF role ON public.app_user
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION public.reset_permissions_on_role_change();

-- ============================================================================
-- Also ensure Realtime is enabled on app_user for the frontend subscription
-- ============================================================================
-- Supabase Realtime must be enabled on the app_user table for the
-- AuthProvider's realtime subscription to detect role changes.
-- You can enable it via: Supabase Dashboard → Database → Replication → app_user
-- Or run:
ALTER PUBLICATION supabase_realtime ADD TABLE public.app_user;
