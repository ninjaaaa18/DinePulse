# AI Implementation — DinePulse

## AI Architecture

DinePulse uses a **server-proxy pattern** for AI integration. The browser never holds or sees the `GOOGLE_API_KEY`. All requests route through a dedicated API route that proxies to Google Gemini.

```
┌─────────────┐     POST /api/ai      ┌───────────────┐     Gemini API     ┌──────────────────┐
│  Components  │ ──────────────────►   │  /api/ai/     │ ────────────────►  │  Google Gemini   │
│  (Client)    │                      │  route.ts      │                    │  2.5 Flash       │
│              │ ◄──────────────────   │  (Server)      │ ◄────────────────  │                  │
│  callAIAPI() │     JSON response     │  ai.ts         │    JSON content   │                  │
└─────────────┘                       └───────────────┘                    └──────────────────┘
```

### Key Components

| Component | File | Role |
|-----------|------|------|
| Server SDK | `src/lib/ai.ts` | Initializes Gemini, sends prompts, handles errors, returns structured results |
| Client SDK | `src/lib/aiClient.ts` | HTTP client with timeout, retry, error normalization |
| API Route | `src/app/api/ai/route.ts` | Request validation, prompt building, response normalization, fallback generation |
| Payload Builders | `src/lib/orderAnalysis.ts` | Builds typed data payloads for each analysis type |
| Dashboard Components | 7 components across 5 dashboard areas | UI for triggering and displaying AI results |

---

## Gemini Integration

| Property | Value |
|----------|-------|
| **SDK** | `@google/genai` v2.13.0 |
| **Model** | `gemini-2.5-flash` (configurable via options) |
| **Default Temperature** | 0.7 |
| **Authentication** | `GOOGLE_API_KEY` environment variable (server-only) |
| **API Style** | Single-shot `generateContent()` (no streaming) |
| **System Instructions** | Passed per-request via options |

### Server SDK (`src/lib/ai.ts`)

```typescript
export async function generateAIResponse(
  prompt: string,
  options?: { model?: string; temperature?: number; systemInstruction?: string }
): Promise<{ success: true; response: string; model: string }
         | { success: false; error: string; rawError?: string; statusCode?: number }>
```

Key behaviors:
- Reads `GOOGLE_API_KEY` from environment, returns 500 error if missing
- Creates `GoogleGenAI` client instance per request
- Returns structured result with `success` discriminator
- Catches errors, maps HTTP codes to user-friendly messages
- Never leaks raw error messages to the client

---

## API Flow

### Request Flow

```
1. Component calls callAIAPI({ type, prompt?, data? })
2. callAIAPI() POSTs to /api/ai with 25s timeout + AbortController
3. API route validates body (type, prompt, data)
4. buildPrompt(type, prompt, data) assembles type-specific prompt with schema
5. generateAIResponse(prompt) → Gemini API
6. normalizeAnalysis(type, rawResponse):
   a. Remove markdown code fences
   b. Try JSON.parse()
   c. Try regex extraction (extractJsonObject)
   d. Fall back to type-specific hardcoded default
7. Return { success, analysis, model } JSON response
8. callAIAPI() parses response, handles 429 with retry
9. Component displays analysis results
```

### Analysis Types

| Type | System Prompt Role | Expected JSON Shape | Consumers |
|------|--------------------|--------------------|-----------|
| `meal-analysis` | Certified Nutritionist | `{ summary, positives, risks, recommendations, improvedScore }` | CustomerHealthDashboard |
| `restaurant-health` | Restaurant Operations Consultant | `{ summary, strengths, issues, recommendations }` | RestaurantHealthDashboard |
| `dietary-safety` | Clinical Dietitian & Allergy Specialist | `{ summary, warnings, safeAlternatives, riskLevel }` | AllergySafetyDashboard |
| `prediction` | Demand Forecasting Analyst | `{ summary, predictions[] }` | AIPredictionsDashboard |
| `chat` | DinePulse AI Restaurant Manager | `{ reply }` | AICopilotDashboard, AICopilotWidget |

