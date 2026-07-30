# Project Audit — DinePulse

## Executive Summary

DinePulse is a production-ready, AI-powered restaurant management and food ordering platform built for VibeAthon 6.0 by team **CodeStrom**. It serves two distinct audiences — **restaurant owners** needing operational intelligence (inventory, analytics, health scores, demand predictions) and **customers** wanting nutritionally conscious meal ordering with AI-powered dietary insights. The platform integrates Google Gemini 2.5 Flash across 5 analysis types, uses Supabase PostgreSQL for persistence with sessionStorage fallback, and is deployed live on Vercel.

---

## Project Overview

| Attribute | Detail |
|-----------|--------|
| **Project Name** | DinePulse |
| **Version** | 0.1.0 |
| **Event** | VibeAthon 6.0 |
| **Team** | CodeStrom |
| **Live URL** | `https://dinepulse-sigma.vercel.app` |
| **Repository** | `github.com/ninjaaaa18/DinePulse` |
| **Stack** | Next.js 16.2.11, React 19.2.4, TypeScript 5.x, Tailwind CSS 4.x |
| **Database** | Supabase PostgreSQL (11 tables, RLS enabled) |
| **AI Engine** | Google Gemini 2.5 Flash (via @google/genai SDK) |
| **Auth** | Supabase SSR (Email/password + Google OAuth, PKCE flow) |
| **Build Status** | Zero errors (17 pages + 1 API route) |
| **Total Commits** | 27 |
| **Total Source Files** | 115 (80 .tsx, 33 .ts, 1 .css, 1 .ico) |

---

## Folder Structure

```
dinepulse/
├── src/
│   ├── app/
│   │   ├── api/ai/route.ts
│   │   ├── auth/callback/route.ts
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── ai-copilot/page.tsx
│   │   │   ├── ai-predictions/page.tsx
│   │   │   ├── allergy-safety/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   ├── browse-restaurants/page.tsx
│   │   │   ├── customer-health/page.tsx
│   │   │   ├── health-challenges/page.tsx
│   │   │   ├── inventory/page.tsx
│   │   │   ├── my-orders/page.tsx
│   │   │   ├── order-food/page.tsx
│   │   │   ├── restaurant-health/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── onboarding/choose-experience/page.tsx
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   ├── cards/
│   │   │   └── Card.tsx
│   │   ├── dashboard/
│   │   │   ├── ai-copilot/
│   │   │   │   └── AICopilotDashboard.tsx
│   │   │   ├── allergy-safety/
│   │   │   │   ├── AllergySafetyDashboard.tsx
│   │   │   │   └── allergySafetyData.ts
│   │   │   ├── customer-health/
│   │   │   │   ├── AIMealAnalysis.tsx
│   │   │   │   ├── CustomerHealthDashboard.tsx
│   │   │   │   ├── DailyNutritionSummary.tsx
│   │   │   │   ├── HealthWarningsPanel.tsx
│   │   │   │   ├── HealthierAlternatives.tsx
│   │   │   │   ├── MealHealthScoreOverview.tsx
│   │   │   │   ├── NutritionBreakdownCard.tsx
│   │   │   │   ├── NutritionRadarChart.tsx
│   │   │   │   ├── SelectedMealCard.tsx
│   │   │   │   └── customerHealthData.ts
│   │   │   ├── restaurant-health/
│   │   │   │   ├── HealthBreakdown.tsx
│   │   │   │   ├── HealthInsightsPanel.tsx
│   │   │   │   ├── HealthParameterCard.tsx
│   │   │   │   ├── HealthScoreOverview.tsx
│   │   │   │   ├── ImprovementSuggestions.tsx
│   │   │   │   ├── RestaurantHealthDashboard.tsx
│   │   │   │   ├── WeeklyTrendChart.tsx
│   │   │   │   └── restaurantHealthData.ts
│   │   │   ├── ActiveOrderProvider.tsx
│   │   │   ├── AICopilotWidget.tsx
│   │   │   ├── AIPredictionsDashboard.tsx
│   │   │   ├── AnalyticsDashboard.tsx
│   │   │   ├── BrowseRestaurantsDashboard.tsx
│   │   │   ├── InventoryDashboard.tsx
│   │   │   ├── MainDashboardView.tsx
│   │   │   ├── MyOrdersDashboard.tsx
│   │   │   ├── NotificationProvider.tsx
│   │   │   ├── OrderFoodDashboard.tsx
│   │   │   └── SettingsDashboard.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   └── RestaurantHeroImage.tsx
│   │   ├── Hero.tsx
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts
│       │   ├── server.ts
│       │   ├── index.ts
│       │   ├── types.ts
│       │   ├── db.ts
│       │   ├── auth.ts
│       │   ├── menu.ts
│       │   ├── orders.ts
│       │   ├── inventory.ts
│       │   ├── analytics.ts
│       │   ├── recipes.ts
│       │   └── seed.ts
│       ├── ai.ts
│       ├── aiClient.ts
│       ├── orderAnalysis.ts
│       ├── userRole.ts
│       ├── restaurantImages.ts
│       └── restaurantAnalyticsData.ts
├── supabase/
│   ├── migrations/
│   │   ├── 20260726000000_create_production_schema.sql
│   │   ├── 20260726000001_add_auth_and_restaurant_link.sql
│   │   ├── 20260727000000_add_user_profiles.sql
│   │   └── 20260730000001_create_partner_applications.sql
│   └── full_production_schema.sql
├── public/
│   └── images/restaurants/
│       ├── urban-burger.jpeg
│       ├── firegrill-kitchen.jpeg
│       ├── green-garden-cafe.jpeg
│       ├── pizza-forge.jpeg
│       ├── spice-route.jpeg
│       └── fresh-bowl.jpeg
├── proxy.ts
├── package.json
└── tsconfig.json
```

