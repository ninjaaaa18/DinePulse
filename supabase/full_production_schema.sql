-- =====================================================================
-- DinePulse Complete Production Database Schema & Auth Setup
-- Execute this file in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/fumdvmqsaidzgtxchndg/sql/new
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. REUSABLE TIMESTAMP TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. RESTAURANTS TABLE
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    slug VARCHAR(100) UNIQUE,
    name TEXT NOT NULL,
    cuisine TEXT,
    description TEXT,
    delivery_time TEXT,
    logo TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    health_score NUMERIC(5, 2) DEFAULT 90.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    dietary_preferences TEXT[] DEFAULT '{}',
    allergens TEXT[] DEFAULT '{}',
    daily_calorie_target INTEGER DEFAULT 2000,
    daily_protein_target INTEGER DEFAULT 80,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MENU ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    slug VARCHAR(100),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    category TEXT,
    calories INTEGER DEFAULT 0,
    protein NUMERIC(6, 2) DEFAULT 0.00,
    carbohydrates NUMERIC(6, 2) DEFAULT 0.00,
    fat NUMERIC(6, 2) DEFAULT 0.00,
    sugar NUMERIC(6, 2) DEFAULT 0.00,
    sodium NUMERIC(6, 2) DEFAULT 0.00,
    allergens TEXT[] DEFAULT '{}',
    image TEXT,
    badge TEXT,
    badge_icon TEXT,
    wellness_score NUMERIC(5, 2) DEFAULT 85.00,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax NUMERIC(10, 2) DEFAULT 0.00,
    delivery_fee NUMERIC(10, 2) DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_calories INTEGER DEFAULT 0,
    average_meal_score NUMERIC(5, 2) DEFAULT 0.00,
    delivery_address TEXT,
    delivery_time_estimate TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    calories INTEGER DEFAULT 0,
    protein NUMERIC(6, 2) DEFAULT 0.00,
    carbohydrates NUMERIC(6, 2) DEFAULT 0.00,
    fat NUMERIC(6, 2) DEFAULT 0.00,
    sugar NUMERIC(6, 2) DEFAULT 0.00,
    sodium NUMERIC(6, 2) DEFAULT 0.00,
    allergens TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    ingredient_key TEXT,
    name TEXT NOT NULL,
    current_stock NUMERIC(10, 2) NOT NULL DEFAULT 0,
    threshold NUMERIC(10, 2) NOT NULL DEFAULT 0,
    initial_stock NUMERIC(10, 2) NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL DEFAULT 'units',
    status VARCHAR(50) DEFAULT 'Healthy',
    warning TEXT,
    cost_per_unit NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. RECIPES TABLE
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
    inventory_id UUID NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
    quantity_required NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    unit VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_menu_inventory UNIQUE (menu_item_id, inventory_id)
);

-- 10. ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS public.analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_orders INTEGER DEFAULT 0,
    revenue NUMERIC(12, 2) DEFAULT 0.00,
    average_meal_health_score NUMERIC(5, 2) DEFAULT 0.00,
    calories_served BIGINT DEFAULT 0,
    popular_dish TEXT,
    healthy_meal_percent NUMERIC(5, 2) DEFAULT 0.00,
    unhealthy_meal_percent NUMERIC(5, 2) DEFAULT 0.00,
    average_customer_satisfaction NUMERIC(3, 2) DEFAULT 0.00,
    insights JSONB DEFAULT '[]'::jsonb,
    metrics_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'info',
    priority VARCHAR(20) DEFAULT 'medium',
    category VARCHAR(50) DEFAULT 'General',
    severity VARCHAR(50) DEFAULT 'information',
    is_read BOOLEAN DEFAULT FALSE,
    dedupe_key TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. PARTNER APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.partner_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending_review',
    restaurant_name TEXT NOT NULL,
    description TEXT,
    cuisine TEXT,
    address TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_application UNIQUE (user_id)
);