---

## Prompt Engineering

Every prompt follows a strict structure:

```
[Role definition]
Return valid JSON only. Do not wrap it in markdown. Do not include commentary.
Use this shape exactly: { ...schema... }
[Task description]
Data: { ...JSON data... }
[Optional: Additional context from user]
```

### Example: Meal Analysis Prompt

```
You are a Certified Nutritionist.

Return valid JSON only. Do not wrap it in markdown. Do not include commentary.

Use this shape exactly: {"summary": "...", "positives": ["..."], "risks": ["..."], "recommendations": ["..."], "improvedScore": 91}

Analyze the provided meal data for nutrition quality, health impact, and practical guidance.

Data:
{
  "meal": ["Chicken Burger x1", "French Fries x1"],
  "nutrition": { "calories": 842, "protein": 38, ... },
  "restaurant": "Urban Burger",
  "orderSummary": { "subtotal": 458, ... }
}
```

### Example: Chat Prompt (Copilot)

```
You are the DinePulse AI Restaurant Manager (Copilot).
Your goal is to give clear, expert, concise, actionable advice for restaurant operations,
inventory, customer health, menu strategy, food waste reduction, and sales performance
based on the provided live context data.

Return valid JSON only. Do not wrap it in markdown. Do not include commentary.

Use this shape exactly: {"reply": "..."}

User Question:
What should I restock today?

Current Live Dashboard Context Data:
{
  "inventory": { "totalIngredientsTracked": 20, "lowStockItemsCount": 3, ... },
  "analytics": { "totalOrders": 42, "revenue": 18450, ... },
  ...
}
```

---

## AI Copilot

### Full-Page Copilot (`AICopilotDashboard.tsx`)

- Chat interface with message history, timestamps, and copy-to-clipboard
- 6 suggested prompts: restock, promote, predict, improve, waste, underperforming
- Sends `compileLiveDashboardContext()` as data payload (inventory + analytics)
- Renders AI responses with markdown-like formatting (bold, headers, bullets)
- Empty state with tips sidebar

### Floating Widget (`AICopilotWidget.tsx`)

- Fixed-position trigger button (bottom-right) with pulse animation and glow effect
- 440px-wide drawer modal with backdrop blur
- 7 suggested prompts
- Auto-notification dispatch for each AI recommendation (truncated to 110 chars)
- Rich context includes: active order, full inventory, analytics, notifications, restaurant health, customer health, dietary safety, demand projection

### Copilot Context Payload

```typescript
{
  activeOrder: { orderId, restaurant, cuisine, items, totalCalories, averageMealScore, subtotal },
  inventory: { totalIngredientsTracked, lowStockItemsCount, lowStockIngredients, fullStockState },
  analytics: { totalOrders, revenue, averageMealHealthScore, popularDish, healthyMealPercent, ... },
  recentNotifications: [{ title, category, severity }],
  restaurantHealth: { name, cuisine, orderVolume, ... },
  customerHealth: { meal, nutrition, ... },
  dietarySafety: { customer, meal, nutrition, ... },
  aiPredictions: { projectedTomorrowDemand, projectedFoodWastePercent }
}
```

---

## Meal Analysis

### Trigger Points

- **Auto-triggered**: When a new order is loaded in `CustomerHealthDashboard` (via `useEffect` on `orderContext?.orderId`)
- **Manual**: User clicks "Analyze with AI" button

### Data Sent

```typescript
{
  meal: ["Chicken Burger x1", "French Fries x1"],
  nutrition: { calories, protein, carbohydrates, fat, sugar, sodium, fiber },
  restaurant: "Urban Burger",
  orderSummary: { subtotal, deliveryTime, averageMealScore }
}
```

### Response Parsing

