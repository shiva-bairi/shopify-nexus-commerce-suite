
-- Enable RLS on tables that don't have it yet (skip if already enabled)
DO $$
BEGIN
    -- Check and enable RLS on tables that need it
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'products' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'orders' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'order_items' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'cart_items' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'reviews' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'wishlists' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'addresses' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'notifications' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'support_tickets' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'support_messages' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create RLS policies only if they don't exist
DO $$
BEGIN
    -- Products policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Anyone can view products') THEN
        EXECUTE 'CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Admins can manage products') THEN
        EXECUTE 'CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (public.is_admin())';
    END IF;

    -- Orders policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can view their own orders') THEN
        EXECUTE 'CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin())';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can create their own orders') THEN
        EXECUTE 'CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Admins can update orders') THEN
        EXECUTE 'CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (public.is_admin())';
    END IF;

    -- Order items policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Users can view their order items') THEN
        EXECUTE 'CREATE POLICY "Users can view their order items" ON public.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR public.is_admin())))';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Users can create order items for their orders') THEN
        EXECUTE 'CREATE POLICY "Users can create order items for their orders" ON public.order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()))';
    END IF;

    -- Cart items policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cart_items' AND policyname = 'Users can manage their own cart items') THEN
        EXECUTE 'CREATE POLICY "Users can manage their own cart items" ON public.cart_items FOR ALL USING (auth.uid() = user_id)';
    END IF;

    -- Reviews policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Anyone can view approved reviews') THEN
        EXECUTE 'CREATE POLICY "Anyone can view approved reviews" ON public.reviews FOR SELECT USING (status = ''approved'' OR auth.uid() = user_id OR public.is_admin())';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Users can create their own reviews') THEN
        EXECUTE 'CREATE POLICY "Users can create their own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Users can update their own reviews') THEN
        EXECUTE 'CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id OR public.is_admin())';
    END IF;

    -- Wishlists policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wishlists' AND policyname = 'Users can manage their own wishlists') THEN
        EXECUTE 'CREATE POLICY "Users can manage their own wishlists" ON public.wishlists FOR ALL USING (auth.uid() = user_id)';
    END IF;

    -- Addresses policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'addresses' AND policyname = 'Users can manage their own addresses') THEN
        EXECUTE 'CREATE POLICY "Users can manage their own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id)';
    END IF;

    -- Notifications policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view their own notifications') THEN
        EXECUTE 'CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Admins can create notifications') THEN
        EXECUTE 'CREATE POLICY "Admins can create notifications" ON public.notifications FOR INSERT WITH CHECK (public.is_admin())';
    END IF;

    -- Support tickets policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'support_tickets' AND policyname = 'Users can view their own support tickets') THEN
        EXECUTE 'CREATE POLICY "Users can view their own support tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id OR public.is_admin())';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'support_tickets' AND policyname = 'Users can create their own support tickets') THEN
        EXECUTE 'CREATE POLICY "Users can create their own support tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'support_tickets' AND policyname = 'Admins can update support tickets') THEN
        EXECUTE 'CREATE POLICY "Admins can update support tickets" ON public.support_tickets FOR UPDATE USING (public.is_admin())';
    END IF;

    -- Support messages policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'support_messages' AND policyname = 'Users can view messages for their tickets') THEN
        EXECUTE 'CREATE POLICY "Users can view messages for their tickets" ON public.support_messages FOR SELECT USING (EXISTS (SELECT 1 FROM public.support_tickets WHERE support_tickets.id = support_messages.ticket_id AND (support_tickets.user_id = auth.uid() OR public.is_admin())))';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'support_messages' AND policyname = 'Users can create messages for their tickets') THEN
        EXECUTE 'CREATE POLICY "Users can create messages for their tickets" ON public.support_messages FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.support_tickets WHERE support_tickets.id = support_messages.ticket_id AND support_tickets.user_id = auth.uid()))';
    END IF;
END $$;

-- Add performance indexes (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
