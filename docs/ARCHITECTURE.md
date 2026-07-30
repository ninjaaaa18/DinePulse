# Architecture — DinePulse System Architecture & Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Browser (User)                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Next.js 15 App (React 19, Tailwind CSS, Framer Motion)       │   │
│  │  ┌───────────────────┐  ┌──────────────┐  ┌─────────────────┐  │   │
│  │  │  App Router       │  │  Server       │  │  Client         │  │   │
│  │  │  ─ page.tsx       │  │  Components   │  │  Components     │  │   │
│  │  │  ─ layout.tsx     │  │  (RSC)        │  │  (RCC)          │  │   │
│  │  │  ─ (auth)/        │  │               │  │  ─ Hero         │  │   │
│  │  │  ─ (marketing)/   │  │               │  │  ─ AuthForm     │  │   │
│  │  │  ─ dashboard/     │  │               │  │  ─ Dashboard    │  │   │
│  │  └───────────────────┘  └──────────────┘  │  ─ AI Chat      │  │   │
│  │                                            └─────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────────────┐  │   │
│  │  │  State & Context Layer                                     │  │   │
│  │  │  ─ AuthProvider (session, user, restaurant, role)          │  │   │
│  │  │  ─ React Query (TanStack Query) for server state           │  │   │
│  │  │  ─ useRestaurantMenu                                       │  │   │
│  │  │  ─ useCustomerOrders / useRestaurantOrders                 │  │   │
│  │  │  ─ useInventory / useAnalytics                             │  │   │
│  │  └────────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │ HTTP / JSON
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Next.js Server (Node.js)                            │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  Middleware (proxy.ts)                                              │  │
│  │  ─ Session refresh on every request                                │  │
│  │  ─ Route guard: /dashboard/* → authenticated required              │  │
│  │  ─ /auth/callback → code exchange                                  │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  API Routes (/api/*)                                                │  │
│  │  ─ /api/ai → Gemini proxy (5 analysis types)                      │  │
│  │  ─ /api/auth/callback → PKCE code exchange                        │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  Server Actions & Direct Queries                                    │  │
│  │  ─ supabase server client (createServerClient)                     │  │
│  │  ─ RSC data fetching (direct DB reads)                             │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     Supabase (Backend-as-a-Service)                      │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │  PostgreSQL   │  │  Auth        │  │  Realtime    │  │  Storage   │  │
│  │  11 tables    │  │  PKCE OAuth  │  │  (available) │  │  (future)  │  │
│  │  RLS enabled  │  │  Email/Pass  │  │              │  │            │  │
│  │  22 indexes   │  │  Google OAuth │  │              │  │            │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Google Gemini 2.5 Flash (AI)                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  gemini-2.5-flash model                                            │  │
│  │  5 analyses types:                                                 │  │
│  │  ─ Menu Item Analysis                                              │  │
│  │  ─ Inventory Health                                                │  │
│  │  ─ Inventory Recommendation                                        │  │
│  │  ─ Order Summary                                                   │  │
│  │  ─ General Chat                                                    │  │
│  │  Structured JSON output via regex extraction                       │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```
dinepulse/
├── public/
│   ├── images/restaurants/        # 6 restaurant JPEG images
│   └── ...
├── src/
│   ├── app/                        # Next.js 15 App Router
│   │   ├── (auth)/                 # Auth pages
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── auth/callback/route.ts  # PKCE callback
│   │   ├── (marketing)/            # Public pages (landing)
│   │   │   └── page.tsx
│   │   ├── dashboard/              # Protected dashboard routes
│   │   │   ├── page.tsx            # Main dashboard
│   │   │   ├── menu/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── inventory/page.tsx
│   │   │   └── analytics/page.tsx
│   │   ├── ai/                     # AI chat page
│   │   ├── api/
│   │   │   ├── ai/route.ts         # Gemini API proxy
│   │   │   └── auth/callback/route.ts
│   │   ├── globals.css
│   │   └── layout.tsx              # Root layout + AuthProvider
│   ├── components/
│   │   ├── ui/                     # Reusable UI primitives
│   │   │   ├── RestaurantHeroImage.tsx
│   │   │   ├── MenuCard.tsx
│   │   │   ├── WellnessBadge.tsx
│   │   │   ├── NotificationBell.tsx
│   │   │   └── ...
│   │   ├── Hero.tsx                # Landing page hero
│   │   ├── AuthForm.tsx
│   │   ├── DashboardContent.tsx
│   │   ├── DashboardAI.tsx
│   │   └── RestaurantMenuList.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx          # Auth state management
│   ├── hooks/                      # TanStack Query hooks
│   │   ├── useRestaurantMenu.ts
│   │   ├── useCustomerOrders.ts
│   │   ├── useRestaurantOrders.ts
│   │   ├── useInventory.ts
│   │   └── useAnalytics.ts
│   ├── lib/
│   │   ├── ai.ts                   # Gemini server client
│   │   ├── aiClient.ts             # Client AI caller
│   │   ├── orderAnalysis.ts        # Payload builders + analysis engine
│   │   ├── restaurantImages.ts     # Image slug mapping
│   │   ├── userRole.ts             # Role management
│   │   └── supabase/               # Database library
│   │       ├── client.ts           # Browser client
│   │       ├── server.ts           # Server client
│   │       ├── types.ts            # TypeScript types
│   │       ├── db.ts               # Generic CRUD
│   │       ├── auth.ts             # Auth helpers
│   │       ├── menu.ts             # Menu queries
│   │       ├── orders.ts           # Order persistence
│   │       ├── inventory.ts        # Inventory queries
│   │       ├── analytics.ts        # Analytics queries
│   │       ├── recipes.ts          # Recipe resolution
│   │       └── seed.ts             # Database seeding
│   └── middleware.ts               # Route guard middleware
├── supabase/
│   ├── migrations/                 # 4 migration files
│   └── full_production_schema.sql  # Complete schema
├── docs/                           # Documentation
│   ├── PROJECT_AUDIT.md
│   ├── FEATURES.md
│   ├── AI_IMPLEMENTATION.md
│   ├── DATABASE.md
│   └── ARCHITECTURE.md
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── README.md
```

---

## Request Flows

### 1. Authentication Flow

```
User → [Browser] → /login
  → AuthForm RCC → supabase.auth.signInWithOAuth({ google })
  → Browser redirect → Google consent
  → Google redirect → /auth/callback?code=...
  → [Next.js Route Handler] → supabase.auth.exchangeCodeForSession(code)
  → Set cookies → redirect to /dashboard
  → [AuthProvider] → getSession() → getOrCreateRestaurantForUser()
  → User context updated → Dashboard renders
```

### 2. Dashboard Load Flow

```
User → [Browser] → /dashboard
  → [Middleware] → createServerClient → getUser()
  → If unauthenticated → redirect /login
  → If ok → proceed to page.tsx
  → [React Query] → useRestaurantMenu(restaurantId)
  → [Server] → fetchMenuItemsFromSupabase()
  → If DB has data → return mapped items
  → If empty → seedDatabaseIfEmpty() → return mapped items
  → If all fail → return fallbackData from menu.ts
  → [Client] → Renders MenuCards with WellnessBadges
```

### 3. AI Analysis Flow

```
User → [Dashboard AI component] → clicks "Analyze"
  → [Client] → buildAnalysisPayload(type, restaurantId)
  → POST /api/ai { type, restaurantId }
  → [API Route] → verifyMethod + parse params
  → [API Route] → getGeminiModel()
  → [AI Lib] → createGoogleGenerativeAI({ gemini-2.5-flash })
  → [API Route] → build systemPrompt(type, context) + userInput
  → [Gemini] → generate structured JSON
  → [API Route] → extractJsonFromText() regex extraction
  → Return parsed JSON → [Client] → render analysis cards
  → If error → retry(3× exponential backoff) → finally fallback UI
```

### 4. Order Fulfillment Flow

```
Customer → [Browser] → selects items → "Place Order"
  → [Client] → createOrder(orderPayload, items[])
  → [DB] → INSERT orders + order_items in transaction
  → [DB] → UPDATE inventory stock (deduct ingredients)
  → [Client] → invalidateQueries → re-fetch orders/inventory
  → [Dashboard] → Owner sees real-time order status
  → [AI] → Order Summary analysis available on demand
```

### 5. Inventory Sync Flow

```
Owner → [Dashboard Inventory] → update stock levels
  → [Client] → saveInventoryWithFallback(inventory[])
  → [DB] → upsertInventoryItem() for each item
  → [Client] → invalidateQueries → re-fetch inventory
  → [UI] → Status badges update: Healthy / Low Stock / Out of Stock
  → [AI] → Inventory Health + Recommendation analyses available
```

---

## Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 15 App Router | RSC + RCC hybrid, server-side data fetching, middleware auth |
| Styling | Tailwind CSS v4 | Utility-first, tree-shaking, consistent design system |
| Animation | Framer Motion | Declarative animations, layout animations, gesture support |
| Database | Supabase PostgreSQL | BaaS, built-in auth, RLS, real-time, migration tooling |
| AI | Google Gemini 2.5 Flash | Best cost/latency for JSON generation, 1M context window |
| Auth | Supabase Auth (PKCE) | Built-in OAuth, session management, RLS integration |
| State (server) | TanStack Query v5 | Automatic caching, stale-while-revalidate, background refetch |
| State (client) | React Context | Auth state (session, user, restaurant, role) |
| HTTP Client | Fetch API | Native, no extra dependency |
| Deployment | Vercel | Optimized for Next.js, edge functions, preview deployments |

---

## Performance Optimizations

- **RSC (React Server Components)**: Data fetching on server, minimal client JS
- **TanStack Query**: Automatic cache invalidation, background refetch, stale-while-revalidate
- **Middleware auth**: Session refresh without full page load
- **Image optimization**: Local JPEGs (`public/images/`) served by Next.js Image Optimization
- **Tree-shaking**: Only imported components bundled
- **Dynamic imports**: Heavy components (AI chat) loaded on interaction

---

## Security Considerations

- **Row-Level Security**: All tables RLS-enabled, tenant isolation via `user_id` filter
- **PKCE Auth Flow**: No client secrets, authorization code + code verifier
- **API Route validation**: Method checks, param sanitization, JSON parse guards
- **AI API key**: Server-only (never exposed to client), accessed via `process.env`
- **Cookie-based session**: HttpOnly cookies via Supabase SSR
- **TypeScript strictness**: Full type safety across DB ↔ Client boundary

---

## Dependencies (package.json)

### Core
- `next` 15.2.4
- `react` 19.0.0
- `react-dom` 19.0.0

### Database
- `@supabase/supabase-js` 2.110.8
- `@supabase/ssr` 0.12.3

### AI
- `@langchain/google-genai` 0.3.3 (LangChain integration)
- `@langchain/core` 0.3.43
- `@google/generative-ai` 0.24.0 (bare SDK)
- `langchain` 0.3.19

### UI/Styling
- `tailwindcss` 4.1.3 (v4)
- `@tailwindcss/postcss` (PostCSS plugin)
- `framer-motion` 12.6.3
- `lucide-react` icons
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-slot`
- `class-variance-authority`
- `clsx` / `tailwind-merge`

### State
- `@tanstack/react-query` 5.67.2

### Dev
- `typescript` 5.x
- `@types/react`, `@types/react-dom`, `@types/node`
- `postcss`, `autoprefixer`

---

## Deployment (Vercel)

| Property | Value |
|----------|-------|
| Platform | Vercel (Serverless + Edge) |
| Live URL | `https://dinepulse-sigma.vercel.app` |
| Environment Variables | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GOOGLE_API_KEY` |
| Node Version | 20.x (default) |
| Build Command | `next build` (standard) |
| Install Command | `npm install` |

### Deployment Checklist

- [x] Build passes with zero errors
- [x] Environment variables configured in Vercel dashboard
- [x] Supabase project URL + anon key set
- [x] Google AI API key set
- [x] Auth callback URL configured (`https://dinepulse-sigma.vercel.app/auth/callback`)
- [x] Supabase OAuth redirect origins configured
- [x] Static images in `/public` deploy correctly
- [x] Database migrations applied via Supabase dashboard
