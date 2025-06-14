
-- Add RLS policies for inventory_logs table to allow admin access
CREATE POLICY "Admins can insert inventory logs" 
  ON public.inventory_logs 
  FOR INSERT 
  WITH CHECK (is_admin());

CREATE POLICY "Admins can view inventory logs" 
  ON public.inventory_logs 
  FOR SELECT 
  USING (is_admin());

CREATE POLICY "Admins can update inventory logs" 
  ON public.inventory_logs 
  FOR UPDATE 
  USING (is_admin());

CREATE POLICY "Admins can delete inventory logs" 
  ON public.inventory_logs 
  FOR DELETE 
  USING (is_admin());
