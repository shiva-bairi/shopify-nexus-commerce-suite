
-- Remove existing recursive RLS policies on admin_users
DROP POLICY IF EXISTS "Admins can insert inventory logs" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view inventory logs" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can update inventory logs" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can delete inventory logs" ON public.admin_users;

-- Disable then enable RLS to clear existing policies
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Allow users to read admin_users only if they are the user or if you want all admins to see all rows
CREATE POLICY "Users can view their admin role" 
  ON public.admin_users
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to add themselves as admin (or you can restrict to super_admin later)
CREATE POLICY "Users can insert their own admin mapping"
  ON public.admin_users
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to remove their own admin mapping (or you can restrict to super_admin later)
CREATE POLICY "Users can delete their own admin mapping"
  ON public.admin_users
  FOR DELETE
  USING (auth.uid() = user_id);

-- (Optional) restrict update, if you want only the owner to update their own row
CREATE POLICY "Users can update their own admin mapping"
  ON public.admin_users
  FOR UPDATE
  USING (auth.uid() = user_id);