`normalizeAnalysisPayload()` handles:
- Nested `{ analysis: { ... } }` structure
- Multiple key aliases: `positives` / `positivePoints`, `risks` / `healthRisks`, `recommendations` / `aiRecommendations`
- `improvedScore` / `score` fallback
- Missing fields default to empty arrays/null

---

## Allergy Analysis

### Trigger Points

- **Manual**: User clicks "Run Safety Review" button
- **Auto-reset**: Clears on new order (`useEffect` on `orderContext?.orderId`)

### Data Sent

```typescript
{
  customer: {
    name: "Guest",
    allergies: ["Peanuts", "Milk"],
    medicalConditions: ["Diabetes", "Hypertension"],
    diet: "Vegetarian, Low-Carb"
  },
  meal: { name: "Urban Burger", items: ["Classic Burger", "Loaded Fries"] },
  nutrition: { calories: 1200, sugar: 13, sodium: 1670 }
}
```

### Dual Notification Behavior

1. `"AI dietary review generated"` — always fires with severity `ai-generated`
2. `"Dietary safety risk detected"` — fires if `warnings.length > 0` or `riskLevel !== "low"`, severity `critical`

### Client-Side Screening

Even without AI, the dashboard performs real-time screening:
- Compares item allergens against selected allergy profile
- Flags items as Safe / Warning / Avoid
- Generates dynamic alternative suggestions

---

## Restaurant Health Analysis

### Trigger Points

- **Manual**: User clicks "Generate AI Insights" button

### Data Sent

```typescript
{
  restaurant: { name, cuisine, deliveryTime, orderVolume, averageTicket },
  order: { items, totalCalories, averageMealScore }
}
```

### Loading State

Displays a 4-step animated status during analysis:
1. Checking customer satisfaction...
2. Checking inventory...
3. Analyzing sales...
4. Generating recommendations...

### Dual Notification Behavior

1. `"Restaurant health updated"` — severity `information`
2. `"AI recommendation generated"` — severity `ai-generated`

---

## Demand Prediction

### Dual Mode

| Mode | Source | Description |
|------|--------|-------------|
| **Local Deterministic** | `createPredictions()` | 6 categories computed from analytics + inventory data (no API call) |
| **AI-Enhanced** | `generateAIForecast()` → `callAIAPI("prediction")` | Gemini analyzes same data for richer forecasts |

### Local Prediction Formula

| Prediction | Formula |
|------------|---------|
| Tomorrow's demand | `totalOrders > 0 ? Math.round(totalOrders * 1.12) : 32` |
| Inventory shortages | Filter by `status === "Critical"` or `status === "Low"` |
| Peak hours | `totalOrders >= 10 ? "7–9 PM" : "12–2 PM"` |
| Food waste | `Math.min(14, Math.max(2, Math.round(3 + consumedStock * 0.6 + lowIngredients.length)))` |
| Trending item | `popularDish || "Grill Chicken Bowl"` |
| Healthy demand | `Math.min(98, Math.max(0, Math.round(healthyMealPercent + 6)))` |

### Confidence Scoring

| Condition | Confidence |
|-----------|------------|
| Has historical data (`totalOrders > 0`) | 84% (demand), 93% (inventory), 88% (trending) |
| No historical data | 68% (demand), 77% (inventory), 70% (trending) |
| Critical items detected | 93% (inventory) |

---

## Error Handling

### Server-Side (`src/lib/ai.ts`)

| HTTP Code | Detected By | User-Friendly Message |
|-----------|-------------|----------------------|
| 429 / RESOURCE_EXHAUSTED / quota | `rawMessage.includes("429")` | "Gemini AI is temporarily busy due to rate limits..." |
| 503 / UNAVAILABLE / overloaded | `rawMessage.includes("503")` | "Gemini AI service is temporarily busy..." |
| 400 / INVALID_ARGUMENT | `rawMessage.includes("400")` | "Invalid request parameters for AI analysis." |
| 401 / 403 / API_KEY | `rawMessage.includes("401")` | "AI authentication error..." |
| Fallback | Default | "AI service encountered an internal error..." |