---

## Pages & Routes

| Route | Page Component | Audience | Purpose |
|-------|---------------|----------|---------|
| `/` | (landing) | All | Marketing landing page with restaurant showcase |
| `/login` | `login/page.tsx` | All | Email/password + Google OAuth sign-in |
| `/signup` | `signup/page.tsx` | All | New user registration |
| `/onboarding/choose-experience` | `choose-experience/page.tsx` | New users | Role selection (owner vs customer) |
| `/dashboard` | `dashboard/page.tsx` | All | Role-aware main dashboard with quick stats |
| `/dashboard/browse-restaurants` | `browse-restaurants/page.tsx` | Customer | 6-restaurant grid with cuisine and delivery info |
| `/dashboard/order-food` | `order-food/page.tsx` | Customer | Menu browsing, cart, and order placement |
| `/dashboard/customer-health` | `customer-health/page.tsx` | Customer | Nutrition breakdown, AI meal analysis, radar chart |
| `/dashboard/my-orders` | `my-orders/page.tsx` | Customer | Order history and status tracking |
| `/dashboard/allergy-safety` | `allergy-safety/page.tsx` | Customer | Interactive allergen screening and dietary safety |
| `/dashboard/health-challenges` | `health-challenges/page.tsx` | Customer | Gamified wellness challenges |
| `/dashboard/analytics` | `analytics/page.tsx` | Owner | Revenue/order trends and business insights |
| `/dashboard/inventory` | `inventory/page.tsx` | Owner | Ingredient stock tracking and restock alerts |
| `/dashboard/restaurant-health` | `restaurant-health/page.tsx` | Owner | Health score monitoring and AI insights |
| `/dashboard/ai-copilot` | `ai-copilot/page.tsx` | Owner | Full-page AI chat with live restaurant context |
| `/dashboard/ai-predictions` | `ai-predictions/page.tsx` | Owner | Demand forecasting with 6 prediction categories |
| `/dashboard/settings` | `settings/page.tsx` | Owner | Profile and restaurant settings |
| `/api/ai` | `api/ai/route.ts` | POST | Gemini proxy (5 analysis types) |
| `/auth/callback` | `auth/callback/route.ts` | GET | OAuth PKCE code exchange |

---

## Components

### Core UI Components

