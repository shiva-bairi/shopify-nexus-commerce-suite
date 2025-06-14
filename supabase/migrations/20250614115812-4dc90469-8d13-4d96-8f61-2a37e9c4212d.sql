
-- Create a shipping_zones table for zone management
CREATE TABLE public.shipping_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  countries TEXT[] NOT NULL, -- ISO country codes
  regions TEXT[],            -- Optional regions, e.g. states/provinces
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create a join table for associating shipping methods to zones (many-to-many)
CREATE TABLE public.shipping_zone_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES public.shipping_zones(id) ON DELETE CASCADE,
  method_id UUID NOT NULL REFERENCES public.shipping_methods(id) ON DELETE CASCADE,
  price NUMERIC, -- Custom price for this method+zone (optional)
  estimated_days INTEGER, -- Override delivery time
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security for both tables
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zone_methods ENABLE ROW LEVEL SECURITY;

-- Allow only admin users to manage zones and associations
CREATE POLICY "Admins can manage shipping zones" 
  ON public.shipping_zones
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage shipping zone methods" 
  ON public.shipping_zone_methods
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

