# Features — DinePulse

## Customer Features

### Restaurant Discovery & Ordering

| Feature | Description | Implementation |
|---------|-------------|---------------|
| Browse Restaurants | Grid of 6 restaurants (Urban Burger, FireGrill Kitchen, Green Garden Cafe, Pizza Forge, Spice Route, Fresh Bowl) | `BrowseRestaurantsDashboard.tsx` with cuisine, delivery time, health score display |
| Menu Browsing | Per-restaurant menu with items, prices, nutritional data, badges | `OrderFoodDashboard.tsx` with category sections |
| Cart Management | Add/remove items, quantity adjustment, subtotal calculation | Inline cart within `OrderFoodDashboard.tsx` |
| Order Placement | Submit orders with order number generation | `saveOrderToSupabase()` with sessionStorage fallback |
| Order History | View past orders with status tracking | `MyOrdersDashboard.tsx` |

### Nutritional & Health Features

| Feature | Description | Implementation |
|---------|-------------|---------------|
| Nutrition Breakdown | 7 macro cards (calories, protein, carbs, fat, sugar, sodium, fiber) with progress bars | `NutritionBreakdownCard.tsx` in `CustomerHealthDashboard.tsx` |
| Meal Health Score | Aggregate score per order (0-100) based on nutritional balance | `MealHealthScoreOverview.tsx` |
| AI Meal Analysis | Gemini-powered structured health review with positives, risks, recommendations | `CustomerHealthDashboard.tsx` → `callAIAPI("meal-analysis")` |
| Daily Nutrition Summary | Running daily totals against configured targets (2000 kcal, 80g protein) | `DailyNutritionSummary.tsx` |
| Nutrition Radar Chart | Visual spider chart of all macros | `NutritionRadarChart.tsx` |
| Health Warnings | Alerts for exceeding sugar/sodium thresholds | `HealthWarningsPanel.tsx` |
| Healthier Alternatives | AI-suggested swaps for high-risk items | `HealthierAlternatives.tsx` |
| AI Insight Cards | Client-side analysis of protein/sugar per order | `AIMealAnalysis.tsx` |

### Dietary Safety Features

| Feature | Description | Implementation |
|---------|-------------|---------------|
| Medical Condition Filters | 5 conditions (Diabetes, Hypertension, Heart Disease, Thyroid, Kidney Issues) | Toggle chips in `AllergySafetyDashboard.tsx` |
| Dietary Preference Filters | 6 diets (Vegetarian, Vegan, Gluten-Free, Keto, Low-Carb, Low-Fat) | Toggle chips in `AllergySafetyDashboard.tsx` |
| Allergen Profile Filters | 5 allergens (Peanut, Milk, Egg, Soy, Tree Nuts) | Toggle chips in `AllergySafetyDashboard.tsx` |
| Real-time Ingredient Screening | Cross-checks order items against selected health profile | Dynamic card generation in `AllergySafetyDashboard.tsx` |
| Safe Alternatives | Suggests healthier substitutes for flagged items | Dynamic card generation in `AllergySafetyDashboard.tsx` |
| AI Dietary Safety Review | Gemini assesses allergy risks and suggests safer alternatives | `callAIAPI("dietary-safety")` |
| Safety Audit Timeline | 7-stage verification process display | `safetyTimeline` data in `allergySafetyData.ts` |
| Kitchen Protocol Cards | Operational guidance cards (danger/info/success) | `defaultAdviceCards` in `allergySafetyData.ts` |

### Gamification

| Feature | Description | Implementation |
|---------|-------------|---------------|
| Health Challenges | Gamified wellness goals with streak tracking | `health-challenges/page.tsx` |
| Activity Rewards | Achievement badges for healthy ordering patterns | Activity rewards dashboard |

---

## Restaurant Owner Features

### Operational Dashboards

| Feature | Description | Implementation |
|---------|-------------|---------------|
| Main Dashboard | Quick stats: active orders, revenue, health score, low stock count | `MainDashboardView.tsx` with role-aware rendering |
| Analytics Dashboard | Revenue/order trends, top-selling foods, health distribution, insights | `AnalyticsDashboard.tsx` |
| Inventory Management | 20-ingredient tracking with status badges (Healthy/Low/Critical) | `InventoryDashboard.tsx` |
| Restaurant Health | Composite health score (5 weighted parameters), AI insights | `RestaurantHealthDashboard.tsx` |
| Weekly Trend Chart | 7-day health score trend visualization | `WeeklyTrendChart.tsx` |
| Health Breakdown | Score component analysis with color coding | `HealthBreakdown.tsx` |
| Improvement Suggestions | Actionable recommendations for health score improvement | `ImprovementSuggestions.tsx` |

### AI-Powered Features

