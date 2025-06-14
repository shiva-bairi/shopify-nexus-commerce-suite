
-- Mark some existing products as featured so they show up on the home page
UPDATE products 
SET is_featured = true 
WHERE id IN (
  SELECT id 
  FROM products 
  LIMIT 6
);

-- Also ensure we have some sample products with images if the table is empty
-- (This is a safe operation that won't duplicate data)
INSERT INTO products (name, description, price, category_id, stock, is_featured, brand, sku)
SELECT 
  'Sample Product ' || generate_series,
  'This is a sample product description for product ' || generate_series,
  (random() * 100 + 10)::numeric(10,2),
  NULL,
  (random() * 50 + 5)::integer,
  CASE WHEN generate_series <= 3 THEN true ELSE false END,
  'Sample Brand',
  'SKU' || LPAD(generate_series::text, 6, '0')
FROM generate_series(1, 10)
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

-- Add sample product images for the products we just created or updated
INSERT INTO product_images (product_id, image_url, is_primary)
SELECT 
  p.id,
  '/placeholder.svg',
  true
FROM products p
WHERE NOT EXISTS (
  SELECT 1 FROM product_images pi WHERE pi.product_id = p.id
)
LIMIT 10;
