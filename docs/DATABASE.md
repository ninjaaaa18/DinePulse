# Database — DinePulse Supabase Implementation

## Supabase Architecture

| Property | Value |
|----------|-------|
| **Project URL** | `https://fumdvmqsaidzgtxchndg.supabase.co` |
| **SDK** | `@supabase/ssr` 0.12.3 + `@supabase/supabase-js` 2.110.8 |
| **Browser Client** | `createBrowserClient<Database>()` in `src/lib/supabase/client.ts` |
| **Server Client** | `createServerClient<Database>()` with `cookies()` in `src/lib/supabase/server.ts` |
| **Middleware** | `proxy.ts` — session refresh + route guard for `/dashboard/:path*` |
| **Extensions** | `uuid-ossp`, `pgcrypto` |

### Client Architecture

```
Browser (client.ts)                    Next.js Server (server.ts)
  createBrowserClient()                  createServerClient()
  └→ Uses browser cookies               └→ Uses cookies() from next/headers
  └→ PKCE flow handled                   └→ getAll() / setAll() cookie interface
  automatically                          └→ Used in API routes + server actions

Middleware (proxy.ts)
  └→ createServerClient() with request/response cookies
  └→ Refreshes session on every matching request
  └→ Guards /dashboard routes against unauthenticated access
```

---

## ER Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                               auth.users                                     │
│                                (built-in)                                    │
└─┬──────────┬──────────────┬──────────────┬────────────────┬─────────────────┘
  │ 1:1      │ 1:N          │ 1:N          │ 1:N            │ 1:N
  ▼          ▼              ▼              ▼                ▼
┌──────┐ ┌──────────┐ ┌────────────┐ ┌──────────────┐ ┌──────────────────────┐
│profiles│ │restaurants│ │ customers  │ │partner_appls │ │ (auth sessions etc.) │
│ id FK │ │ user_id  │ │ user_id    │ │ user_id       │ │                      │
│ role  │ │          │ │            │ │               │ │                      │
└───────┘ └─┬────────┘ └────────────┘ └──────────────┘ └──────────────────────┘
            │
            │ 1:N
            ├─────────────────────────────────────────────────┐
            │                                                 │
            ▼                                                 ▼
    ┌──────────────┐                                   ┌──────────────┐
    │  menu_items   │                                   │   inventory   │
    │restaurant_id FK│                                  │restaurant_id FK│
    └──────┬───────┘                                   └──────┬───────┘
           │ 1:N                                              │ 1:N
           ▼                                                  ▼
    ┌────────────────┐                                 ┌──────────────┐
    │    recipes      │                                 │  analytics    │
    │menu_item_id FK  │                                 │restaurant_id FK│
    │inventory_id FK  │                                 └──────────────┘
    │UNIQUE(menu_item, inventory) │
    └────────────────┘              ┌───────────────────┐
                                    │   notifications    │
            ┌───────────────────────│restaurant_id FK    │
            │                       │customer_id FK      │
            │                       └───────────────────┘
            ▼
    ┌──────────────┐
    │    orders     │
    │customer_id FK │
    │restaurant_id FK│
    └──────┬───────┘
           │ 1:N
           ▼
    ┌──────────────┐
    │  order_items  │
    │  order_id FK  │
    │menu_item_id FK│
    └──────────────┘