| Component | File | Usage |
|-----------|------|-------|
| `Card` | `components/cards/Card.tsx` | Reusable container with hover, border, and glow variants |
| `Button` | `components/ui/Button.tsx` | Styled button with primary/secondary/ghost variants and size options |
| `RestaurantHeroImage` | `components/ui/RestaurantHeroImage.tsx` | Image component with local-to-Unsplash fallback chain |
| `Hero` | `components/Hero.tsx` | Landing page hero with animated gradient and restaurant background |
| `Navbar` | `components/Navbar.tsx` | Top navigation with auth-aware links |
| `Sidebar` | `components/Sidebar.tsx` | Role-aware dashboard sidebar with navigation items |

### Dashboard Components

| Component | File | Purpose |
|-----------|------|---------|
| `MainDashboardView` | `components/dashboard/MainDashboardView.tsx` | Grid of stat cards (orders, revenue, health, inventory) |
| `BrowseRestaurantsDashboard` | `components/dashboard/BrowseRestaurantsDashboard.tsx` | 6-card restaurant grid with search/filter |
| `OrderFoodDashboard` | `components/dashboard/OrderFoodDashboard.tsx` | Menu items grid, cart sidebar, order placement |
| `CustomerHealthDashboard` | `components/dashboard/customer-health/CustomerHealthDashboard.tsx` | Full health analysis page with 7 macro cards |
| `AIMealAnalysis` | `components/dashboard/customer-health/AIMealAnalysis.tsx` | Client-side AI meal insights (protein/sugar thresholds) |
| `AllergySafetyDashboard` | `components/dashboard/allergy-safety/AllergySafetyDashboard.tsx` | Interactive health profile filters + ingredient screening |
| `RestaurantHealthDashboard` | `components/dashboard/restaurant-health/RestaurantHealthDashboard.tsx` | Health score, parameters, AI insights |
| `AICopilotDashboard` | `components/dashboard/ai-copilot/AICopilotDashboard.tsx` | Full-page AI chat with suggested prompts |
| `AICopilotWidget` | `components/dashboard/AICopilotWidget.tsx` | Floating AI chat bubble with live context |
| `AIPredictionsDashboard` | `components/dashboard/AIPredictionsDashboard.tsx` | 6-category demand forecast with confidence meters |
| `AnalyticsDashboard` | `components/dashboard/AnalyticsDashboard.tsx` | Revenue trends, top foods, health distribution |
| `InventoryDashboard` | `components/dashboard/InventoryDashboard.tsx` | 20-ingredient grid with status badges |
| `MyOrdersDashboard` | `components/dashboard/MyOrdersDashboard.tsx` | Order timeline with status indicators |
| `SettingsDashboard` | `components/dashboard/SettingsDashboard.tsx` | Profile form and partner application |

---

## Context Providers

| Provider | File | State Provided | Consumers |
|----------|------|----------------|-----------|
| `AuthProvider` | `components/auth/AuthProvider.tsx` | `user`, `session`, `restaurant`, `role`, `roleLoading`, `loading`, `signOut()`, `setRole()` | All authenticated components (wrapped in root layout) |
| `ActiveOrderProvider` | `components/dashboard/ActiveOrderProvider.tsx` | `activeOrder` (OrderAnalysisContext), `setActiveOrder()` | CustomerHealth, AllergySafety, RestaurantHealth, AICopilot, OrderFood, Predictions |
| `NotificationProvider` | `components/dashboard/NotificationProvider.tsx` | `notifications[]`, `notify()`, `dismissNotification()`, `clearNotifications()` | All dashboard components (AI copilot, predictions, health dashboards) |

---

## State Management

DinePulse uses **React Context** for all global state — no Redux, Zustand, or other external state libraries.

| State Type | Mechanism | Persistence |
|------------|-----------|-------------|
| Auth (user, session, role, restaurant) | `AuthProvider` (Context) | Supabase SSR cookies + React state |
| Active order context | `ActiveOrderProvider` (Context) | React state (sessionStorage for order analysis) |
| Notifications | `NotificationProvider` (Context) | React state |
| Inventory | Local state in InventoryDashboard | `sessionStorage` (via orderAnalysis.ts) |
| Analytics snapshots | Local state in AnalyticsDashboard | `sessionStorage` (via orderAnalysis.ts) |
| User role | `userRole.ts` (localStorage + DB) | `localStorage` + Supabase `profiles` table |
| Order analysis context | `orderAnalysis.ts` | `sessionStorage` |

