
-- First, let's see what the current check constraint allows
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.inventory_logs'::regclass 
AND contype = 'c';

-- Update the check constraint to allow the values being used by the application
ALTER TABLE public.inventory_logs 
DROP CONSTRAINT IF EXISTS inventory_logs_change_type_check;

-- Add a new check constraint that allows the values the application is using
ALTER TABLE public.inventory_logs 
ADD CONSTRAINT inventory_logs_change_type_check 
CHECK (change_type IN ('initial', 'increase', 'decrease', 'no_change', 'adjustment', 'sale', 'return', 'restock'));
