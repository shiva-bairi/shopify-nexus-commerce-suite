
-- Create customer_segments table for segmentation
CREATE TABLE public.customer_segments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  criteria jsonb NOT NULL, -- Store segmentation rules
  customer_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create loyalty_programs table
CREATE TABLE public.loyalty_programs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  points_per_dollar numeric DEFAULT 1.0,
  tier_thresholds jsonb, -- Store tier requirements
  tier_benefits jsonb, -- Store benefits for each tier
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create customer_loyalty table to track customer loyalty status
CREATE TABLE public.customer_loyalty (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  program_id uuid REFERENCES public.loyalty_programs(id),
  points_balance integer DEFAULT 0,
  tier_level text DEFAULT 'bronze',
  lifetime_points integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, program_id)
);

-- Create customer_segment_members table for many-to-many relationship
CREATE TABLE public.customer_segment_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  segment_id uuid REFERENCES public.customer_segments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  added_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(segment_id, user_id)
);

-- Create customer_interactions table for tracking interactions
CREATE TABLE public.customer_interactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  interaction_type text NOT NULL, -- 'email', 'phone', 'chat', 'purchase', 'support'
  interaction_data jsonb,
  notes text,
  created_by uuid, -- Admin who logged the interaction
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create function to calculate customer metrics
CREATE OR REPLACE FUNCTION public.get_customer_metrics(customer_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'total_orders', COALESCE(order_stats.total_orders, 0),
    'total_spent', COALESCE(order_stats.total_spent, 0),
    'avg_order_value', COALESCE(order_stats.avg_order_value, 0),
    'last_order_date', order_stats.last_order_date,
    'support_tickets', COALESCE(support_stats.total_tickets, 0),
    'open_tickets', COALESCE(support_stats.open_tickets, 0),
    'loyalty_points', COALESCE(loyalty_stats.points_balance, 0),
    'loyalty_tier', COALESCE(loyalty_stats.tier_level, 'none')
  )
  FROM (
    SELECT 
      COUNT(*) as total_orders,
      SUM(total_amount) as total_spent,
      AVG(total_amount) as avg_order_value,
      MAX(created_at) as last_order_date
    FROM orders 
    WHERE user_id = customer_id
  ) order_stats
  CROSS JOIN (
    SELECT 
      COUNT(*) as total_tickets,
      COUNT(*) FILTER (WHERE status = 'open') as open_tickets
    FROM support_tickets 
    WHERE user_id = customer_id
  ) support_stats
  CROSS JOIN (
    SELECT 
      points_balance,
      tier_level
    FROM customer_loyalty 
    WHERE user_id = customer_id 
    LIMIT 1
  ) loyalty_stats;
$$;

-- Enable RLS on new tables
ALTER TABLE public.customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_loyalty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_segment_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can manage customer segments" ON public.customer_segments
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage loyalty programs" ON public.loyalty_programs
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can view all customer loyalty data" ON public.customer_loyalty
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view their own loyalty data" ON public.customer_loyalty
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage segment members" ON public.customer_segment_members
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage customer interactions" ON public.customer_interactions
  FOR ALL USING (public.is_admin());