```

---

## Tables

### 1. `public.restaurants`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | UUID | PK | `gen_random_uuid()` |
| user_id | UUID | FK → `auth.users(id)` ON DELETE CASCADE | NULL |
| slug | VARCHAR(100) | UNIQUE | NULL |
| name | TEXT | NOT NULL | — |
| cuisine | TEXT | — | NULL |
| description | TEXT | — | NULL |
| delivery_time | TEXT | — | NULL |
| logo | TEXT | — | NULL |
| address | TEXT | — | NULL |
| phone | TEXT | — | NULL |
| email | TEXT | — | NULL |
| health_score | NUMERIC(5,2) | — | 90.00 |
| is_active | BOOLEAN | — | TRUE |
| created_at | TIMESTAMPTZ | — | NOW() |
| updated_at | TIMESTAMPTZ | — | NOW() |

### 2. `public.customers`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | UUID | PK | `gen_random_uuid()` |
| user_id | UUID | FK → `auth.users(id)` ON DELETE SET NULL | NULL |
| name | TEXT | NOT NULL | — |
| email | TEXT | UNIQUE NOT NULL | — |
| phone | TEXT | — | NULL |
| dietary_preferences | TEXT[] | — | `'{}'` |
| allergens | TEXT[] | — | `'{}'` |
| daily_calorie_target | INTEGER | — | 2000 |
| daily_protein_target | INTEGER | — | 80 |
| created_at | TIMESTAMPTZ | — | NOW() |
| updated_at | TIMESTAMPTZ | — | NOW() |

### 3. `public.menu_items`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | UUID | PK | `gen_random_uuid()` |
| restaurant_id | UUID | FK → `restaurants(id)` ON DELETE CASCADE | NOT NULL |
| slug | VARCHAR(100) | — | NULL |
| name | TEXT | NOT NULL | — |
| description | TEXT | — | NULL |
| price | NUMERIC(10,2) | NOT NULL | 0.00 |
| category | TEXT | — | NULL |
| calories | INTEGER | — | 0 |
| protein | NUMERIC(6,2) | — | 0.00 |
| carbohydrates | NUMERIC(6,2) | — | 0.00 |
| fat | NUMERIC(6,2) | — | 0.00 |
| sugar | NUMERIC(6,2) | — | 0.00 |
| sodium | NUMERIC(6,2) | — | 0.00 |
| allergens | TEXT[] | — | `'{}'` |
| image | TEXT | — | NULL |
| badge | TEXT | — | NULL |
| badge_icon | TEXT | — | NULL |
| wellness_score | NUMERIC(5,2) | — | 85.00 |
| is_available | BOOLEAN | — | TRUE |
| created_at | TIMESTAMPTZ | — | NOW() |
| updated_at | TIMESTAMPTZ | — | NOW() |

### 4. `public.orders`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | UUID | PK | `gen_random_uuid()` |
| order_number | TEXT | UNIQUE NOT NULL | — |
| customer_id | UUID | FK → `customers(id)` ON DELETE SET NULL | NULL |
| restaurant_id | UUID | FK → `restaurants(id)` ON DELETE SET NULL | NULL |
| status | VARCHAR(50) | NOT NULL | `'pending'` |
| subtotal | NUMERIC(10,2) | NOT NULL | 0.00 |
| tax | NUMERIC(10,2) | — | 0.00 |
| delivery_fee | NUMERIC(10,2) | — | 0.00 |
| total_amount | NUMERIC(10,2) | NOT NULL | 0.00 |
| total_calories | INTEGER | — | 0 |
| average_meal_score | NUMERIC(5,2) | — | 0.00 |
| delivery_address | TEXT | — | NULL |
| delivery_time_estimate | TEXT | — | NULL |
| notes | TEXT | — | NULL |
| created_at | TIMESTAMPTZ | — | NOW() |
| updated_at | TIMESTAMPTZ | — | NOW() |

### 5. `public.order_items`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | UUID | PK | `gen_random_uuid()` |
| order_id | UUID | FK → `orders(id)` ON DELETE CASCADE | NOT NULL |
| menu_item_id | UUID | FK → `menu_items(id)` ON DELETE SET NULL | NULL |
| item_name | TEXT | NOT NULL | — |
| unit_price | NUMERIC(10,2) | NOT NULL | 0.00 |
| quantity | INTEGER | NOT NULL | 1 |
| total_price | NUMERIC(10,2) | NOT NULL | 0.00 |
| calories | INTEGER | — | 0 |
| protein | NUMERIC(6,2) | — | 0.00 |
| carbohydrates | NUMERIC(6,2) | — | 0.00 |
| fat | NUMERIC(6,2) | — | 0.00 |
| sugar | NUMERIC(6,2) | — | 0.00 |
| sodium | NUMERIC(6,2) | — | 0.00 |
| allergens | TEXT[] | — | `'{}'` |
| created_at | TIMESTAMPTZ | — | NOW() |

### 6. `public.inventory`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | UUID | PK | `gen_random_uuid()` |
| restaurant_id | UUID | FK → `restaurants(id)` ON DELETE CASCADE | NULL |
| ingredient_key | TEXT | — | NULL |
| name | TEXT | NOT NULL | — |
| current_stock | NUMERIC(10,2) | NOT NULL | 0 |
| threshold | NUMERIC(10,2) | NOT NULL | 0 |
| initial_stock | NUMERIC(10,2) | NOT NULL | 0 |
| unit | VARCHAR(50) | NOT NULL | `'units'` |
| status | VARCHAR(50) | — | `'Healthy'` |
| warning | TEXT | — | NULL |
| cost_per_unit | NUMERIC(10,2) | — | 0.00 |
| created_at | TIMESTAMPTZ | — | NOW() |
| updated_at | TIMESTAMPTZ | — | NOW() |

### 7. `public.recipes`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | UUID | PK | `gen_random_uuid()` |
| menu_item_id | UUID | FK → `menu_items(id)` ON DELETE CASCADE | NOT NULL |
| inventory_id | UUID | FK → `inventory(id)` ON DELETE CASCADE | NOT NULL |
| quantity_required | NUMERIC(10,2) | NOT NULL | 1.00 |
| unit | VARCHAR(50) | — | NULL |
| created_at | TIMESTAMPTZ | — | NOW() |
| updated_at | TIMESTAMPTZ | — | NOW() |
| | | UNIQUE(menu_item_id, inventory_id) | |

### 8. `public.analytics`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | UUID | PK | `gen_random_uuid()` |
| restaurant_id | UUID | FK → `restaurants(id)` ON DELETE CASCADE | NULL |
| date | DATE | NOT NULL | CURRENT_DATE |
| total_orders | INTEGER | — | 0 |
| revenue | NUMERIC(12,2) | — | 0.00 |
| average_meal_health_score | NUMERIC(5,2) | — | 0.00 |
| calories_served | BIGINT | — | 0 |
| popular_dish | TEXT | — | NULL |
| healthy_meal_percent | NUMERIC(5,2) | — | 0.00 |
| unhealthy_meal_percent | NUMERIC(5,2) | — | 0.00 |
| average_customer_satisfaction | NUMERIC(3,2) | — | 0.00 |
| insights | JSONB | — | `'[]'::jsonb` |
| metrics_payload | JSONB | — | `'{}'::jsonb` |
| created_at | TIMESTAMPTZ | — | NOW() |
| updated_at | TIMESTAMPTZ | — | NOW() |

### 9. `public.notifications`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | UUID | PK | `gen_random_uuid()` |
| restaurant_id | UUID | FK → `restaurants(id)` ON DELETE CASCADE | NULL |
| customer_id | UUID | FK → `customers(id)` ON DELETE CASCADE | NULL |
| title | TEXT | NOT NULL | — |
| message | TEXT | NOT NULL | — |
| type | VARCHAR(50) | NOT NULL | `'info'` |
| priority | VARCHAR(20) | — | `'medium'` |
| category | VARCHAR(50) | — | `'General'` |
| severity | VARCHAR(50) | — | `'information'` |
| is_read | BOOLEAN | — | FALSE |
| dedupe_key | TEXT | — | NULL |
| metadata | JSONB | — | `'{}'::jsonb` |
| created_at | TIMESTAMPTZ | — | NOW() |
| updated_at | TIMESTAMPTZ | — | NOW() |

### 10. `public.partner_applications`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | UUID | PK | `gen_random_uuid()` |
| user_id | UUID | FK → `auth.users(id)` ON DELETE CASCADE | NOT NULL |
| status | VARCHAR(50) | NOT NULL | `'pending_review'` |
| restaurant_name | TEXT | NOT NULL | — |
| description | TEXT | — | NULL |
| cuisine | TEXT | — | NULL |
| address | TEXT | — | NULL |
| submitted_at | TIMESTAMPTZ | — | NOW() |
| reviewed_at | TIMESTAMPTZ | — | NULL |
| created_at | TIMESTAMPTZ | — | NOW() |
| updated_at | TIMESTAMPTZ | — | NOW() |
| | | UNIQUE(user_id) | |

### 11. `profiles`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | UUID | PK, FK → `auth.users(id)` ON DELETE CASCADE | — |
| role | `user_role` (ENUM: `owner`, `customer`) | NOT NULL | — |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() |

---

## Relationships

| Parent | Child | Type | FK Column | On Delete |
|--------|-------|------|-----------|-----------|
| `auth.users` | `profiles` | 1:1 | `profiles.id` | CASCADE |
| `auth.users` | `restaurants` | 1:N | `restaurants.user_id` | CASCADE |
| `auth.users` | `customers` | 1:N | `customers.user_id` | SET NULL |
| `auth.users` | `partner_applications` | 1:N | `partner_applications.user_id` | CASCADE |
| `restaurants` | `menu_items` | 1:N | `menu_items.restaurant_id` | CASCADE |
| `restaurants` | `orders` | 1:N | `orders.restaurant_id` | SET NULL |
| `restaurants` | `inventory` | 1:N | `inventory.restaurant_id` | CASCADE |
| `restaurants` | `analytics` | 1:N | `analytics.restaurant_id` | CASCADE |
| `restaurants` | `notifications` | 1:N | `notifications.restaurant_id` | CASCADE |
| `customers` | `orders` | 1:N | `orders.customer_id` | SET NULL |
| `customers` | `notifications` | 1:N | `notifications.customer_id` | CASCADE |
| `orders` | `order_items` | 1:N | `order_items.order_id` | CASCADE |
| `menu_items` | `order_items` | 1:N | `order_items.menu_item_id` | SET NULL |
| `menu_items` | `recipes` | 1:N | `recipes.menu_item_id` | CASCADE |
| `inventory` | `recipes` | 1:N | `recipes.inventory_id` | CASCADE |

---

## Migrations

| # | Migration File | Timestamp | Purpose |
|---|---------------|-----------|---------|
| 1 | `20260726000000_create_production_schema.sql` | 2026-07-26 | Creates 9 base tables (restaurants → notifications), trigger function `update_updated_at_column()`, all BEFORE UPDATE triggers, 21 indexes, RLS + open-access policies |
| 2 | `20260726000001_add_auth_and_restaurant_link.sql` | 2026-07-26 | Adds `user_id` column to `restaurants`, creates index, rewrites RLS policies for tenant isolation on restaurants, orders, inventory, analytics, notifications |
| 3 | `20260727000000_add_user_profiles.sql` | 2026-07-27 | Creates `user_role` ENUM, `profiles` table (1:1 with `auth.users`), RLS for self-service select/insert/update |
| 4 | `20260730000001_create_partner_applications.sql` | 2026-07-30 | Creates `partner_applications` table with UNIQUE(user_id), RLS for self-service + admin via `service_role` |

A consolidated `full_production_schema.sql` is also provided in `supabase/` for manual SQL Editor execution.

---

## Authentication Flow

```
1. User visits /login
   ├─ Option A: Email + Password
   │    supabase.auth.signInWithPassword({ email, password })
   │
   └─ Option B: Google OAuth
        supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: "${origin}/auth/callback" }
        })

