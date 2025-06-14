
-- Create a table for detailed shipping rates per zone/method with flexible conditions
CREATE TABLE public.shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID REFERENCES public.shipping_zones(id) ON DELETE CASCADE,
  method_id UUID REFERENCES public.shipping_methods(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  conditions JSONB, -- for rules like { "min_cart_value": 50, "max_weight": 10 }
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;

-- Admin RLS policy
CREATE POLICY "Admins can manage shipping rates"
  ON public.shipping_rates
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- Add carrier to orders table and ensure tracking_number exists
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS carrier TEXT,
  ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- (optional) If you want to index tracking_number for quick search:
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON public.orders(tracking_number);