| Feature | Description | Implementation |
|---------|-------------|---------------|
| AI Copilot (Full Page) | Full chat interface with 6 suggested prompts and live dashboard context | `AICopilotDashboard.tsx` |
| AI Copilot (Floating Widget) | Persistent chat bubble accessible from any dashboard page | `AICopilotWidget.tsx` with drawer modal |
| Demand Predictions | 6-category forecasts (demand, inventory, peak hours, food waste, trending item, healthy demand) | `AIPredictionsDashboard.tsx` |
| Confidence Meters | Visual confidence bars with color coding (green ≥85%, amber ≥70%, red <70%) | `ConfidenceMeter` component in `AIPredictionsDashboard.tsx` |
| Action Plan Generator | Auto-generated action items from predictions | `ActionPlanSection` in `AIPredictionsDashboard.tsx` |
| AI Restaurant Health Insights | Gemini evaluates strengths, issues, and recommendations | `RestaurantHealthDashboard.tsx` → `callAIAPI("restaurant-health")` |

### Partner Management

| Feature | Description | Implementation |
|---------|-------------|---------------|
| Partner Application | "Become a Restaurant Partner" workflow with form submission | `SettingsDashboard.tsx` → `createPartnerApplication()` |
| Application Status Tracking | View submission status (pending_review, approved, rejected) | `SettingsDashboard.tsx` with status badge |

---

## Complete Feature Audit Table

| # | Feature | Category | Purpose | Key Files | AI Used | Supabase Used |
|---|---------|----------|---------|-----------|---------|---------------|
| 1 | User Authentication | Auth | Email/password + Google OAuth sign-in/sign-up | `AuthProvider.tsx`, `LoginForm.tsx`, `SignupForm.tsx`, `auth.ts` | No | Yes |
| 2 | Role Selection | Auth | Owner vs customer role choice on onboarding | `choose-experience/page.tsx`, `userRole.ts` | No | Yes |
| 3 | Restaurant Browsing | Customer | Browse 6 restaurants with cuisine and delivery info | `BrowseRestaurantsDashboard.tsx` | No | Yes |
| 4 | Menu Ordering | Customer | Browse menu, manage cart, place orders | `OrderFoodDashboard.tsx` | No | Yes |
| 5 | Order History | Customer | View past orders with status | `MyOrdersDashboard.tsx` | No | Yes |
| 6 | Nutrition Breakdown | Customer | 7 macro nutrients with progress bars | `NutritionBreakdownCard.tsx` | No | No |
| 7 | Meal Health Score | Customer | Aggregate per-order health score | `MealHealthScoreOverview.tsx` | No | No |
| 8 | AI Meal Analysis | Customer | Gemini reviews meal nutrition quality | `CustomerHealthDashboard.tsx` | Yes | No |
| 9 | AI Meal Insight Cards | Customer | Client-side protein/sugar analysis | `AIMealAnalysis.tsx` | No | No |
| 10 | Daily Nutrition Summary | Customer | Running daily totals vs targets | `DailyNutritionSummary.tsx` | No | No |
| 11 | Nutrition Radar Chart | Customer | Visual spider chart of macros | `NutritionRadarChart.tsx` | No | No |
| 12 | Health Warnings | Customer | Sugar/sodium threshold alerts | `HealthWarningsPanel.tsx` | No | No |
| 13 | Healthier Alternatives | Customer | Suggested food swaps | `HealthierAlternatives.tsx` | No | No |
| 14 | Allergy Safety Filters | Customer | Medical/diet/allergen toggle chips | `AllergySafetyDashboard.tsx` | No | No |
| 15 | Ingredient Screening | Customer | Real-time cross-check of items vs profile | `AllergySafetyDashboard.tsx` | No | No |
| 16 | AI Dietary Safety Review | Customer | Gemini allergy risk assessment | `AllergySafetyDashboard.tsx` | Yes | No |
| 17 | Safety Audit Timeline | Customer | 7-stage verification display | `AllergySafetyDashboard.tsx` | No | No |
| 18 | Kitchen Protocol Cards | Customer | Operational guidance cards | `AllergySafetyDashboard.tsx` | No | No |
| 19 | Health Challenges | Customer | Gamified wellness goals | `health-challenges/page.tsx` | No | No |
| 20 | Activity Rewards | Customer | Achievement badges | Activity rewards dashboard | No | No |
| 21 | Main Dashboard | Owner | Quick stats overview | `MainDashboardView.tsx` | No | No |
| 22 | Analytics Dashboard | Owner | Revenue trends, top foods, insights | `AnalyticsDashboard.tsx` | No | Yes |
| 23 | Inventory Management | Owner | 20-ingredient stock tracking | `InventoryDashboard.tsx` | No | Yes |
| 24 | Inventory Alerts | Owner | Low/Critical stock warning notifications | `InventoryDashboard.tsx` | No | No |
| 25 | Restaurant Health Score | Owner | Composite 5-parameter health score | `HealthScoreOverview.tsx` | No | No |
| 26 | Health Parameters | Owner | Individual parameter cards | `HealthParameterCard.tsx` | No | No |
| 27 | AI Restaurant Insights | Owner | Gemini evaluates strengths/issues/recommendations | `RestaurantHealthDashboard.tsx` | Yes | No |
| 28 | Weekly Health Trend | Owner | 7-day score chart | `WeeklyTrendChart.tsx` | No | No |
| 29 | Improvement Suggestions | Owner | Actionable recommendations | `ImprovementSuggestions.tsx` | No | No |
| 30 | AI Copilot (Full Page) | Owner | Chat interface with live context | `AICopilotDashboard.tsx` | Yes | No |
| 31 | AI Copilot (Widget) | Owner | Floating chat bubble | `AICopilotWidget.tsx` | Yes | No |
| 32 | AI Demand Predictions | Owner | 6-category forecasting | `AIPredictionsDashboard.tsx` | Yes | No |
| 33 | Action Plan Generator | Owner | Auto-generated action items | `AIPredictionsDashboard.tsx` | No | No |
| 34 | Partner Application | Owner | Restaurant partnership workflow | `SettingsDashboard.tsx` | No | Yes |
| 35 | Notification Center | All | In-app notification system | `NotificationProvider.tsx` | No | Yes |
| 36 | AI Notifications | All | Auto-triggered alerts for AI results | `AICopilotWidget.tsx` | Yes | No |
| 37 | Settings | All | Profile management | `SettingsDashboard.tsx` | No | Yes |
| 38 | Restaurant Images | All | Local JPEG ambience images | `restaurantImages.ts` | No | No |