2. For OAuth: PKCE flow
   a. Browser redirected to Google consent screen
   b. Google redirects back to /auth/callback?code=...
   c. Server route exchanges code for session:
        supabase.auth.exchangeCodeForSession(code)
   d. Redirects to /dashboard

3. Middleware (proxy.ts):
   a. createServerClient() with request cookies
   b. supabase.auth.getUser() refreshes session
   c. If /dashboard/* and no user → redirect /login

4. AuthProvider (client-side Context):
   a. On mount: supabase.auth.getSession()
   b. Subscribe: supabase.auth.onAuthStateChange()
   c. On auth event:
      - Sync user/restaurant via getOrCreateRestaurantForUser()
      - Sync role via loadUserRole()
   d. Exposes: { user, session, restaurant, role, signOut, setRole }

5. Restaurant linking (getOrCreateRestaurantForUser):
   a. Lookup by user_id
   b. Fallback to email match
   c. Fallback to "urban-burger" slug
   d. Create Urban Burger with deterministic UUID
```

### Auth Methods

| Method | Function | File |
|--------|----------|------|
| Email sign-in | `signInWithEmail(email, password)` | `src/lib/supabase/auth.ts` |
| Email sign-up | `signUpWithEmail(email, password, name)` | `src/lib/supabase/auth.ts` |
| Google OAuth | `signInWithGoogle()` | `src/lib/supabase/auth.ts` |
| Sign out | `signOut()` | `src/lib/supabase/auth.ts` |
| Role fetch | `fetchUserRoleFromSupabase()` | `src/lib/userRole.ts` |
| Role save | `saveUserRoleToSupabase()` | `src/lib/userRole.ts` |

---

## RLS Policies

| Table | SELECT Policy | INSERT/UPDATE/DELETE Policy |
|-------|--------------|----------------------------|
| `restaurants` | Public | `auth.uid() = user_id` OR `user_id IS NULL` OR `auth.role() = 'anon'` |
| `menu_items` | Public | Full access (all users) |
| `customers` | Public | Full access (all users) |
| `orders` | `restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid())` OR `restaurant_id IS NULL` OR `auth.role() = 'anon'` | Same as SELECT |
| `order_items` | Public | Full access (all users) |
| `inventory` | `restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid())` OR `restaurant_id IS NULL` OR `auth.role() = 'anon'` | Same as SELECT |
| `recipes` | Public | Full access (all users) |
| `analytics` | `restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid())` OR `restaurant_id IS NULL` OR `auth.role() = 'anon'` | Same as SELECT |
| `notifications` | `restaurant_id IN (SELECT id FROM restaurants WHERE user_id = auth.uid())` OR `restaurant_id IS NULL` OR `auth.role() = 'anon'` | Same as SELECT |
| `profiles` | `auth.uid() = id` | INSERT: `auth.uid() = id`; UPDATE: `auth.uid() = id` |
| `partner_applications` | `auth.uid() = user_id` OR `auth.role() = 'service_role'` | Same as SELECT |

**Tenant isolation pattern**: `restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid())` restricts owners to only their restaurant data.

---

## Seeding Logic

File: `src/lib/supabase/seed.ts` — `seedDatabaseIfEmpty()`

### Seed Order

```
1. Restaurants (6):
   Upsert with onConflict: "slug"
   Data from fallbackRestaurants[] in menu.ts
   Deterministic UUIDs: 11111111-... through 66666666-...

2. Menu Items (~46):
   Execute only if menu_items count < 10
   Upsert with onConflict: "restaurant_id,slug"
   Mapped from fallbackRestaurants[].items
   Wellness score computed: min(99, max(70, round(100 - sugar*0.4 - fat*0.3)))

3. Inventory (20 ingredients):
   Execute only if inventory count === 0
   Upsert with onConflict: "ingredient_key"
   Base ingredients: chicken-patty, burger-bun, cheese-slice, lettuce, sauce, potato,
   cooking-oil, salt, soft-drink-bottle, tomato, cucumber, paneer, chicken-meat,
   pizza-dough, mozzarella, rice-basmati, flour-naan, quinoa, fruit-mix, milk-cream

4. Recipes (~180 rows):
   Execute only if recipes count === 0
   Derives from fallbackRecipeMap × menu_items
   Uses inventory_id → ingredient_key mapping
   Upsert with onConflict: "menu_item_id,inventory_id"
```

### Seeded Restaurants

| Restaurant | Slug | UUID | Cuisine | Items |
|------------|------|------|---------|-------|
| Urban Burger | `urban-burger` | `11111111-1111-4111-a111-111111111111` | Burgers & Fast Food | 10 |
| FireGrill Kitchen | `firegrill-kitchen` | `22222222-2222-4222-a222-222222222222` | American Grill | 7 |
| Green Garden Cafe | `green-garden-cafe` | `33333333-3333-4333-a333-333333333333` | Healthy Meals & Salads | 7 |
| Pizza Forge | `pizza-forge` | `44444444-4444-4444-a444-444444444444` | Pizza & Italian | 8 |
| Spice Route | `spice-route` | `55555555-5555-4555-a555-555555555555` | Indian | 6 |
| Fresh Bowl | `fresh-bowl` | `66666666-6666-4666-a666-666666666666` | Healthy Bowls & Juices | 6 |

### Guard Mechanism

```typescript
let seedingPromise: Promise<void> | null = null;

export async function seedDatabaseIfEmpty(): Promise<void> {
  if (seedingPromise) return seedingPromise;
  seedingPromise = (async () => { ... })();
  return seedingPromise;
}
```

---

## Helper Functions

### Generic CRUD (`src/lib/supabase/db.ts`)

| Function | Operation | Parameters |
|----------|-----------|------------|
| `getRestaurants()` | SELECT all | — |
| `getRestaurantById(id)` | SELECT by PK | `id: string` |
| `getRestaurantBySlug(slug)` | SELECT by slug | `slug: string` |
| `upsertRestaurant(restaurant)` | UPSERT | `restaurant: RestaurantInsert` |
| `updateRestaurant(id, updates)` | UPDATE | `id, updates` |
| `getMenuItems(restaurantId?)` | SELECT with optional filter | `restaurantId?: string` |
| `getMenuItemById(id)` | SELECT by PK | `id: string` |
| `upsertMenuItem(item)` | UPSERT | `item: MenuItemInsert` |
| `deleteMenuItem(id)` | DELETE | `id: string` |
| `getCustomerById(id)` | SELECT by PK | `id: string` |
| `getCustomerByEmail(email)` | SELECT by email | `email: string` |
| `upsertCustomer(customer)` | UPSERT | `customer: CustomerInsert` |
| `getOrders(filters?)` | SELECT with filters | `{ restaurantId?, customerId?, status? }` |
| `getOrderWithItems(id)` | SELECT with join | `id: string` |
| `createOrder(order, items)` | INSERT order + items transaction | `order, items[]` |
| `updateOrderStatus(orderId, status)` | UPDATE status | `orderId, status` |
| `getOrderItems(orderId)` | SELECT by order | `orderId: string` |
| `getInventory(restaurantId?)` | SELECT with filter | `restaurantId?: string` |
| `upsertInventoryItem(item)` | UPSERT | `item: InventoryInsert` |
| `updateInventoryStock(id, stock, status?, warning?)` | UPDATE stock | `id, currentStock, status?, warning?` |
| `getRecipes(menuItemId?)` | SELECT with filter | `menuItemId?: string` |
| `upsertRecipe(recipe)` | UPSERT | `recipe: RecipeInsert` |
| `getLatestAnalytics(restaurantId?, limit)` | SELECT with limit | `restaurantId?, limit = 30` |
| `recordAnalyticsSnapshot(snapshot)` | UPSERT | `snapshot: AnalyticsInsert` |
| `getNotifications(filters?)` | SELECT with filters | `{ restaurantId?, customerId?, unreadOnly? }` |
| `createNotification(notification)` | INSERT | `notification: NotificationInsert` |
| `markNotificationAsRead(id)` | UPDATE is_read | `id: string` |
| `createPartnerApplication(app)` | INSERT | `application: PartnerApplicationInsert` |
| `getPartnerApplicationByUserId(userId)` | SELECT by user | `userId: string` |
| `updatePartnerApplicationStatus(id, status)` | UPDATE status | `id, status` |

### Domain Helpers

| File | Functions | Purpose |
|------|-----------|---------|
| `auth.ts` | `getOrCreateRestaurantForUser()`, `signInWithEmail()`, `signUpWithEmail()`, `signInWithGoogle()`, `signOut()` | Authentication + restaurant linking |
| `menu.ts` | `fetchRestaurantsFromSupabase()`, `fetchMenuItemsFromSupabase()`, `loadRestaurantsWithFallback()`, `loadMenuItemsWithFallback()` | Restaurant/menu fetch with seeding + fallback |
| `orders.ts` | `saveOrderToSupabase()`, `loadLatestOrderFromSupabase()` | Order persistence + loading |
| `inventory.ts` | `fetchInventoryFromSupabase()`, `syncInventoryToSupabase()`, `loadInventoryWithFallback()`, `saveInventoryWithFallback()` | Inventory read/write with mapping |
| `analytics.ts` | `fetchAnalyticsFromSupabase()`, `syncAnalyticsToSupabase()`, `loadAnalyticsWithFallback()`, `saveAnalyticsWithFallback()` | Analytics read/write with mapping |
| `recipes.ts` | `getFallbackRecipe()`, `getRecipeIngredientsForOrder()` | Recipe ingredient resolution |
| `seed.ts` | `seedDatabaseIfEmpty()` | Idempotent production data seeding |

### Fallback Pattern

Every domain helper follows this pattern:

```typescript
async function fetchXxxFromSupabase(): Promise<Xxx | null> {
  try {
    const { data, error } = await query;
    if (error) { console.warn(...); return null; }
    if (data && data.length > 0) { return mapData(data); }
    return null;
  } catch (err) {
    console.warn(...); return null;
  }
}

async function loadXxxWithFallback(): Promise<Xxx> {
  const remote = await fetchXxxFromSupabase();
  if (remote) {
    persistXxx(remote);        // ← sessionStorage cache
    return remote;
  }
  return getStoredXxx();       // ← sessionStorage fallback
}
```

---

## Database Architecture Summary

- **11 tables** across 1 schema (`public`)
- **22 indexes** on FK columns, slugs, emails, statuses, dates, booleans
- **10 BEFORE UPDATE triggers** for automatic `updated_at` timestamp
- **11 RLS-enabled tables** with a mix of public-access and tenant-isolated policies
- **4 migration files** providing incremental schema evolution
- **Idempotent seeding** for 6 restaurants, ~46 menu items, 20 ingredients, ~180 recipes
- **31 exported helper functions** across 8 library files
- **Offline-first architecture** with 3-tier fallback chain: Supabase → sessionStorage → hardcoded defaults
