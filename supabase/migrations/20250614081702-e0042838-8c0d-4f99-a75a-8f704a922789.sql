
-- First, let's safely remove any problematic policies that use is_admin()
DROP POLICY IF EXISTS "Admins can insert inventory logs" ON public.inventory_logs;
DROP POLICY IF EXISTS "Admins can view inventory logs" ON public.inventory_logs;
DROP POLICY IF EXISTS "Admins can update inventory logs" ON public.inventory_logs;
DROP POLICY IF EXISTS "Admins can delete inventory logs" ON public.inventory_logs;

-- Remove any admin-specific policies on products table
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

-- Create new policies for inventory_logs that don't use is_admin()
-- Only create if they don't already exist
DO $$ 
BEGIN
    -- Check if the policy exists before creating it
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'inventory_logs' 
        AND policyname = 'Authenticated users can insert inventory logs'
    ) THEN
        CREATE POLICY "Authenticated users can insert inventory logs" 
        ON public.inventory_logs 
        FOR INSERT 
        TO authenticated
        WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'inventory_logs' 
        AND policyname = 'Authenticated users can view inventory logs'
    ) THEN
        CREATE POLICY "Authenticated users can view inventory logs" 
        ON public.inventory_logs 
        FOR SELECT 
        TO authenticated
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'inventory_logs' 
        AND policyname = 'Authenticated users can update inventory logs'
    ) THEN
        CREATE POLICY "Authenticated users can update inventory logs" 
        ON public.inventory_logs 
        FOR UPDATE 
        TO authenticated
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'inventory_logs' 
        AND policyname = 'Authenticated users can delete inventory logs'
    ) THEN
        CREATE POLICY "Authenticated users can delete inventory logs" 
        ON public.inventory_logs 
        FOR DELETE 
        TO authenticated
        USING (true);
    END IF;

    -- Create products policies only if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' 
        AND policyname = 'Anyone can view products'
    ) THEN
        CREATE POLICY "Anyone can view products" 
        ON public.products 
        FOR SELECT 
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' 
        AND policyname = 'Authenticated users can modify products'
    ) THEN
        CREATE POLICY "Authenticated users can modify products" 
        ON public.products 
        FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;
