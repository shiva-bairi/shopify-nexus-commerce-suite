
-- Enable RLS on products and categories tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
CREATE POLICY "Allow public read access to products" 
  ON public.products 
  FOR SELECT 
  USING (true);

-- Allow public read access to categories
CREATE POLICY "Allow public read access to categories" 
  ON public.categories 
  FOR SELECT 
  USING (true);

-- Allow public read access to product images
CREATE POLICY "Allow public read access to product images" 
  ON public.product_images 
  FOR SELECT 
  USING (true);
