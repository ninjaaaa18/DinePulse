-- Allow customers to SELECT their own orders
-- Without this policy, customers cannot view their own orders
-- because the existing "Allow user manage orders" policy only grants access
-- to restaurant owners (via auth.uid() matching restaurants.user_id).
DROP POLICY IF EXISTS "Allow customer read own orders" ON public.orders;
CREATE POLICY "Allow customer read own orders" ON public.orders
  FOR SELECT
  USING (
    customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
  );

-- Allow customers to SELECT their own notifications
DROP POLICY IF EXISTS "Allow customer read own notifications" ON public.notifications;
CREATE POLICY "Allow customer read own notifications" ON public.notifications
  FOR SELECT
  USING (
    customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid())
  );
