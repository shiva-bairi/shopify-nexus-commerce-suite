
-- 1. Remove any residual policies created from previous attempts (for safety)
DROP POLICY IF EXISTS "Admins can insert inventory logs" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view inventory logs" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can update inventory logs" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can delete inventory logs" ON public.admin_users;
DROP POLICY IF EXISTS "Users can view their admin role" ON public.admin_users;
DROP POLICY IF EXISTS "Users can insert their own admin mapping" ON public.admin_users;
DROP POLICY IF EXISTS "Users can delete their own admin mapping" ON public.admin_users;
DROP POLICY IF EXISTS "Users can update their own admin mapping" ON public.admin_users;

-- 2. Disable then enable RLS to clear everything and reload fresh
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 3. ADD ONLY PER-USER POLICIES
-- Users can see only their own record
CREATE POLICY "User can SELECT own admin_users row"
    ON public.admin_users
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert only themselves as admin
CREATE POLICY "User can INSERT own admin_users row"
    ON public.admin_users
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update only their row
CREATE POLICY "User can UPDATE own admin_users row"
    ON public.admin_users
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete only their row
CREATE POLICY "User can DELETE own admin_users row"
    ON public.admin_users
    FOR DELETE
    USING (auth.uid() = user_id);