DROP TRIGGER IF EXISTS update_partner_applications_updated_at ON public.partner_applications;
CREATE TRIGGER update_partner_applications_updated_at BEFORE UPDATE ON public.partner_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. TRIGGERS
DROP TRIGGER IF EXISTS update_restaurants_updated_at ON public.restaurants;
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_menu_items_updated_at ON public.menu_items;
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_updated_at ON public.inventory;
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_recipes_updated_at ON public.recipes;
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_analytics_updated_at ON public.analytics;
CREATE TRIGGER update_analytics_updated_at BEFORE UPDATE ON public.analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_partner_applications_user_id ON public.partner_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_applications_status ON public.partner_applications(status);

-- 14. INDEXES
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON public.restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_user_id ON public.restaurants(user_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON public.menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON public.order_items(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_restaurant_id ON public.inventory(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_ingredient_key ON public.inventory(ingredient_key);
CREATE INDEX IF NOT EXISTS idx_recipes_menu_item_id ON public.recipes(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_recipes_inventory_id ON public.recipes(inventory_id);
CREATE INDEX IF NOT EXISTS idx_analytics_restaurant_id ON public.analytics(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON public.analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_customer_id ON public.notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_restaurant_id ON public.notifications(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- 15. ROW LEVEL SECURITY (RLS) & POLICIES
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy Setup
DROP POLICY IF EXISTS "Allow public select on restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Allow user manage own restaurant" ON public.restaurants;
CREATE POLICY "Allow public select on restaurants" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Allow user manage own restaurant" ON public.restaurants FOR ALL USING (auth.uid() = user_id OR user_id IS NULL OR auth.role() = 'anon');

DROP POLICY IF EXISTS "Allow public read access on menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow full access on menu_items" ON public.menu_items;
CREATE POLICY "Allow public read access on menu_items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Allow full access on menu_items" ON public.menu_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow read access on customers" ON public.customers;
DROP POLICY IF EXISTS "Allow full access on customers" ON public.customers;
CREATE POLICY "Allow read access on customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Allow full access on customers" ON public.customers FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow user manage orders" ON public.orders;
CREATE POLICY "Allow user manage orders" ON public.orders FOR ALL USING (
    restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid())
    OR restaurant_id IS NULL 
    OR auth.role() = 'anon'
);

DROP POLICY IF EXISTS "Allow read access on order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow full access on order_items" ON public.order_items;
CREATE POLICY "Allow read access on order_items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Allow full access on order_items" ON public.order_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow user manage inventory" ON public.inventory;
CREATE POLICY "Allow user manage inventory" ON public.inventory FOR ALL USING (
    restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid())
    OR restaurant_id IS NULL 
    OR auth.role() = 'anon'
);

DROP POLICY IF EXISTS "Allow read access on recipes" ON public.recipes;
DROP POLICY IF EXISTS "Allow full access on recipes" ON public.recipes;
CREATE POLICY "Allow read access on recipes" ON public.recipes FOR SELECT USING (true);
CREATE POLICY "Allow full access on recipes" ON public.recipes FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow user manage analytics" ON public.analytics;
CREATE POLICY "Allow user manage analytics" ON public.analytics FOR ALL USING (
    restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid())
    OR restaurant_id IS NULL 
    OR auth.role() = 'anon'
);

DROP POLICY IF EXISTS "Allow user manage notifications" ON public.notifications;
CREATE POLICY "Allow user manage notifications" ON public.notifications FOR ALL USING (
    restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid())
    OR restaurant_id IS NULL 
    OR auth.role() = 'anon'
);

DROP POLICY IF EXISTS "Allow user manage own application" ON public.partner_applications;
DROP POLICY IF EXISTS "Allow admin manage applications" ON public.partner_applications;
CREATE POLICY "Allow user manage own application" ON public.partner_applications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow admin manage applications" ON public.partner_applications FOR ALL USING (auth.role() = 'service_role');
