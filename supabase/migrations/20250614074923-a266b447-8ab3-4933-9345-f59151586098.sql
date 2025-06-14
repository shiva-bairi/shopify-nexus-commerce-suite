
-- Create marketing campaigns table
CREATE TABLE public.marketing_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  campaign_type text NOT NULL CHECK (campaign_type IN ('email', 'sms', 'automated')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed')),
  subject text,
  content text NOT NULL,
  target_segment_id uuid REFERENCES public.customer_segments(id),
  scheduled_at timestamp with time zone,
  sent_count integer DEFAULT 0,
  open_count integer DEFAULT 0,
  click_count integer DEFAULT 0,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create email templates table
CREATE TABLE public.email_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  subject text NOT NULL,
  html_content text NOT NULL,
  template_type text NOT NULL CHECK (template_type IN ('welcome', 'abandoned_cart', 'order_confirmation', 'promotional', 'winback', 'birthday')),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create automation rules table
CREATE TABLE public.automation_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  trigger_type text NOT NULL CHECK (trigger_type IN ('abandoned_cart', 'welcome', 'order_placed', 'birthday', 'winback')),
  trigger_conditions jsonb,
  action_type text NOT NULL CHECK (action_type IN ('send_email', 'send_sms', 'add_to_segment')),
  action_config jsonb NOT NULL,
  delay_hours integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create campaign recipients table
CREATE TABLE public.campaign_recipients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'failed')),
  sent_at timestamp with time zone,
  opened_at timestamp with time zone,
  clicked_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create automation executions table to track automation runs
CREATE TABLE public.automation_executions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id uuid REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  trigger_data jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'failed', 'skipped')),
  executed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_executions ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can manage marketing campaigns" ON public.marketing_campaigns
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage email templates" ON public.email_templates
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage automation rules" ON public.automation_rules
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can view campaign recipients" ON public.campaign_recipients
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can view automation executions" ON public.automation_executions
  FOR ALL USING (public.is_admin());

-- Insert default email templates
INSERT INTO public.email_templates (name, subject, html_content, template_type) VALUES
('Welcome Email', 'Welcome to our store!', 
'<h1>Welcome {{first_name}}!</h1><p>Thank you for joining us. We''re excited to have you on board!</p>', 
'welcome'),

('Abandoned Cart Recovery', 'Don''t forget your items!', 
'<h1>Hi {{first_name}},</h1><p>You left some great items in your cart. Complete your purchase now!</p><div>{{cart_items}}</div><a href="{{cart_url}}">Complete Purchase</a>', 
'abandoned_cart'),

('Birthday Special', 'Happy Birthday {{first_name}}! 🎉', 
'<h1>Happy Birthday {{first_name}}!</h1><p>Celebrate with a special discount just for you!</p><p>Use code: BIRTHDAY20 for 20% off</p>', 
'birthday'),

('Win-back Campaign', 'We miss you!', 
'<h1>Come back {{first_name}}!</h1><p>We miss you! Here''s a special offer to welcome you back.</p><p>Use code: COMEBACK15 for 15% off your next order</p>', 
'winback');

-- Insert default automation rules
INSERT INTO public.automation_rules (name, description, trigger_type, trigger_conditions, action_type, action_config, delay_hours) VALUES
('Welcome Email Automation', 'Send welcome email to new customers', 'welcome', '{}', 'send_email', '{"template_id": null, "subject": "Welcome to our store!"}', 24),

('Abandoned Cart Recovery', 'Send email to customers who abandon their cart', 'abandoned_cart', '{"min_cart_value": 10}', 'send_email', '{"template_id": null, "subject": "Don''t forget your items!"}', 2),

('Birthday Campaign', 'Send birthday emails to customers', 'birthday', '{}', 'send_email', '{"template_id": null, "subject": "Happy Birthday! 🎉"}', 0);

-- Function to trigger abandoned cart automation
CREATE OR REPLACE FUNCTION public.check_abandoned_carts()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Find carts that haven't been updated in 2 hours and haven't had automation triggered
  INSERT INTO automation_executions (rule_id, user_id, trigger_data)
  SELECT 
    ar.id,
    ci.user_id,
    jsonb_build_object(
      'cart_items', json_agg(
        jsonb_build_object(
          'product_name', p.name,
          'quantity', ci.quantity,
          'price', COALESCE(p.discount_price, p.price)
        )
      ),
      'cart_total', SUM(ci.quantity * COALESCE(p.discount_price, p.price))
    )
  FROM cart_items ci
  JOIN products p ON ci.product_id = p.id
  CROSS JOIN automation_rules ar
  WHERE ar.trigger_type = 'abandoned_cart'
    AND ar.is_active = true
    AND ci.updated_at < now() - interval '2 hours'
    AND NOT EXISTS (
      SELECT 1 FROM automation_executions ae 
      WHERE ae.rule_id = ar.id 
        AND ae.user_id = ci.user_id 
        AND ae.created_at > ci.updated_at
    )
  GROUP BY ar.id, ci.user_id
  HAVING SUM(ci.quantity * COALESCE(p.discount_price, p.price)) >= 
    COALESCE((ar.trigger_conditions->>'min_cart_value')::numeric, 0);
END;
$$;