---

## Third-party Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| `next` | 16.2.11 | Framework (App Router, server components, API routes) |
| `react` / `react-dom` | 19.2.4 | UI library |
| `@supabase/ssr` | 0.12.3 | Server-side-rendering auth helpers |
| `@supabase/supabase-js` | 2.110.8 | Supabase database client |
| `@google/genai` | 2.13.0 | Google Gemini AI SDK |
| `tailwindcss` | 4.x | Utility-first CSS framework |
| `@tailwindcss/postcss` | 4.x | PostCSS plugin for Tailwind v4 |
| `typescript` | 5.x | Type safety |
| `eslint` + `eslint-config-next` | 9.x / 16.2.11 | Linting |

---

## Performance Optimizations

- **Next.js Image component**: All restaurant images use `next/image` with `fill`, `object-cover`, and responsive `sizes` for automatic optimization
- **Local image assets**: 6 JPEG restaurant images served from `/public` (no external CDN dependencies for core visuals)
- **SessionStorage caching**: Inventory and analytics snapshots cached in sessionStorage to avoid redundant DB calls
- **Background Supabase sync**: `syncAnalyticsToSupabase()` and `syncInventoryToSupabase()` run as fire-and-forget promises (non-blocking)
- **Debounced AI context compilation**: `compileLiveDashboardContext()` runs only on user interaction (not on every render)
- **Lazy state initialization**: `useState(() => getStoredAnalyticsSnapshot())` — initializers run once, not on every render
- **Exponential backoff**: AI API calls retry with 1s → 2s → 4s delays (capped at 8s)
- **Graceful fallback chain**: Every external fetch has 2-3 fallback layers before showing empty state

---

## Accessibility

- ARIA labels on interactive elements (`aria-label="Toggle AI Restaurant Manager Copilot"`)
- Semantic HTML throughout (`<section>`, `<header>`, `<nav>`, `<main>`, `<button>` vs `<div>`)
- Keyboard-navigable filter chips and tab interfaces
- Role-based navigation hiding irrelevant links per user type
- Form labels and error states on login/signup forms
- Alt text on restaurant images via `alt` prop on `Image` component
- Proper heading hierarchy (h1 → h2 → h3) on every page

---

## Production Readiness

| Criterion | Status |
|-----------|--------|
| Build (`next build`) | Passes with zero errors |
| TypeScript strict mode | No explicit `any` in business logic |
| Environment variables | Properly separated (public vs server-only) |
| API key security | `GOOGLE_API_KEY` never exposed to client |
| Error boundaries | All AI calls wrapped in try/catch with user-friendly messages |
| Graceful degradation | All Supabase operations fall back to sessionStorage or hardcoded data |
| Responsive design | Tailwind responsive classes on every page |
| CSS isolation | Tailwind utility classes (no global style conflicts) |
| Linting | ESLint configured (`npm run lint`) |

---

## Deployment

| Detail | Value |
|--------|-------|
| **Platform** | Vercel |
| **Domain** | `dinepulse-sigma.vercel.app` |
| **Build Command** | `next build` |
| **Environment Variables** | `GOOGLE_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL` |
| **Middleware** | `proxy.ts` — session refresh + dashboard route guard |

---

## Project Statistics

| Metric | Value |
|--------|-------|
| Total commits | 27 |
| Contributors | 2 (ninjaaaa18, pratheekrao12) |
| Source files | 115 |
| Pages | 17 |
| API routes | 1 |
| Database tables | 11 |
| Migrations | 4 |
| NPM dependencies | 6 runtime + 7 dev |
| AI analysis types | 5 |
| Restaurants | 6 |
| Menu items | 46 |
| Inventory ingredients | 20 |
| Recipe templates | 14 |
| Lines of code (lib/supabase/) | ~2,960 |
| Lines of code (AI lib/) | ~252 |
| Lines of code (orderAnalysis.ts) | 598 |
| Build errors | 0 |
