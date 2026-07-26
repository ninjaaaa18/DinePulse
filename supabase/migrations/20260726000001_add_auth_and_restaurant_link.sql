-- Migration to link Auth Users to Restaurant Profiles & Update RLS Policies

-- Add user_id column to restaurants table if not present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurants' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.restaurants 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create index on user_id for faster lookup
CREATE INDEX IF NOT EXISTS idx_restaurants_user_id ON public.restaurants(user_id);

-- UPDATED RLS POLICIES FOR TENANT ISOLATION

-- Restaurants
DROP POLICY IF EXISTS "Allow public read access on restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Allow full access on restaurants" ON public.restaurants;

CREATE POLICY "Allow public select on restaurants" 
ON public.restaurants FOR SELECT 
USING (true);

CREATE POLICY "Allow user manage own restaurant" 
ON public.restaurants FOR ALL 
USING (auth.uid() = user_id OR user_id IS NULL OR auth.role() = 'anon');

-- Orders
DROP POLICY IF EXISTS "Allow read access on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow full access on orders" ON public.orders;

CREATE POLICY "Allow user manage orders" 
ON public.orders FOR ALL 
USING (
    restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid())
    OR restaurant_id IS NULL 
    OR auth.role() = 'anon'
);

-- Inventory
DROP POLICY IF EXISTS "Allow read access on inventory" ON public.inventory;
DROP POLICY IF EXISTS "Allow full access on inventory" ON public.inventory;

CREATE POLICY "Allow user manage inventory" 
ON public.inventory FOR ALL 
USING (
    restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid())
    OR restaurant_id IS NULL 
    OR auth.role() = 'anon'
);

-- Analytics
DROP POLICY IF EXISTS "Allow read access on analytics" ON public.analytics;
DROP POLICY IF EXISTS "Allow full access on analytics" ON public.analytics;

CREATE POLICY "Allow user manage analytics" 
ON public.analytics FOR ALL 
USING (
    restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid())
    OR restaurant_id IS NULL 
    OR auth.role() = 'anon'
);

-- Notifications
DROP POLICY IF EXISTS "Allow read access on notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow full access on notifications" ON public.notifications;

CREATE POLICY "Allow user manage notifications" 
ON public.notifications FOR ALL 
USING (
    restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid())
    OR restaurant_id IS NULL 
    OR auth.role() = 'anon'
);