### Client-Side (`src/lib/aiClient.ts`)

| Error Type | Detection | User Message |
|------------|-----------|--------------|
| Timeout | `AbortError` or `message.includes("timeout")` | "AI request timed out. Please check your connection..." |
| Network | `TypeError` or `message.includes("fetch")` | "Network connection issue..." |
| HTTP 429 | `response.status === 429` | "Gemini AI is temporarily busy due to rate limits..." |
| HTTP 503 | `response.status === 503` | "AI service is temporarily busy..." |
| HTTP 500 | `response.status === 500` | "AI service encountered an internal error..." |
| HTTP 401/403 | `response.status === 401/403` | "AI authentication error..." |
| Raw JSON payload | Starts with `{` and ends with `}` | Scanned for 429/503 patterns, then generic fallback |

---

## Retry Strategy

```typescript
MAX_RETRIES = 3

for attempt 0..3:
    POST /api/ai with 25s timeout
    if response.status === 429:
        retryAfter = response.headers.get("Retry-After")
        delay = retryAfter || Math.min(1000 * 2^attempt, 8000)
        wait(delay)
        continue
    if response.ok && payload.success:
        return payload.analysis
    throw Error(handleAIError())

throw Error("Gemini AI is temporarily busy...")  // all retries exhausted
```

- **Max retries**: 3
- **Base delay**: 1s (exponential: 1s → 2s → 4s)
- **Cap**: 8s
- **Respects `Retry-After` header**: If present, uses exact value
- **Target**: Only 429 responses trigger retry; all other errors throw immediately

---

## Security

| Measure | Implementation |
|---------|---------------|
| API key isolation | `GOOGLE_API_KEY` in server-only `process.env`, never in client bundle |
| Server-proxy pattern | Client calls `/api/ai` only; Gemini API key never leaves server |
| Error sanitization | Raw Gemini errors logged server-side; client receives sanitized messages |
| Payload validation | API route validates `type`, `prompt`, `data` types before processing |
| No user data leakage | Hardcoded fallback payloads use sample data, not real user data |

---

## Files Involved

| File | Lines | Role |
|------|-------|------|
| `src/lib/ai.ts` | 94 | Server-side Gemini client wrapper |
| `src/lib/aiClient.ts` | 160 | Client-side API caller with retry + timeout |
| `src/app/api/ai/route.ts` | 260 | API proxy route with 5 prompt types |
| `src/lib/orderAnalysis.ts` | 598 | Payload builders + inventory/analytics engine |
| `src/components/dashboard/ai-copilot/AICopilotDashboard.tsx` | 302 | Full-page AI Copilot chat |
| `src/components/dashboard/AICopilotWidget.tsx` | 432 | Floating AI Copilot widget |
| `src/components/dashboard/AIPredictionsDashboard.tsx` | 426 | Demand prediction with AI + local modes |
| `src/components/dashboard/customer-health/CustomerHealthDashboard.tsx` | 427 | AI meal analysis integration |
| `src/components/dashboard/customer-health/AIMealAnalysis.tsx` | 79 | Client-side AI meal insight cards |
| `src/components/dashboard/allergy-safety/AllergySafetyDashboard.tsx` | 662 | AI dietary safety review |
| `src/components/dashboard/restaurant-health/RestaurantHealthDashboard.tsx` | 312 | AI restaurant health insights |
| `src/app/dashboard/ai-copilot/page.tsx` | — | Route page for AI Copilot |
| `src/app/dashboard/ai-predictions/page.tsx` | — | Route page for predictions |

**Total AI-related source files: 13**
**Total lines: ~3,692**
**Gemini API call sites: 5** (CustomerHealth, AllergySafety, RestaurantHealth, AIPredictions, AICopilot)
