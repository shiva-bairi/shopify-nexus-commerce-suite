
-- TAX CONFIGURATION: store multiple tax rules (country, region, rate, type)

CREATE TABLE public.tax_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  rate NUMERIC NOT NULL,
  country TEXT NOT NULL,
  region TEXT,
  tax_type TEXT NOT NULL, -- e.g. VAT, GST, Sales
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.tax_rules ENABLE ROW LEVEL SECURITY;

-- Only admins can manage tax rules
CREATE POLICY "Admins can manage tax rules"
  ON public.tax_rules
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- KNOWLEDGE BASE: support docs, each with title, content and category

CREATE TABLE public.knowledge_base_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  is_faq BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.knowledge_base_articles ENABLE ROW LEVEL SECURITY;

-- Only admins can manage KB articles
CREATE POLICY "Admins can manage KB"
  ON public.knowledge_base_articles
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

-- OPTIONAL: allow all users to SELECT public KB/FAQ entries
CREATE POLICY "Anyone can view published KB/FAQ"
  ON public.knowledge_base_articles
  FOR SELECT
  USING (is_active = TRUE);