---

## UI/UX Improvements

- **Dark theme**: Full dark UI with emerald accent color scheme (`#10b981` / `emerald`)
- **Gradient effects**: Card backgrounds, buttons, and score indicators use gradient borders and fills
- **Glow effects**: Interactive elements have shadow glows in theme color (`shadow-emerald/10`, `shadow-lg shadow-emerald/10`)
- **Hover states**: All cards and buttons have hover transitions (`hover:border-emerald/30`, `hover:bg-emerald/[0.03]`)
- **Consistent border styling**: `border border-white/5` or `border border-white/10` on all containers
- **Backdrop blur**: Modals and overlays use `backdrop-blur-md` for depth
- **Grid backgrounds**: Decorative `bg-grid-sm` overlay pattern on some containers
- **Radial gradient orbs**: Decorative blurred circles in widget backgrounds for visual depth

---

## Animations

| Animation | Implementation | Usage |
|-----------|---------------|-------|
| Fade-in-up page transitions | `animate-fade-in-up` class | All dashboard pages on initial render |
| Bouncing dots | `animate-bounce` with delay staggering | AI Copilot thinking indicator (3 dots at 0ms, 150ms, 300ms) |
| Pulse | `animate-pulse` | AI Copilot floating trigger button |
| Spin | `animate-spin` | AI loading spinner in Copilot widget |
| Ping | `animate-ping` | Notification indicator dot on Copilot button |
| Active scale | `active:scale-95` | Button press feedback |
| Hover scale | `hover:scale-110` | Copilot trigger button on hover |
| Smooth transitions | `transition-colors`, `transition-all`, `duration-300/500` | Cards, buttons, borders throughout |

---

## Notifications

The `NotificationProvider` powers an in-app notification center with:

| Notification Source | Trigger | Category | Severity |
|--------------------|---------|----------|----------|
| AI Meal Analysis | Analysis complete | `AI Insights` | `ai-generated` |
| AI Dietary Safety Review | Review complete | `AI Insights` | `ai-generated` |
| Dietary Risk Detected | High-risk level | `Customer Activity` | `critical` |
| Restaurant Health Updated | AI insight generated | `Orders` | `information` |
| AI Recommendation Generated | AI insights complete | `AI Insights` | `ai-generated` |
| AI Predictions Generated | Forecast complete | `AI Insights` | `ai-generated` |
| Low Stock Forecast | Critical/low inventory detected | `Inventory` | `critical` / `warning` |
| AI Copilot Recommendation | Each chat response | `AI Insights` | `ai-generated` |

Notifications support deduplication via `dedupeKey`, auto-truncation at 110 characters, and dismiss functionality.

---

## Future Scope

- Real-time order tracking via Supabase Realtime subscriptions
- Multi-language support (i18n)
- Payment gateway integration (Razorpay/Stripe)
- Push notifications via service workers
- Admin panel for reviewing partner applications
- Expanded recipe DB with per-restaurant ingredient mappings
- Image upload for restaurant logos and menu items via Supabase Storage
- Unit/integration tests (Jest + React Testing Library)
- Performance metrics dashboard with historical comparisons
- Mobile app via React Native or PWA
